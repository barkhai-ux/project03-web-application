# Final — a quiet habit tracker

Live: **https://project03-web-application.vercel.app/**

Final is a deliberately small habit tracker. Sign in, define habits, check in daily, watch streaks build on a contribution-style heatmap. No notifications, no medals, no streak shame.

Built as the Project 3 capstone for the Claude Code course (35% weight, weeks 13–16).

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19) with TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Supabase Postgres + Auth + Row-Level Security |
| DB client | `@supabase/ssr` (cookie-backed, no service role in the app surface) |
| Validation | Zod, on every server action |
| Charts | Hand-rolled SVG heatmap (`components/heatmap.tsx`) |
| Tests | Vitest — 13 cases across streaks and digest |
| Deploy | Vercel (production at the URL above) |
| AI tooling | Project skill at `.claude/skills/habit-tracker/SKILL.md`; Supabase MCP for migrations |

---

## Architecture

```
                                       cookies (session)
Browser ──▶ Next.js (Server Components + Server Actions) ──▶ Supabase Postgres
              │                                                    │
              ▼                                                    ▼
         middleware.ts                                        RLS policies
   (refresh session, gate                                  (auth.uid() = user_id
    auth-required routes)                                   on every table)

 Vercel Cron ─POST /api/cron/digests──▶ digest generator ─▶ digests table
            (Authorization: Bearer CRON_SECRET)
```

- **Auth**: email + password via Supabase. Sessions live in HTTP-only cookies, refreshed by `middleware.ts`. Public routes (`/`, `/u/[slug]`, `/login`, `/auth/*`) skip the refresh round-trip.
- **Mutations**: every write goes through a Server Action under `app/actions/`. The browser never holds a Supabase admin key. RLS policies are the only access control.
- **Streak math**: pure functions in `lib/streaks.ts`, unit-tested. Always evaluated in the user's IANA timezone via `lib/dates.ts` — never `new Date().toISOString().slice(0, 10)`.
- **Daily digest**: a pure builder in `lib/digests.ts` produces a short reflection per user (completion %, longest streak, highlight habit, friendly message). Can be triggered manually from the dashboard or autonomously via the cron endpoint.

---

## Features

### Core
- **Email/password auth** with auto-provisioned profile row (Postgres trigger `handle_new_user`).
- **Habits CRUD** — name, color, daily/weekly cadence, target per period, archive/restore, hard delete (with cascade).
- **Counter habits** — for habits with a target > 1 (water 8 cups, push-ups 30, etc.); targets > 30 switch to a typed numeric input so step counts don't take 10,000 taps.
- **Check-ins** — toggle for binary habits, increment/decrement or set-count for counter habits. Optimistic UI on every button so clicks feel instant.
- **Notes** — attach a short reflection to today's check-in; saved on blur.
- **Backfill** — tap any past day on the heatmap to log it after the fact.
- **Streaks** — current and longest, daily or weekly. Today is "in progress" — missing today does not reset the streak; missing yesterday does. Covered by 8 vitest cases in `lib/streaks.test.ts`.
- **Heatmap** — 26-week contribution chart per habit, hand-rolled SVG.

### Discovery / sharing
- **Quick-start presets** — one-click chips for common habits (Water 8 cups, Steps 10k, Meditate, Read, Push-ups, Sleep, Cardio).
- **Public folio** at `/u/[slug]` — opt-in per habit + per profile. Shows aggregated heatmap, per-habit streaks, and today's counter progress.
- **Share link** — copy your public folio URL from settings.

### Daily digest (autonomous-loop-shaped)
- **Per-user reflection** computed from completion + streaks, with a written message ("Clean sweep — you hit all 5", "Quiet day. 3 habits are still waiting", etc.).
- Manual trigger from the dashboard, or autonomous via `POST /api/cron/digests` — designed to be poked by Vercel Cron (or a Ralph Wiggum loop) once a day.

### Polish
- Loading skeletons on every authed route.
- Error boundary that gives users a "try again" instead of a stack trace.
- Visible save / error notices on settings.

---

## Project structure

```
app/
  (app)/                     # auth-required group (shared layout + error boundary)
    dashboard/               # 3-column today view + digest card + still-to-go list
    habits/                  # list + presets + create form
      [id]/                  # detail: stats, heatmap (clickable to backfill), notes, edit/delete
    settings/                # profile, timezone, slug, share link
    layout.tsx               # auth gate + top nav
    error.tsx                # friendly recovery card
  api/cron/digests/route.ts  # autonomous digest endpoint (CRON_SECRET-gated)
  auth/{callback,sign-out}/  # OAuth callback + sign-out POST handler
  actions/                   # server actions (habits, check-ins, profile, digests)
  login/                     # email + password sign-in / sign-up
  page.tsx                   # public landing
  u/[slug]/                  # public folio (no auth required)
components/                  # client components (heatmap, counter, edit panel, …)
lib/
  supabase/                  # server, client, middleware, service (for cron only)
  streaks.ts + streaks.test.ts
  digests.ts + digests.test.ts
  dates.ts                   # timezone-aware date helpers
  presets.ts                 # preset habit library
supabase/migrations/         # numbered SQL — never edit applied files
.claude/skills/habit-tracker/SKILL.md   # auto-loaded project skill
```

