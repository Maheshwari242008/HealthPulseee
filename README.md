# Database (Supabase / PostgreSQL)

All SQL for HealthPulse. Run in the Supabase **SQL Editor** (Dashboard > SQL Editor > New query).

| File | Purpose | When to run |
|---|---|---|
| `schema.sql` | Tables, roles, signup trigger, risk engine, RPCs, RLS, grants, realtime | Once, on a fresh project |
| `seed.sql` | Diseases, 6 x 6 grid, demo lab, dengue hotspot, malaria cluster | After `schema.sql`. Re-run on demo day (dates are relative to today) |
| `admin_and_tests.sql` | Snippets: create admin/lab accounts, verify engine, demo, security tests | **One block at a time**, never the whole file |
| `reset.sql` | Drops everything | Development only |

## Setup order

1. Run `schema.sql`
2. Run `seed.sql`
3. Sign up two accounts in the app, then promote them with section A of `admin_and_tests.sql`
4. Run the checks in section B

To start over: run `reset.sql`, then steps 1 and 2 again.

## Roles

| Role | How it is granted |
|---|---|
| `user` | Automatic on signup (trigger). The app cannot choose a role. |
| `lab` | Promoted manually, linked to an approved row in `labs` |
| `administrator` | Promoted manually by the project owner |

Nobody can change roles from the app: `user_roles` has no insert, update or delete policy.

## Tables

| Table | Access from the app |
|---|---|
| `diseases`, `areas` | Read |
| `profiles` | Read and update own row (limited columns) |
| `user_roles` | Read own roles |
| `labs` | Administrators and the lab's own members |
| `lab_reports` | Insert and read by the owning lab. Read by administrators. **Private.** |
| `area_disease_stats`, `risk_results`, `push_log` | No access (RPCs only) |
| `alerts` | Read active alerts. Administrators manage. |
| `sync_ping` | Read, Realtime subscription to know when to refetch |

## Functions the app calls

```ts
supabase.rpc('get_cells', { p_disease: 'dengue', p_as_of: '2026-10-01' }) // map and replay
supabase.rpc('get_area_alerts', { p_area: 12 })                          // alerts for a cell + nearby
supabase.rpc('get_trend', { p_area: 12, p_disease: 'dengue', p_days: 14 })
supabase.rpc('admin_dashboard')                                          // administrators only
```

Lab submission: insert into `lab_reports` with the logged-in lab's token (`lab_id` from their role,
`submitted_by` = their user id). The database trigger does the aggregation, risk, and alerts.

## Privacy rules enforced in SQL

- No patient columns anywhere. `case_count` is limited to 1 to 999.
- Cells with fewer than 3 recent cases return `NONE` with null counts.
- Trend data is hidden for suppressed cells.
- Labs can only submit for their own lab, with dates in the last 30 days.

## Risk formula

```
growth   = (recent - prior) / max(prior, 1)
score    = (0.5 * min(recent/15, 1) + 0.3 * min(max(growth,0)/2, 1) + 0.2 * min(neighbor/20, 1)) * severity
NONE     recent < 3
LOW      score < 0.25
MODERATE 0.25 to < 0.55
HIGH     >= 0.55
```

Check: `select public.risk_score(11, 5, 8, 1.0);` returns `0.627`.

Thresholds and the cholera and diarrhoea severities are unvalidated.

## Demo

Seeded dengue hotspot at cell `17.67, 75.91` starts at MODERATE (about 0.363). Insert 4 dengue cases
dated today for that cell and it becomes HIGH (about 0.617).