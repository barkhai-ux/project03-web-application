import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { computeStreaks } from "@/lib/streaks";
import { addDays, todayInTz } from "@/lib/dates";
import { Heatmap } from "@/components/heatmap";
import { StatTile } from "@/components/stat-tile";
import { CheckInToggle } from "@/components/check-in-toggle";

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
  const doneToday = (counts[today] ?? 0) >= habit.target_per_period;

  // Sibling list for picker
  const { data: siblings } = await supabase
    .from("habits")
    .select("id, name, color")
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-7 pb-7 pt-2 animate-fade-up">
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <Link
            href="/habits"
            className="inline-flex items-center gap-1.5 text-[12px] small-caps text-[var(--ink-400)] hover:text-[var(--ink-900)] no-underline"
          >
            <ArrowLeft size={12} /> Index
          </Link>
          <h2 className="mt-1 text-[22px] font-medium tracking-[-0.02em]">
            <span className="serif-italic text-[26px]">A closer look</span> at your habit
          </h2>
          <div className="text-[var(--ink-500)] text-[13px] mt-1">
            Streaks, reflections, and what&apos;s been working.
          </div>
        </div>
        <button type="button" className="btn-soft">
          <Plus size={12} /> Add reflection
        </button>
      </div>

      <div className="grid grid-cols-[240px_1fr] items-start gap-[18px]">
        {/* Habit picker */}
        <div className="card p-3">
          <div className="text-[11px] font-semibold text-[var(--ink-400)] tracking-[0.08em] uppercase px-2.5 py-2">
            Your habits
          </div>
          <div className="flex flex-col gap-1.5">
            {(siblings ?? []).map((h) => {
              const active = h.id === habit.id;
              return (
                <Link
                  key={h.id}
                  href={`/habits/${h.id}`}
                  className={
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] no-underline transition-colors " +
                    (active
                      ? "bg-[var(--sand-100)] font-medium ink"
                      : "hover:bg-[var(--sand-100)] ink")
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: h.color }}
                  />
                  <span className="flex-1 truncate">{h.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col gap-[18px] min-w-0">
          <div className="card p-[22px_24px]">
            <div className="flex items-center justify-between mb-[18px] gap-4">
              <div className="min-w-0">
                <div className="text-[13px] text-[var(--ink-500)] flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: habit.color }}
                  />
                  {habit.period === "day" ? "Daily ritual" : "Weekly ritual"}
                  {habit.target_per_period > 1
                    ? ` · ${habit.target_per_period}× target`
                    : ""}
                </div>
                <div className="serif-italic text-[36px] tracking-[-0.02em] mt-0.5 truncate">
                  {habit.name}
                </div>
              </div>
              <div className="flex gap-2.5 flex-shrink-0 items-center">
                <Link href="/habits" className="btn-soft no-underline">
                  Edit
                </Link>
                <div className="flex items-center gap-2.5 bg-[var(--ink-900)] text-[#fbf3e6] rounded-full pl-1.5 pr-4 py-1.5 text-[13px] font-medium">
                  <CheckInToggle
                    habitId={habit.id}
                    done={doneToday}
                    color={habit.color}
                    size="sm"
                  />
                  <span>{doneToday ? "Done today" : "Mark today"}</span>
                  {!doneToday && (
                    <Check size={12} className="text-[var(--butter)]" />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3.5 mb-5">
              <StatTile label="Current streak" value={current} caption="days" />
              <StatTile label="Longest streak" value={longest} caption="days" />
              <StatTile
                label="Total check-ins"
                value={totalCheckIns}
                caption={`since ${horizon}`}
              />
              <StatTile
                label="Cadence"
                value={habit.period === "day" ? "Daily" : "Weekly"}
                caption={`target ${habit.target_per_period}`}
                divider={false}
              />
            </div>

            <div className="flex items-baseline justify-between mb-2.5">
              <div className="text-[13px] font-medium">Last 6 months</div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--ink-500)]">
                <span>less</span>
                <div className="flex gap-[3px]">
                  <span className="w-3 h-3 rounded-[3px] heat" />
                  <span className="w-3 h-3 rounded-[3px] heat l1" />
                  <span className="w-3 h-3 rounded-[3px] heat l2" />
                  <span className="w-3 h-3 rounded-[3px] heat l3" />
                  <span className="w-3 h-3 rounded-[3px] heat l4" />
                  <span className="w-3 h-3 rounded-[3px] heat l5" />
                </div>
                <span>more</span>
              </div>
            </div>

            <Heatmap counts={counts} today={today} color={habit.color} weeks={26} />
          </div>

          <div className="card p-[18px_24px]">
            <div className="flex justify-between items-baseline mb-1.5">
              <div className="serif-italic text-[22px]">Reflections</div>
              <span className="text-[12px] text-[var(--ink-500)]">
                Last {Math.min(rows?.length ?? 0, 6)} entries
              </span>
            </div>
            {rows && rows.length > 0 ? (
              rows.slice(0, 6).map((n) => (
                <div
                  key={n.date}
                  className="flex gap-3 py-3.5 border-b border-dashed border-[color:var(--line)] last:border-b-0"
                >
                  <div
                    className="w-[70px] flex-shrink-0 leading-none serif-italic text-[22px] text-[var(--ink-700)]"
                  >
                    {formatShort(n.date)}
                  </div>
                  <div className="text-[13px] text-[var(--ink-700)] leading-[1.5] flex-1">
                    {n.note ? (
                      <>&ldquo;{n.note}&rdquo;</>
                    ) : (
                      <span className="text-[var(--ink-400)]">
                        Logged ×{n.count}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="serif-italic text-[var(--ink-400)] py-2">
                Nothing recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatShort(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
