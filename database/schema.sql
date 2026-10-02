-- =====================================================================
-- HealthPulse: schema.sql
-- Run in Supabase SQL Editor, top to bottom, ONCE on a fresh project.
-- Roles: user, lab, administrator
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------
create table public.diseases (
  id int generated always as identity primary key,
  name text not null unique,
  severity numeric not null default 1.0 check (severity > 0 and severity <= 1.5),
  symptoms text,
  precautions text,          -- steps separated by new lines
  when_to_seek_care text
);

create table public.areas (   -- ~1 km grid cells
  id int generated always as identity primary key,
  name text,
  district text,
  state text,
  cell_lat numeric(6,2) not null,
  cell_lon numeric(6,2) not null,
  unique (cell_lat, cell_lon)
);

create table public.labs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  home_area_id int references public.areas(id),
  notification_enabled boolean not null default true,
  push_token text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'lab', 'administrator')),
  lab_id uuid references public.labs(id),
  created_at timestamptz not null default now(),
  unique (user_id, role),
  constraint lab_role_needs_lab check (role <> 'lab' or lab_id is not null)
);

create table public.lab_reports (   -- PRIVATE: aggregate counts only, no patient data
  id bigint generated always as identity primary key,
  lab_id uuid not null references public.labs(id),
  submitted_by uuid references auth.users(id),
  disease_id int not null references public.diseases(id),
  area_id int not null references public.areas(id),
  report_date date not null,
  case_count int not null check (case_count between 1 and 999),
  created_at timestamptz not null default now()
);
create index on public.lab_reports (area_id, disease_id, report_date);

create table public.area_disease_stats (   -- daily totals
  area_id int not null references public.areas(id),
  disease_id int not null references public.diseases(id),
  stat_date date not null,
  case_count int not null,
  primary key (area_id, disease_id, stat_date)
);

create table public.risk_results (   -- latest computed risk (used for alert comparison)
  area_id int not null references public.areas(id),
  disease_id int not null references public.diseases(id),
  as_of date not null,
  level text not null check (level in ('NONE','LOW','MODERATE','HIGH')),
  score numeric,
  recent int,
  prior int,
  growth_pct int,
  neighbor_cases int,
  neighbors_affected int,
  computed_at timestamptz not null default now(),
  primary key (area_id, disease_id, as_of)
);

create table public.alerts (
  id bigint generated always as identity primary key,
  area_id int not null references public.areas(id),
  disease_id int not null references public.diseases(id),
  severity text not null check (severity in ('LOW','MODERATE','HIGH')),
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz default (now() + interval '7 days')
);
create index on public.alerts (area_id, disease_id);

create table public.push_log (
  user_id uuid references auth.users(id) on delete cascade,
  alert_id bigint references public.alerts(id) on delete cascade,
  sent_at timestamptz not null default now()
);

-- one-row table the app subscribes to (Realtime) to know "refetch the map"
create table public.sync_ping (
  id int primary key default 1 check (id = 1),
  updated_at timestamptz not null default now()
);
insert into public.sync_ping (id) values (1);

-- ---------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ---------------------------------------------------------------------
create or replace function public.level_rank(p_level text)
returns int language sql immutable as $$
  select case p_level when 'LOW' then 1 when 'MODERATE' then 2 when 'HIGH' then 3 else 0 end
$$;

-- the scoring formula (worked example: 11, 5, 8, 1.0 -> 0.627)
create or replace function public.risk_score(p_recent int, p_prior int, p_neighbor int, p_severity numeric)
returns numeric language sql immutable as $$
  select round((
      0.5 * least(p_recent / 15.0, 1)
    + 0.3 * least(greatest((p_recent - p_prior)::numeric / greatest(p_prior, 1), 0) / 2, 1)
    + 0.2 * least(p_neighbor / 20.0, 1)
  ) * p_severity, 3)
$$;

create or replace function public.has_role(p_role text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid()) and ur.role = p_role
  )
$$;

-- the approved lab this user belongs to (null if none)
create or replace function public.my_lab_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select ur.lab_id
  from public.user_roles ur
  join public.labs l on l.id = ur.lab_id
  where ur.user_id = (select auth.uid()) and ur.role = 'lab' and l.approved
  limit 1
$$;

