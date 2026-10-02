-- =====================================================================
-- HealthPulse: seed.sql  (run AFTER schema.sql)
-- Synthetic data only. Dates are relative to today, so re-run on demo day.
-- Result: dengue hotspot at cell (17.67, 75.91) starts MODERATE (score ~0.363)
-- and flips to HIGH (~0.617) after 4 live-entered dengue cases dated today.
-- To use another city, change the 17.65 / 75.89 starting values and the
-- hotspot / malaria coordinates below.
-- =====================================================================

-- 1. Diseases (cholera and diarrhoea severities are guesses, unvalidated)
insert into public.diseases (name, severity, symptoms, precautions, when_to_seek_care) values
('dengue', 1.0,
 E'High fever, severe headache, pain behind the eyes, joint and muscle pain, rash',
 E'Remove standing water around your home\nUse mosquito repellent and nets\nWear long sleeves, especially at dawn and dusk\nKeep water containers covered',
 'Seek care for fever lasting over 2 days, severe stomach pain, bleeding, or persistent vomiting'),
('malaria', 1.0,
 E'Fever with chills, sweating, headache, nausea',
 E'Sleep under a mosquito net\nUse repellent\nDrain stagnant water\nComplete any prescribed treatment',
 'Seek care for any fever after mosquito exposure, especially with chills'),
('chikungunya', 0.9,
 E'Sudden fever, severe joint pain, swelling, rash',
 E'Remove standing water\nUse repellent and nets\nWear covering clothes',
 'Seek care if joint pain is severe or fever persists'),
('typhoid', 0.8,
 E'Prolonged fever, weakness, stomach pain, headache, loss of appetite',
 E'Drink boiled or treated water\nWash hands before eating\nEat freshly cooked food\nAvoid raw street food',
 'Seek care for fever lasting more than 3 days'),
('cholera', 1.0,
 E'Watery diarrhoea, vomiting, leg cramps, dehydration',
 E'Drink only safe water\nUse ORS for diarrhoea\nWash hands with soap\nCook food thoroughly',
 'Seek urgent care for heavy watery diarrhoea or signs of dehydration'),
('diarrhoea', 0.7,
 E'Loose watery stools, stomach cramps, dehydration',
 E'Drink safe water\nUse ORS\nWash hands with soap\nAvoid uncovered food',
 'Seek care if diarrhoea lasts over 2 days, there is blood, or signs of dehydration');

-- 2. 6 x 6 grid
insert into public.areas (name, district, state, cell_lat, cell_lon)
select 'Cell ' || (17.65 + i * 0.01) || ', ' || (75.89 + j * 0.01),
       'Solapur', 'Maharashtra',
       17.65 + i * 0.01, 75.89 + j * 0.01
from generate_series(0, 5) i
cross join generate_series(0, 5) j;

-- 3. Demo lab
insert into public.labs (id, name, approved)
values ('00000000-0000-0000-0000-000000000001', 'Demo Lab', true);

-- Bulk-load without firing the trigger; stats are rebuilt below
alter table public.lab_reports disable trigger trg_lab_report_insert;

-- 4. Hotspot + malaria cluster (explicit so the demo is predictable)
with s(dis, lat, lon, d, c) as (values
  -- dengue hotspot: 7 cases in last 7 days (days 2-6), 5 in the week before
  ('dengue', 17.67, 75.91,  2, 2), ('dengue', 17.67, 75.91,  3, 2), ('dengue', 17.67, 75.91,  4, 1),
  ('dengue', 17.67, 75.91,  5, 1), ('dengue', 17.67, 75.91,  6, 1),
  ('dengue', 17.67, 75.91,  7, 1), ('dengue', 17.67, 75.91,  8, 1), ('dengue', 17.67, 75.91,  9, 1),
  ('dengue', 17.67, 75.91, 11, 1), ('dengue', 17.67, 75.91, 13, 1),
  -- spillover in neighbours (each stays under 3, so they remain hidden)
  ('dengue', 17.68, 75.91, 2, 1), ('dengue', 17.68, 75.91, 4, 1),
  ('dengue', 17.67, 75.92, 3, 1), ('dengue', 17.67, 75.92, 5, 1),
  ('dengue', 17.66, 75.91, 3, 1), ('dengue', 17.66, 75.91, 6, 1),
  ('dengue', 17.66, 75.90, 4, 1),
  -- smaller malaria cluster elsewhere: 4 recent, 3 prior
  ('malaria', 17.69, 75.94, 2, 1), ('malaria', 17.69, 75.94, 3, 1),
  ('malaria', 17.69, 75.94, 4, 1), ('malaria', 17.69, 75.94, 6, 1),
  ('malaria', 17.69, 75.94, 8, 1), ('malaria', 17.69, 75.94, 10, 1), ('malaria', 17.69, 75.94, 12, 1)
)
insert into public.lab_reports (lab_id, disease_id, area_id, report_date, case_count)
select '00000000-0000-0000-0000-000000000001'::uuid, di.id, a.id, current_date - s.d, s.c
from s
join public.diseases di on di.name = s.dis
join public.areas a on a.cell_lat = s.lat and a.cell_lon = s.lon;

-- 5. Baseline noise: ~10% chance of 1 case per cell/disease/day.
--    Days 0 and 1 stay empty so the live entry causes the jump.
--    Skips the dengue hotspot neighbourhood and the malaria cell.
select setseed(0.42);
insert into public.lab_reports (lab_id, disease_id, area_id, report_date, case_count)
select '00000000-0000-0000-0000-000000000001'::uuid, d.id, a.id, current_date - g, 1
from public.areas a
cross join public.diseases d
cross join generate_series(2, 27) g
where random() < 0.10
  and not (d.name = 'dengue'
           and abs(a.cell_lat - 17.67) <= 0.01 and abs(a.cell_lon - 75.91) <= 0.01)
  and not (d.name = 'malaria' and a.cell_lat = 17.69 and a.cell_lon = 75.94);

alter table public.lab_reports enable trigger trg_lab_report_insert;

-- 6. Build daily stats from the reports
insert into public.area_disease_stats (area_id, disease_id, stat_date, case_count)
select area_id, disease_id, report_date, sum(case_count)
from public.lab_reports
group by area_id, disease_id, report_date
on conflict (area_id, disease_id, stat_date)
do update set case_count = excluded.case_count;

-- 7. Compute risk for every cell + create the starting alerts
select public.recompute_all(current_date);