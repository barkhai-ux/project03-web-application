---
name: habit-tracker
description: Conventions and gotchas for the habit-tracker capstone (Next.js + Supabase). Auto-loads when working in this repo.
---

# habit-tracker

Project-specific conventions Claude Code should respect when editing this codebase. These are the easy-to-get-wrong rules — naming and architecture conventions are derivable from the file tree.

## Date / timezone rule (load-bearing)

`check_ins.date` is a SQL `DATE` interpreted in the user's IANA timezone (`profiles.timezone`). It is **not** a `timestamptz` and must never be derived from `new Date().toISOString().slice(0,10)` (that uses UTC).

- Always go through helpers in `lib/dates.ts`:
  - `todayInTz(tz)` → today's `YYYY-MM-DD` in the user's tz
  - `addDays(dateStr, n)` → string-arithmetic, no Date object needed
  - `isoWeekKey(dateStr)` → `2026-W17` for weekly streak math
- The user's tz is stored on `profiles.timezone`. Server actions must read it from the DB before computing date strings — don't trust the client.

**Why:** without this discipline, a user in `Asia/Ulaanbaatar` (UTC+8) checking in at 11pm local would have their check-in stored against the wrong UTC date, breaking streaks.

## Streak algorithm

Implemented in `lib/streaks.ts`. Tested in `lib/streaks.test.ts` with 8 cases. Don't reimplement inline — call `computeStreaks(checkIns, period, target, tz)`.

Rules:
- Daily habit: streak = consecutive days where `sum(count) >= target_per_period`.
- Weekly habit: streak = consecutive ISO weeks where `sum(count) >= target_per_period`.
- **Today is in-progress**: a streak does not reset because today's target hasn't been met. It only resets after yesterday is missed.

## RLS pattern (every new table needs all four)

Every user-scoped table requires the same four policies:

```sql
alter table <t> enable row level security;
create policy <t>_owner_all on <t>
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Public-readable resources additionally need a separate `for select` policy guarded by a `public_slug is not null` (or equivalent visibility column) check.

## Mutations

Use **Server Actions** in `app/actions/*.ts`, not API route handlers, except where the request is from a non-React client (the public profile feed could become an API route later).

Every server action:
1. Imports `createClient` from `@/lib/supabase/server`
2. Calls `supabase.auth.getUser()` and returns/redirects on no user
3. Validates `FormData` with Zod
4. Calls `revalidatePath(...)` for any pages that may have changed

## Schema migrations

Every schema change is a new file under `supabase/migrations/` named `NNNN_description.sql`. Never edit a previously applied migration — instead add a new one. To apply, use the Supabase MCP `apply_migration` tool against project `ftdlwgtzhbyzigahbgjn`.

## Env conventions

- `NEXT_PUBLIC_SUPABASE_URL` — project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable (sb_publishable_…) key, NOT the legacy anon JWT

The publishable key is safe in the browser; we deliberately do not use a service-role key from the app — all auth is enforced via RLS.

## Component conventions

- Server Components by default. Mark client components with `"use client"`.
- Client components live in `components/` and call server actions via `useTransition` for optimistic UX.
- The `Heatmap` component is the visual centerpiece — keep it pure SVG (no charting libs) for control over animation and theming.
