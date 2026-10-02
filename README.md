# HealthPulse

**Privacy-first disease outbreak early-warning app.**
Lab case counts in, explainable neighbourhood risk out. No patient data, ever.

> Prototype risk indicator. Not a validated medical prediction and not a diagnosis.

---

## The problem

Dangerous, fast-spreading diseases (dengue, malaria, chikungunya, typhoid, cholera, diarrhoea) usually become visible to the public only after they have already grown. Laboratories see the early signal, but that data stays inside the lab and reaches residents late, if at all. Sharing patient data openly is not an option: it breaks privacy, can stigmatise patients, and can re-identify people when case counts are small.

## Our solution

Laboratories submit **aggregate case counts by area, never patient details**. The backend groups them into roughly 1 km grid cells and hides any cell with fewer than 3 recent cases. A transparent scoring engine rates each cell **LOW, MODERATE or HIGH**. Residents get a plain-language alert with prevention steps. Health authorities get a hotspot dashboard.

**Core idea:** a privacy gate combined with an explainable risk score that shows exactly why an area is flagged.

## Features

- Citizen app: current area risk, risk map, alert detail with a "why this alert" panel, prevention tips
- Lab case entry: disease, date, area and count only
- Authority dashboard: cases by area, 14-day trend, alert list, replay slider
- Role-based access: citizen, lab, authority
- Live updates with Supabase Realtime
- In-app alert feed, with push notifications where supported

## Tech stack

| Area | Choice |
|---|---|
| Mobile app | React Native, Expo SDK 54 (Expo Go compatible), TypeScript |
| Routing | Expo Router |
| Data fetching | TanStack Query |
| Backend and database | Supabase (PostgreSQL, PostGIS, Edge Functions, Realtime) |
| Authentication | Supabase Auth |
| Maps | react-native-maps |
| Notifications | Expo Notifications |
| Version control | Git and GitHub |

## Getting started

### Prerequisites

- Node.js 18 or later
- Git
- Expo Go on your phone (install from the Play Store or App Store)
- A Supabase project (ask the backend team for the URL and anon key)

### Install and run

```bash
git clone https://github.com/Maheshwari242008/HealthPulseee.git
cd HealthPulseee
npm install
cp .env.example .env
npx expo start
```

On Windows PowerShell, use `copy .env.example .env` instead of `cp`.

Scan the QR code with Expo Go.

### Environment variables

Create a `.env` file in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> Never commit `.env`. Never use the Supabase **service role key** in the app. It belongs only in Edge Function secrets.

### Creating the project from scratch (for reference)

Everyone on the team must use the same Expo SDK so the project opens in the store version of Expo Go:

```bash
npx create-expo-app@latest --template default@sdk-54
```

Install the dependencies with `npx expo install` so versions match the SDK:

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
npx expo install expo-notifications expo-device expo-location expo-secure-store
npx expo install react-native-maps react-native-svg
npm install @tanstack/react-query react-native-chart-kit
```

## Project structure

```
HealthPulse/
├── app/                  Expo Router screens
│   ├── (auth)/           login, signup
│   ├── (citizen)/        home, map, notifications, profile, alert/[id], disease/[id]
│   ├── (lab)/            case-entry, history
│   └── (authority)/      dashboard, replay
├── assets/
├── components/           auth, common, dashboard, map, alerts, disease,
│                         trend, casesEntry, notifications, onboarding,
│                         animation, skeletonScreens
├── constants/            risk levels, diseases, config (privacy threshold = 3)
├── context/              AuthContext, AreaContext
├── hooks/                alerts, map, trend, reports, notifications, profile
├── lib/                  supabase client, query client, notifications setup
├── services/             all Supabase calls live here
├── types/
├── theme/
├── utils/                grid helpers, risk formatting, validation
├── database/             schema, RLS policies, SQL functions, seed, tests
├── backend/              Edge Functions (submit-report, send-alerts)
└── docs/                 API contract, DB diagram, privacy notes, demo script
```

Rule of thumb: screens call hooks, hooks call services, and services call Supabase.

## How it works

```
Lab -> submit-report (Edge Function) -> lab_reports (private)
    -> aggregation -> area_disease_stats
    -> compute_risk -> risk_results
    -> alerts -> notifications
    -> Citizen app (aggregates only)
```

### Risk scoring

For each (area, disease) pair, the engine compares two consecutive 7-day windows.

```
recent   = cases in last 7 days
prior    = cases in the 7 days before that
growth   = (recent - prior) / max(prior, 1)
neighbor = recent cases in the 8 adjacent cells

if recent < 3: level = NONE

score = 0.5 * min(recent / 15, 1)
      + 0.3 * min(max(growth, 0) / 2, 1)
      + 0.2 * min(neighbor / 20, 1)
score *= severity[disease]
```

| Level | Score |
|---|---|
| NONE | Hidden (fewer than 3 recent cases) |
| LOW | below 0.25 |
| MODERATE | 0.25 to below 0.55 |
| HIGH | 0.55 or above |

Thresholds and severity weights are unvalidated and for demonstration only.

## Privacy by design

- No patient fields exist anywhere (no name, age, address, phone or exact coordinates).
- `lab_reports` is private. Citizens can only read aggregated views and RPCs.
- Row Level Security is on for every table.
- Server-side field whitelisting on every submission.
- Alerts are per grid cell, never a radius around a case.
- A 1 km grid with a minimum of 3 cases reduces, but does not eliminate, re-identification risk.

## Database overview

| Table | Purpose |
|---|---|
| `profiles` | Role, home area, notification settings |
| `diseases` | Names, severity, symptoms, precautions |
| `areas` | Grid cells with location |
| `lab_reports` | Private lab submissions (aggregate counts) |
| `area_disease_stats` | Daily aggregated counts |
| `risk_results` | Level, score and explanation per area and disease |
| `alerts` | Generated alerts shown to residents |

## Team workflow

1. Never push directly to `main`.
2. Create a branch per task, for example `feature/map-screen`.
3. Open a pull request and get one review before merging.
4. Daily standup in `#standup`. Errors go in `#sos`.

```bash
git checkout -b feature/your-task
git add .
git commit -m "describe your change"
git push -u origin feature/your-task
```

## Testing checklist

- [ ] A citizen cannot read `lab_reports`
- [ ] A lab cannot read another lab's rows
- [ ] A submission with an extra name field is stripped or rejected
- [ ] A cell with 2 recent cases shows `NONE`
- [ ] A cell with 3 recent cases is scored normally
- [ ] `prior = 0` causes no divide-by-zero
- [ ] Worked example (11 recent, 5 prior, 8 neighbour cases, dengue) scores about 0.63, HIGH
- [ ] An alert is created once per level change, not on every recompute

## Limitations

- Seed data is synthetic.
- Not a validated medical tool; never use it for diagnosis.
- False alarms cause anxiety and missed alarms cause harm. A real deployment needs health-authority oversight and epidemiological validation of thresholds.
- Remote push notifications may need a development build instead of Expo Go.

## Future scope

Real lab integrations, SMS alerts, anomaly detection (EWMA, CUSUM), spatial clustering, forecasting, differential-privacy noise, symptom self-reporting, multilingual alerts, and weather or wastewater signals.

## Team

| Name | Role |
|---|---|
| Maheshwari | Backend |
| Dipika | |
| Shirisha | |
| Shravanti | |

---

*Last updated: 2 October 2026*