-- ---------------------------------------------------------------------
-- 3. SIGNUP TRIGGER: everyone starts as 'user'
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 4. RISK ENGINE
-- ---------------------------------------------------------------------
-- Pure calculation, writes nothing. Works for any date (used by replay).
create or replace function public.calc_risk(p_area int, p_disease int, p_as_of date default current_date)
returns table (level text, score numeric, recent int, prior int,
               growth_pct int, neighbor_cases int, neighbors_affected int)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_lat numeric; v_lon numeric; v_sev numeric;
  v_recent int; v_prior int; v_neighbor int; v_aff int;
  v_growth numeric; v_score numeric; v_level text;
begin
  select cell_lat, cell_lon into v_lat, v_lon from public.areas where id = p_area;
  select severity into v_sev from public.diseases where id = p_disease;
  if v_lat is null or v_sev is null then return; end if;

  select coalesce(sum(case_count) filter (where stat_date between p_as_of - 6 and p_as_of), 0)::int,
         coalesce(sum(case_count) filter (where stat_date between p_as_of - 13 and p_as_of - 7), 0)::int
    into v_recent, v_prior
  from public.area_disease_stats
  where area_id = p_area and disease_id = p_disease
    and stat_date between p_as_of - 13 and p_as_of;

  -- 8 neighbours; missing neighbours (grid edge) count as zero
  select coalesce(sum(n.r), 0)::int, (count(*) filter (where n.r > 0))::int
    into v_neighbor, v_aff
  from (
    select a.id, coalesce(sum(s.case_count), 0) as r
    from public.areas a
    left join public.area_disease_stats s
      on s.area_id = a.id and s.disease_id = p_disease
     and s.stat_date between p_as_of - 6 and p_as_of
    where a.id <> p_area
      and abs(a.cell_lat - v_lat) <= 0.01 and abs(a.cell_lon - v_lon) <= 0.01
    group by a.id
  ) n;

  v_growth := (v_recent - v_prior)::numeric / greatest(v_prior, 1);
  v_score  := public.risk_score(v_recent, v_prior, v_neighbor, v_sev);
  v_level  := case when v_recent < 3 then 'NONE'          -- privacy gate
                   when v_score < 0.25 then 'LOW'
                   when v_score < 0.55 then 'MODERATE'
                   else 'HIGH' end;

  return query select v_level, v_score, v_recent, v_prior,
                      round(v_growth * 100)::int, v_neighbor, v_aff;
end; $$;

-- Stores the result and creates an alert when the level RISES to MODERATE/HIGH
create or replace function public.compute_risk(p_area int, p_disease int, p_as_of date default current_date)
returns void language plpgsql security definer set search_path = '' as $$
declare
  r record; v_prev text; v_level text;
begin
  select * into r from public.calc_risk(p_area, p_disease, p_as_of);
  if not found then return; end if;
  v_level := r.level;

  select rr.level into v_prev
  from public.risk_results rr
  where rr.area_id = p_area and rr.disease_id = p_disease and rr.as_of <= p_as_of
  order by rr.as_of desc limit 1;

  insert into public.risk_results
    (area_id, disease_id, as_of, level, score, recent, prior, growth_pct, neighbor_cases, neighbors_affected)
  values
    (p_area, p_disease, p_as_of, v_level, r.score, r.recent, r.prior, r.growth_pct, r.neighbor_cases, r.neighbors_affected)
  on conflict (area_id, disease_id, as_of) do update set
    level = excluded.level, score = excluded.score, recent = excluded.recent,
    prior = excluded.prior, growth_pct = excluded.growth_pct,
    neighbor_cases = excluded.neighbor_cases, neighbors_affected = excluded.neighbors_affected,
    computed_at = now();

  if p_as_of = current_date
     and v_level in ('MODERATE','HIGH')
     and public.level_rank(v_level) > public.level_rank(coalesce(v_prev, 'NONE'))
     and not exists (
       select 1 from public.alerts al
       where al.area_id = p_area and al.disease_id = p_disease and al.severity = v_level
         and (al.expires_at is null or al.expires_at > now())
     )
  then
    insert into public.alerts (area_id, disease_id, severity, title, message)
    select p_area, p_disease, v_level,
           d.name || ' risk is ' || v_level,
           format('Increased %s activity has been detected in your area. This is a prototype indicator, not a diagnosis.', lower(d.name))
    from public.diseases d where d.id = p_disease;
  end if;