---

## Server actions

All under `app/actions/`. Each does its own `auth.getUser()` and is gated by RLS; never trusts the caller's user ID.

| Action | File | What it does |
|---|---|---|
| `createHabit` | habits.ts | Validates + inserts a habit |
| `createHabitFromPreset` | habits.ts | One-click insert from `lib/presets.ts` |
| `updateHabit` | habits.ts | Edits name/color/cadence/target |
| `deleteHabit` | habits.ts | Hard delete (check-ins cascade) |
| `archiveHabit` / `unarchiveHabit` | habits.ts | Soft retire |
| `setHabitVisibility` | habits.ts | Toggle per-habit public flag |
| `updateProfile` | profile.ts | Display name, timezone, public slug |
| `toggleCheckInToday` | check-ins.ts | Binary check-in for today |
| `incrementCheckInToday` / `decrementCheckInToday` | check-ins.ts | +1 / −1 for counter habits |
| `setCheckInCountToday` | check-ins.ts | Set an absolute count for today |
| `setCheckInCountOnDate` | check-ins.ts | Backfill a past day (refuses future dates) |
| `setCheckInNote` | check-ins.ts | Attach a short note to a check-in |
| `generateTodaysDigest` | digests.ts | Compute + upsert one digest for the current user |

---

## Setup (local)

```bash
git clone https://github.com/barkhai-ux/project03-web-application.git
cd project03-web-application
npm install
cp .env.local.example .env.local
# Fill the URL + publishable key from your Supabase project's API settings.
# (Service role + cron secret are only needed if you want to run /api/cron/digests locally.)

# Apply the schema:
#   either paste supabase/migrations/0001_init.sql + 0002_digests.sql into the SQL editor,
#   or use the Supabase CLI / Claude Code's Supabase MCP `apply_migration` tool.

npm run dev      # http://localhost:3000
npm test         # vitest — 13 cases
npm run build    # production build
```

### Environment

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (safe to expose) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable `sb_publishable_…` key (safe in the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Cron only.** Used by `/api/cron/digests` to iterate users. Never imported into client code. |
| `CRON_SECRET` | Shared secret required in the `Authorization: Bearer …` header on `/api/cron/digests`. |

---

## Deployment

Production: https://project03-web-application.vercel.app/

Steps to deploy your own copy:

1. Push to a GitHub repo.
2. Import at https://vercel.com/new and set the four env vars above.
3. In Supabase → **Authentication → URL Configuration**, add the Vercel preview + production URLs to **Redirect URLs**.
4. *(Optional)* In Vercel → **Settings → Cron Jobs**, schedule:
   ```
   POST /api/cron/digests  (daily at e.g. 23:55 UTC)
   ```
   Vercel automatically attaches `Authorization: Bearer $CRON_SECRET` when you've set the env var.

---

## AI collaboration

Built end-to-end with Claude Code.

- **Skill**: `.claude/skills/habit-tracker/SKILL.md` auto-loads in any future session and encodes the load-bearing conventions — the timezone rule, the streak algorithm rules, the four-policy RLS pattern for new tables, and how migrations are applied. These are the things a fresh Claude session would otherwise re-derive (or get wrong) every time.
- **MCP**: the Supabase MCP server is used to apply migrations and inspect schema directly from the editor, instead of context-switching to the Supabase dashboard.
- **Loop-shaped feature**: the daily digest is the autonomous-loop feature. The dashboard surfaces whatever the most recent digest says; the `/api/cron/digests` route is designed to be poked once a day (Vercel Cron or a Ralph Wiggum loop) to recompute every active user's digest. The message-generation logic in `lib/digests.ts` is pure and unit-tested so the autonomous run is deterministic.

---

## Scripts

```
npm run dev      # next dev (Turbopack)
npm run build    # next build
npm start        # next start (prod server)
npm run lint     # eslint
npm test         # vitest run
```

---

## Schema notes

- Two migrations: `0001_init.sql` (profiles, habits, check_ins + RLS) and `0002_digests.sql` (digests + RLS).
- Every user-scoped table has the same four RLS policies (owner all-access; public-readable resources add a `for select using (public_slug is not null)` policy).
- `check_ins.date` is a `DATE` interpreted in the user's IANA timezone — see `lib/dates.ts`. Never derive it from UTC.
- `check_ins` has `unique (habit_id, date)` so a given habit gets one row per day; counter habits track repeats via the `count` column.

---

## What's still planned

- CSV export of all check-ins.
- Onboarding tour for new accounts.
- Mobile-friendly heatmap interactions (the click-to-backfill works on touch but the hover tooltip doesn't).
- Forgot-password flow on the login page.
