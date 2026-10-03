-- =====================================================================
-- HealthPulse: 002_app_features.sql
-- Run ONCE in the Supabase SQL Editor AFTER schema.sql and seed.sql.
-- Adds what the finished app screens need:
--   * administrators can create labs and approve / suspend them from the app
--   * alerts table is published to Realtime (the app subscribes to it)
-- =====================================================================

-- Administrator: create a lab ---------------------------------------
create or replace function public.admin_create_lab(p_name text, p_approved boolean default true)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not public.has_role('administrator') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'lab name is required';
  end if;
  insert into public.labs (name, approved) values (trim(p_name), p_approved) returning id into v_id;
  return v_id;
end; $$;

-- Administrator: approve / suspend a lab -----------------------------
create or replace function public.admin_set_lab_approval(p_lab uuid, p_approved boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.has_role('administrator') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.labs set approved = p_approved where id = p_lab;
end; $$;

revoke all on function public.admin_create_lab(text, boolean) from public, anon, authenticated;
revoke all on function public.admin_set_lab_approval(uuid, boolean) from public, anon, authenticated;
grant execute on function public.admin_create_lab(text, boolean) to authenticated;
grant execute on function public.admin_set_lab_approval(uuid, boolean) to authenticated;

-- Realtime for alerts (schema.sql already adds sync_ping) -------------
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'alerts') then
    alter publication supabase_realtime add table public.alerts;
  end if;
end $$;
