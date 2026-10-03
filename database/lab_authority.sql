-- =====================================================================
-- HealthPulse: lab_authority.sql  (run AFTER schema.sql, in the Supabase SQL Editor)
-- Lets an administrator register licensed labs. The lab then signs up with the
-- official email and claims access with its lab code.
-- =====================================================================
alter table public.labs
  add column if not exists lab_code text unique,
  add column if not exists official_email text unique,
  add column if not exists city text,
  add column if not exists state text;

-- Admin: register a licensed lab
create or replace function public.admin_create_lab(
  p_name text, p_lab_code text, p_email text, p_city text, p_state text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not public.has_role('administrator') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_lab_code), '') = ''
     or coalesce(trim(p_email), '') = '' then
    raise exception 'name, lab code and official email are required';
  end if;
  insert into public.labs (name, approved, lab_code, official_email, city, state)
  values (trim(p_name), true, upper(trim(p_lab_code)), lower(trim(p_email)),
          nullif(trim(p_city), ''), nullif(trim(p_state), ''))
  returning id into v_id;
  return v_id;
end; $$;

-- Admin: list labs and whether the lab has signed up yet
create or replace function public.admin_list_labs()
returns table (id uuid, name text, lab_code text, official_email text, city text,
               state text, approved boolean, claimed boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.has_role('administrator') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return query
    select l.id, l.name, l.lab_code, l.official_email, l.city, l.state, l.approved,
           exists (select 1 from public.user_roles ur where ur.lab_id = l.id and ur.role = 'lab'),
           l.created_at
    from public.labs l
    order by l.created_at desc;
end; $$;

-- Admin: activate or deactivate a lab (deactivated labs can no longer insert reports)
create or replace function public.admin_set_lab_active(p_lab uuid, p_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.has_role('administrator') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.labs set approved = p_active where id = p_lab;
end; $$;

-- Lab person, after login: claim the lab for this account
-- (email must be verified, match the registered official email, and the lab code must match)
create or replace function public.claim_lab_access(p_lab_code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_email text; v_confirmed timestamptz; v_lab uuid;
begin
  select u.email, u.email_confirmed_at into v_email, v_confirmed
  from auth.users u where u.id = (select auth.uid());

  if v_email is null or v_confirmed is null then
    raise exception 'email not verified' using errcode = '42501';
  end if;

  select l.id into v_lab from public.labs l
  where l.approved
    and upper(l.lab_code) = upper(trim(p_lab_code))
    and lower(l.official_email) = lower(v_email);

  if v_lab is null then
    raise exception 'no active lab matches this email and lab code' using errcode = '42501';
  end if;

  insert into public.user_roles (user_id, role, lab_id)
  values ((select auth.uid()), 'lab', v_lab)
  on conflict (user_id, role) do nothing;
  return v_lab;
end; $$;

revoke execute on function
  public.admin_create_lab(text, text, text, text, text),
  public.admin_list_labs(),
  public.admin_set_lab_active(uuid, boolean),
  public.claim_lab_access(text)
from public, anon;

grant execute on function
  public.admin_create_lab(text, text, text, text, text),
  public.admin_list_labs(),
  public.admin_set_lab_active(uuid, boolean),
  public.claim_lab_access(text)
to authenticated;