end; $$;

-- recompute a cell and its 8 neighbours
create or replace function public.recompute_neighbors(p_area int, p_disease int, p_as_of date default current_date)
returns void language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  for r in
    select b.id from public.areas a
    join public.areas b on abs(b.cell_lat - a.cell_lat) <= 0.01 and abs(b.cell_lon - a.cell_lon) <= 0.01
    where a.id = p_area
  loop
    perform public.compute_risk(r.id, p_disease, p_as_of);
  end loop;
end; $$;

create or replace function public.recompute_all(p_as_of date default current_date)
returns void language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  for r in select a.id as area_id, d.id as disease_id from public.areas a cross join public.diseases d loop
    perform public.compute_risk(r.area_id, r.disease_id, p_as_of);
  end loop;
end; $$;

-- ---------------------------------------------------------------------
-- 5. AGGREGATION TRIGGER: lab report -> daily stats -> risk -> alerts
-- ---------------------------------------------------------------------
create or replace function public.on_lab_report_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.area_disease_stats (area_id, disease_id, stat_date, case_count)
  values (new.area_id, new.disease_id, new.report_date, new.case_count)
  on conflict (area_id, disease_id, stat_date)
  do update set case_count = public.area_disease_stats.case_count + excluded.case_count;

  perform public.recompute_neighbors(new.area_id, new.disease_id, current_date);
  update public.sync_ping set updated_at = now() where id = 1;
  return new;
end; $$;

create trigger trg_lab_report_insert
after insert on public.lab_reports
for each row execute function public.on_lab_report_insert();

-- ---------------------------------------------------------------------
-- 6. PUBLIC RPCs (what the app calls; privacy gate applied here)
-- ---------------------------------------------------------------------
-- Map cells. Also serves the replay slider: pass p_as_of = a past date.
create or replace function public.get_cells(p_disease text default null, p_as_of date default current_date)
returns table (area_id int, cell_lat numeric, cell_lon numeric, disease text, level text,
               score numeric, recent int, growth_pct int, neighbor_cases int, neighbors_affected int)
language sql stable security definer set search_path = '' as $$
  select a.id, a.cell_lat, a.cell_lon, d.name, r.level,
         case when r.level = 'NONE' then null else r.score end,
         case when r.level = 'NONE' then null else r.recent end,
         case when r.level = 'NONE' then null else r.growth_pct end,
         case when r.level = 'NONE' then null else r.neighbor_cases end,
         case when r.level = 'NONE' then null else r.neighbors_affected end
  from public.areas a
  cross join public.diseases d
  cross join lateral public.calc_risk(a.id, d.id, p_as_of) r
  where p_disease is null or d.name = p_disease
  order by a.cell_lat desc, a.cell_lon, d.name
$$;

-- Active alerts for a cell plus its neighbours (is_nearby = true)
create or replace function public.get_area_alerts(p_area int)
returns table (alert_id bigint, area_id int, disease text, severity text, title text,
               message text, created_at timestamptz, is_nearby boolean, precautions text,
               symptoms text, when_to_seek_care text)
language sql stable security definer set search_path = '' as $$
  select al.id, al.area_id, d.name, al.severity, al.title, al.message, al.created_at,
         (al.area_id <> p_area), d.precautions, d.symptoms, d.when_to_seek_care
  from public.alerts al
  join public.areas a on a.id = al.area_id
  join public.diseases d on d.id = al.disease_id
  join public.areas me on me.id = p_area
  where (al.expires_at is null or al.expires_at > now())
    and abs(a.cell_lat - me.cell_lat) <= 0.01 and abs(a.cell_lon - me.cell_lon) <= 0.01
  order by (al.area_id <> p_area), al.created_at desc
$$;

-- Daily series for the chart. Returns nothing if the cell is suppressed.
create or replace function public.get_trend(p_area int, p_disease text, p_days int default 14)
returns table (stat_date date, cases int)
language sql stable security definer set search_path = '' as $$
  with d as (select id from public.diseases where name = p_disease)
  select g::date, coalesce(s.case_count, 0)::int
  from d
  cross join lateral public.calc_risk(p_area, d.id, current_date) gate
  cross join generate_series(current_date - (p_days - 1), current_date, interval '1 day') g
  left join public.area_disease_stats s
    on s.area_id = p_area and s.disease_id = d.id and s.stat_date = g::date
  where gate.level <> 'NONE'
  order by g
