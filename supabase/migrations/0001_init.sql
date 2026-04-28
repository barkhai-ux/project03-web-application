-- Habit Tracker initial schema
-- Tables: profiles, habits, check_ins
-- RLS: every row scoped to user_id = auth.uid(); profiles allow public read when public_slug is set.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'UTC',
  public_slug text unique,
  created_at timestamptz not null default now()
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#10b981',
  icon text,
  period text not null check (period in ('day','week')),
  target_per_period int not null default 1 check (target_per_period > 0),
  is_public boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists habits_user_id_active_idx
  on habits (user_id) where archived_at is null;

create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  count int not null default 1 check (count > 0),
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);
create index if not exists check_ins_user_date_idx
  on check_ins (user_id, date desc);

-- Auto-provision a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table profiles  enable row level security;
alter table habits    enable row level security;
alter table check_ins enable row level security;

-- profiles: owner full access; anyone can read profiles with a public_slug
create policy profiles_owner_select on profiles
  for select using (auth.uid() = id);
create policy profiles_public_select on profiles
  for select using (public_slug is not null);
create policy profiles_owner_insert on profiles
  for insert with check (auth.uid() = id);
create policy profiles_owner_update on profiles
  for update using (auth.uid() = id);
create policy profiles_owner_delete on profiles
  for delete using (auth.uid() = id);

-- habits: owner full access; public read when habit.is_public AND profile is public
create policy habits_owner_all on habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy habits_public_select on habits
  for select using (
    is_public = true
    and exists (
      select 1 from profiles p
      where p.id = habits.user_id and p.public_slug is not null
    )
  );

-- check_ins: owner full access; public read for check-ins of public habits (no notes via view)
create policy check_ins_owner_all on check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy check_ins_public_select on check_ins
  for select using (
    exists (
      select 1
      from habits h join profiles p on p.id = h.user_id
      where h.id = check_ins.habit_id
        and h.is_public = true
        and p.public_slug is not null
    )
  );
