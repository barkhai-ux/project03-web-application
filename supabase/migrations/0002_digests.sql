-- Daily digests: one row per user per day. Lets the Ralph Wiggum loop write
-- a short reflection (completion rate, longest streak today, highlight habit)
-- that the dashboard can surface.
--
-- A digest is uniquely keyed by (user_id, for_date). The `for_date` is a DATE
-- interpreted in the user's IANA timezone — same convention as check_ins.date.

create table if not exists digests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  for_date date not null,
  completion_pct int not null default 0 check (completion_pct between 0 and 100),
  done_count int not null default 0 check (done_count >= 0),
  total_count int not null default 0 check (total_count >= 0),
  longest_streak int not null default 0 check (longest_streak >= 0),
  highlight_habit_id uuid references habits(id) on delete set null,
  message text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, for_date)
);

create index if not exists digests_user_date_idx
  on digests (user_id, for_date desc);

alter table digests enable row level security;

create policy digests_owner_all on digests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