$$;

-- Administrator-only dashboard: real counts for every cell
create or replace function public.admin_dashboard(p_as_of date default current_date)
returns table (area_id int, area_name text, cell_lat numeric, cell_lon numeric, disease text,
               level text, score numeric, recent int, prior int, growth_pct int,
               neighbor_cases int, neighbors_affected int)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.has_role('administrator') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return query
    select a.id, a.name, a.cell_lat, a.cell_lon, d.name, r.level, r.score, r.recent, r.prior,
           r.growth_pct, r.neighbor_cases, r.neighbors_affected
    from public.areas a
    cross join public.diseases d
    cross join lateral public.calc_risk(a.id, d.id, p_as_of) r
    order by r.score desc nulls last;
end; $$;

-- ---------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.diseases           enable row level security;
alter table public.areas              enable row level security;
alter table public.labs               enable row level security;
alter table public.profiles           enable row level security;
alter table public.user_roles         enable row level security;
alter table public.lab_reports        enable row level security;
alter table public.area_disease_stats enable row level security;  -- no policies = no client access
alter table public.risk_results       enable row level security;  -- no policies = no client access
alter table public.alerts             enable row level security;
alter table public.push_log           enable row level security;  -- no policies = no client access
alter table public.sync_ping          enable row level security;

create policy "read diseases" on public.diseases for select to authenticated using (true);
create policy "read areas"    on public.areas    for select to authenticated using (true);
create policy "read ping"     on public.sync_ping for select to authenticated using (true);

create policy "read labs" on public.labs for select to authenticated
  using (public.has_role('administrator') or id = public.my_lab_id());

create policy "read own profile"   on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- no insert/update/delete policy on user_roles: nobody can change roles from the app
create policy "read own roles" on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or public.has_role('administrator'));

create policy "labs read own reports" on public.lab_reports for select to authenticated
  using (public.has_role('administrator') or lab_id = public.my_lab_id());
create policy "labs insert own reports" on public.lab_reports for insert to authenticated
  with check (
    public.has_role('lab')
    and lab_id = public.my_lab_id()
    and submitted_by = (select auth.uid())
    and report_date <= current_date
    and report_date >= current_date - 30
  );

create policy "read active alerts" on public.alerts for select to authenticated
  using (expires_at is null or expires_at > now());
create policy "admin insert alerts" on public.alerts for insert to authenticated
  with check (public.has_role('administrator'));
create policy "admin update alerts" on public.alerts for update to authenticated
  using (public.has_role('administrator')) with check (public.has_role('administrator'));
create policy "admin delete alerts" on public.alerts for delete to authenticated
  using (public.has_role('administrator'));

-- ---------------------------------------------------------------------
-- 8. GRANTS (table permissions + who may call which function)
-- Supabase gives anon/authenticated broad rights by default; remove them first.
-- ---------------------------------------------------------------------
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant select on public.diseases, public.areas, public.labs, public.user_roles,
                public.alerts, public.sync_ping, public.profiles, public.lab_reports
  to authenticated;
grant update (full_name, home_area_id, notification_enabled, push_token) on public.profiles to authenticated;
grant insert (lab_id, submitted_by, disease_id, area_id, report_date, case_count)
  on public.lab_reports to authenticated;
grant insert, update, delete on public.alerts to authenticated;

-- used inside RLS policies, so the logged-in role needs to be able to run them
grant execute on function public.has_role(text), public.my_lab_id() to authenticated;
-- RPCs called by the app
grant execute on function
  public.get_cells(text, date),
  public.get_area_alerts(int),
  public.get_trend(int, text, int),
  public.admin_dashboard(date)
to authenticated;

-- ---------------------------------------------------------------------
-- 9. REALTIME (app subscribes to alerts + sync_ping)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sync_ping') then
    alter publication supabase_realtime add table public.sync_ping;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'alerts') then
    alter publication supabase_realtime add table public.alerts;
  end if;
end $$;