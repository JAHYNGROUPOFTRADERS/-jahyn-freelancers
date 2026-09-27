# WINTER ARC — Personal Discipline Dashboard

A dark, premium, local-first personal dashboard for your Winter Arc: habits, wake-ups,
fitness, study, finance, weight, discipline and analytics in one command center.

**Track the process. Build the habit. Let the results follow.**

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (custom dark theme)
- Recharts (line / bar / donut charts)
- React Router (hash routing — works from any static host)
- 100% localStorage — no account, no server, private by default

## Features

- **Today** — greeting + dynamic Winter Arc day number, streak chips, progress ring,
  wake-up target vs actual (with ⚙️ time picker), goal card (85 kg → 70 kg), quick tiles,
  habit checklist, full editable daily timetable.
- **Habits** — add / rename / reorder / disable / delete habits; private discipline tracker;
  junk-food tracker (YES/NO + optional details); daily habit score.
- **Fitness** — manual workout logging (run/gym/yoga/…), pace calc, daily + weekly distance charts.
- **Weight** — weekly entries, trend line with target reference line, progress %, change/remaining.
- **Study** — focus timer (25/50/90/custom) with completion alert, session log by subject,
  subject bar chart, daily study-hours chart.
- **Finance** — expense tracker with categories, monthly budget ring + slider, category donut,
  daily spending bars, recent history.
- **Analytics** — six independent streaks, milestone badges (7/14/30/60/90),
  weight/run/study/spend charts, subject + weekly workout + habit bars, expense donut,
  GitHub-style consistency heatmap with per-day hover details, monthly report modal.
- **Calendar** — month grid with completion intensity; click any past/present day to view
  and edit its summary (key habits, note).
- **Settings** — arc start date & length, weights & target date (optional), times, goals,
  budget, currency, reminders (browser notifications), export / import JSON, reset with confirmation.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure

```
src/
  components  → (see ui/) reusable widgets
  data/       → default habits, routine, categories, quotes
  hooks/      → useNow (live clock)
  pages/      → Today, Habits, Fitness, Weight, Study, Finance, Analytics, Calendar, Settings
  state/      → store.tsx (context + actions), stats.ts (derived stats, streaks, heatmap)
  ui/         → primitives, controls, charts, heatmap, routine editor, confirm, toast
  utils/      → date & number helpers
```

## Notes

- The Winter Arc day number is calculated dynamically from the start date (default 1 October).
- Each streak is independent — one missed habit never destroys overall progress.
- Weight, calories and spending are manual entries; treat all numbers as trends, not verdicts.
- "Reset all data" asks for explicit confirmation before wiping.
