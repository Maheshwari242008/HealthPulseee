-- =====================================================================
-- HealthPulse: admin_and_tests.sql
-- Run these ONE BLOCK AT A TIME in the SQL Editor (they are not a script).
-- =====================================================================

-- ---------------------------------------------------------------------
-- A. CREATE PRIVILEGED ACCOUNTS
-- Step 1: the person signs up normally in the app (they become 'user').
-- Step 2: find their id, then promote them. Never expose this to the app.
-- ---------------------------------------------------------------------
-- select id, email from auth.users order by created_at desc;

-- Make a user an administrator:
-- insert into public.user_roles (user_id, role)
-- values ('REPLACE-WITH-USER-UUID', 'administrator');

-- Make a user a lab technician (the lab must exist and be approved):
-- insert into public.user_roles (user_id, role, lab_id)
-- values ('REPLACE-WITH-USER-UUID', 'lab', '00000000-0000-0000-0000-000000000001');

-- Add and approve another lab:
-- insert into public.labs (name, approved) values ('City Path Lab', true) returning id;

-- Suspend a lab / revoke a role:
-- update public.labs set approved = false where id = 'LAB-UUID';
-- delete from public.user_roles where user_id = 'USER-UUID' and role = 'lab';

-- ---------------------------------------------------------------------
-- B. VERIFY THE ENGINE
-- ---------------------------------------------------------------------
-- Worked example from the project document: expect 0.627
-- (growth 120% is part of the score; the PDF's example table omits that row)
select public.risk_score(11, 5, 8, 1.0) as expected_0_627;

-- Hotspot should be MODERATE (~0.363) right after seeding
select * from public.calc_risk(
  (select id from public.areas where cell_lat = 17.67 and cell_lon = 75.91),
  (select id from public.diseases where name = 'dengue'));

-- Map data the app will receive (suppressed cells show NONE with null counts)
select * from public.get_cells('dengue');

-- Replay: the same data as of 7 days ago
select * from public.get_cells('dengue', current_date - 7);

-- Trend for the hotspot
select * from public.get_trend(
  (select id from public.areas where cell_lat = 17.67 and cell_lon = 75.91), 'dengue');

select * from public.alerts order by created_at desc;

-- ---------------------------------------------------------------------
-- C. DEMO: simulate the lab entering 4 cases (flips MODERATE -> HIGH)
-- Run as postgres in the editor; in the real app the lab does this.
-- ---------------------------------------------------------------------
-- insert into public.lab_reports (lab_id, disease_id, area_id, report_date, case_count)
-- select '00000000-0000-0000-0000-000000000001',
--        (select id from public.diseases where name = 'dengue'),
--        (select id from public.areas where cell_lat = 17.67 and cell_lon = 75.91),
--        current_date, 4;
-- select * from public.get_cells('dengue') where cell_lat = 17.67 and cell_lon = 75.91;  -- expect HIGH ~0.617
--
-- Reset the demo (removes today's live entry and rebuilds the stats):
-- delete from public.lab_reports where report_date = current_date;
-- delete from public.area_disease_stats;
-- insert into public.area_disease_stats (area_id, disease_id, stat_date, case_count)
--   select area_id, disease_id, report_date, sum(case_count) from public.lab_reports
--   group by area_id, disease_id, report_date;
-- delete from public.alerts; delete from public.risk_results;
-- select public.recompute_all(current_date);

-- ---------------------------------------------------------------------
-- D. SECURITY TESTS (simulate a logged-in citizen). Run the whole block;
-- ROLLBACK undoes it. Replace the UUID with any real user's id.
-- Each statement should FAIL with "permission denied" or "row-level security".
-- ---------------------------------------------------------------------
-- begin;
-- set local role authenticated;
-- select set_config('request.jwt.claims', '{"sub":"REPLACE-WITH-CITIZEN-UUID","role":"authenticated"}', true);
-- select * from public.lab_reports;                                  -- should return 0 rows or error
-- select * from public.area_disease_stats;                           -- permission denied
-- insert into public.user_roles (user_id, role) values ('REPLACE-WITH-CITIZEN-UUID', 'administrator');  -- denied
-- update public.profiles set full_name = 'x' where id = 'REPLACE-WITH-CITIZEN-UUID';   -- allowed (own profile)
-- select * from public.admin_dashboard();                            -- not authorized
-- rollback;

-- ---------------------------------------------------------------------
-- E. OPTIONAL: scheduled jobs (enable pg_cron in Dashboard > Database > Extensions first)
-- ---------------------------------------------------------------------
-- select cron.schedule('recompute-risk', '*/15 * * * *', $$select public.recompute_all(current_date)$$);
-- select cron.schedule('clean-alerts', '0 3 * * *', $$delete from public.alerts where expires_at < now() - interval '30 days'$$);