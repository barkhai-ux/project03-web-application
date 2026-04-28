import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStreaks } from "@/lib/streaks";
import { addDays, todayInTz } from "@/lib/dates";
import { Heatmap } from "@/components/heatmap";

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: habit } = await supabase
    .from("habits")
    .select("id, name, color, period, target_per_period, is_public, archived_at")
    .eq("id", id)
    .maybeSingle();

  if (!habit) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .single();
  const tz = profile?.timezone ?? "UTC";
  const today = todayInTz(tz);
  const horizon = addDays(today, -370);

  const { data: rows } = await supabase
    .from("check_ins")
    .select("date, count, note")
    .eq("habit_id", id)
    .gte("date", horizon)
    .order("date", { ascending: false });

  const checkIns = (rows ?? []).map((r) => ({ date: r.date, count: r.count }));
  const counts: Record<string, number> = {};
  for (const c of checkIns) counts[c.date] = (counts[c.date] ?? 0) + c.count;

  const { current, longest } = computeStreaks(
    checkIns,
    habit.period,
    habit.target_per_period,
    tz,
  );

  const totalCheckIns = checkIns.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/habits"
            className="text-xs text-zinc-500 hover:text-foreground"
          >
            ← All habits
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            {habit.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {habit.period === "day" ? "Daily" : "Weekly"}
            {habit.target_per_period > 1
              ? ` · ${habit.target_per_period}× per ${habit.period}`
              : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Current streak" value={current} color={habit.color} />
        <Stat label="Longest" value={longest} />
        <Stat label="Total" value={totalCheckIns} />
      </div>

      <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Last 12 months
        </h2>
        <Heatmap counts={counts} today={today} color={habit.color} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Recent
        </h2>
        {rows && rows.length > 0 ? (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {rows.slice(0, 14).map((r) => (
              <li
                key={r.date}
                className="flex items-center justify-between px-4 py-2 text-sm"
              >
                <span className="font-mono text-xs text-zinc-500">{r.date}</span>
                <span className="flex items-center gap-3">
                  {r.note && (
                    <span className="max-w-xs truncate text-zinc-500">
                      {r.note}
                    </span>
                  )}
                  <span
                    className="font-medium"
                    style={{ color: habit.color }}
                  >
                    ×{r.count}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No check-ins yet.</p>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div
        className="text-2xl font-semibold tabular-nums"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );
}
