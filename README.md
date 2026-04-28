# Habit Tracker

A minimal habit-tracking web app — sign in, define habits, check in daily, watch your streaks grow on a contribution-style heatmap.

Built as the **Project 3 capstone** for the Claude Code course (35% weight, weeks 13–16).

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Postgres + Auth + RLS), accessed via `@supabase/ssr`
- **Validation**: Zod for server action inputs
- **Charts**: Hand-rolled SVG heatmap (`components/heatmap.tsx`)
- **Tests**: Vitest for the streak engine
- **Deployment**: Vercel (planned)
- **AI integration**: a project skill at `.claude/skills/habit-tracker/SKILL.md` encoding non-obvious conventions

## Architecture

```
Browser ──▶ Next.js (Server Components + Server Actions) ──▶ Supabase Postgres
                          │                                     │
                       middleware                               │
                  (session refresh, auth gate)                  ▼
                          │                                  RLS policies
                       cookies                          (auth.uid() = user_id)
```

- Auth lives in Supabase (magic-link OTP). Sessions are cookie-backed and refreshed in `middleware.ts`.
- Every mutation goes through a Server Action under `app/actions/`. No service-role key in the app — RLS does all access control.
- Streak math is pure (`lib/streaks.ts`), unit-tested, and timezone-aware via `lib/dates.ts`.

## Setup

```bash
# 1. Clone and install
git clone https://github.com/barkhai-ux/project03-web-application.git
cd project03-web-application
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# from your Supabase project's API settings.

# 3. Apply the schema
# Either: paste supabase/migrations/0001_init.sql into Supabase SQL editor
# Or: use Supabase CLI / Claude Code's Supabase MCP tools.

# 4. Run locally
npm run dev      # http://localhost:3000
npm test         # vitest
npm run build    # production build
```

## Project structure

```
app/
  (app)/                # auth-required routes (dashboard, habits, settings)
  auth/{callback,sign-out}/
  actions/              # server actions (habits, check-ins, profile)
  login/                # public auth page
components/             # client components
lib/
  supabase/             # @supabase/ssr clients (server, client, middleware)
  streaks.ts            # pure streak engine
  dates.ts              # timezone-aware date helpers
supabase/migrations/    # SQL migrations, applied in order
.claude/skills/habit-tracker/SKILL.md  # project skill
```

## Features

### Shipped
- Magic-link auth with auto-provisioned profile row (`handle_new_user` trigger)
- Habit CRUD with color, daily/weekly cadence, target counts, archive/restore
- Daily check-in toggle with optimistic UI
- Current + longest streak per habit, in user's timezone
- 12-month contribution heatmap per habit
- Per-user timezone setting (UTC default, common zones in dropdown)
- Public profile slug (foundation for `/u/[slug]` page)

### Planned
- Notes per check-in
- Public profile page rendering (`/u/[slug]`)
- CSV export
- Empty-state illustrations + onboarding
- Vercel deploy with preview environments

## Deployment

This app is deployed on Vercel. To deploy your own copy:

1. Push the repo to GitHub.
2. Import the project at https://vercel.com/new.
3. Set env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. In Supabase → Authentication → URL Configuration, add your Vercel preview/prod URLs to **Redirect URLs**.

## AI collaboration

Built with Claude Code. The repo includes a project skill at `.claude/skills/habit-tracker/SKILL.md` that auto-loads in future sessions, encoding the timezone rules, streak algorithm, RLS patterns, and migration conventions — the things that would otherwise need to be relearned every session.

## Scripts

```json
"dev":   "next dev",
"build": "next build",
"start": "next start",
"lint":  "eslint",
"test":  "vitest run"
```

(test script may need to be added to package.json — see `lib/streaks.test.ts` for the suite.)
