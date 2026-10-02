-- =====================================================================
-- HealthPulse: reset.sql   *** DEVELOPMENT ONLY ***
-- Deletes ALL HealthPulse tables, functions and data so you can re-run
-- schema.sql and seed.sql from scratch. It does NOT delete auth users.
-- NEVER run this on a project that holds real data.
-- =====================================================================

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.push_log cascade;
drop table if exists public.sync_ping cascade;
drop table if exists public.alerts cascade;
drop table if exists public.risk_results cascade;
drop table if exists public.area_disease_stats cascade;
drop table if exists public.lab_reports cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.profiles cascade;
drop table if exists public.labs cascade;
drop table if exists public.areas cascade;
drop table if exists public.diseases cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.on_lab_report_insert() cascade;
drop function if exists public.recompute_all(date);
drop function if exists public.recompute_neighbors(int, int, date);
drop function if exists public.compute_risk(int, int, date);
drop function if exists public.calc_risk(int, int, date);
drop function if exists public.get_cells(text, date);
drop function if exists public.get_area_alerts(int);
drop function if exists public.get_trend(int, text, int);
drop function if exists public.admin_dashboard(date);
drop function if exists public.has_role(text);
drop function if exists public.my_lab_id();
drop function if exists public.risk_score(int, int, int, numeric);
drop function if exists public.level_rank(text);