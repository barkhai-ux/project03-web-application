import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HabitCard } from "@/components/habit-card";
import { addDays, todayInTz } from "@/lib/dates";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone, display_name")
    .eq("id", user.id)
    .maybeSingle();
  const tz = profile?.timezone ?? "UTC";
  const today = todayInTz(tz);
  const horizon = addDays(today, -120);

  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, color, period, target_per_period")
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  const habitIds = (habits ?? []).map((h) => h.id);
  const { data: checkIns } = habitIds.length
    ? await supabase
        .from("check_ins")
        .select("habit_id, date, count")
        .in("habit_id", habitIds)
        .gte("date", horizon)
    : { data: [] as { habit_id: string; date: string; count: number }[] };

  const byHabit = new Map<string, { date: string; count: number }[]>();
  for (const c of checkIns ?? []) {
    const arr = byHabit.get(c.habit_id) ?? [];
    arr.push({ date: c.date, count: c.count });
    byHabit.set(c.habit_id, arr);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting(tz)}{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {formatToday(today)}
        </p>
      </div>

      {(habits?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            You don&apos;t have any habits yet.
          </p>
          <Link
            href="/habits"
            className="mt-4 inline-block rounded-full bg-foreground px-5 py-2 text-sm text-background hover:opacity-90"
          >
            Create your first habit
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {habits!.map((h) => {
            const checks = byHabit.get(h.id) ?? [];
            const doneToday = checks.some((c) => c.date === today);
            return (
              <li key={h.id}>
                <HabitCard
                  habit={h}
                  checkIns={checks}
                  doneToday={doneToday}
                  timezone={tz}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function greeting(_tz: string): string {
  const hour = Number(
    new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: _tz }),
  );
  if (hour < 5) return "Late night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatToday(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
