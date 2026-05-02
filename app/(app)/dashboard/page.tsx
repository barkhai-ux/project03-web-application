import Link from "next/link";
import { ArrowRight, Edit3, Mic, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HabitCard } from "@/components/habit-card";
import { computeStreaks } from "@/lib/streaks";
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
  const horizon = addDays(today, -370);

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

  const totalToday = (habits ?? []).filter((h) =>
    (byHabit.get(h.id) ?? []).some((c) => c.date === today),
  ).length;
  const totalCount = habits?.length ?? 0;
  const pct = totalCount > 0 ? Math.round((totalToday / totalCount) * 100) : 0;

  const longestOverall = (habits ?? []).reduce((max, h) => {
    const { longest } = computeStreaks(
      byHabit.get(h.id) ?? [],
      h.period,
      h.target_per_period,
      tz,
    );
    return Math.max(max, longest);
  }, 0);

  const totalCheckIns = (checkIns ?? []).length;
  const mindfulHours = Math.round(((checkIns ?? []).length * 15) / 60);

  const firstName =
    profile?.display_name?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "you";
  const initial = firstName.charAt(0).toUpperCase();

  const nudges = [
    "Stretch your back during the 3pm slump",
    "Step outside for ten minutes of sun",
    "Tidy desk before closing the laptop",
    "Drink a glass of water before coffee",
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-up">
      {/* Greeting row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-7 pt-2 pb-3.5">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-full grid place-items-center text-white font-semibold text-base border-2"
            style={{
              background: "linear-gradient(135deg, #f0c896 0%, #c98a5a 100%)",
              borderColor: "#fbf3e6",
            }}
          >
            {initial}
          </div>
          <div className="text-[28px] font-medium tracking-[-0.02em]">
            Hi,{" "}
            <span className="serif-italic text-[32px]">{firstName}</span>
          </div>
        </div>

        <div className="text-[20px] font-medium tracking-[-0.01em] text-center text-[var(--ink-700)]">
          Today&apos;s{" "}
          <span className="serif-italic text-[24px] ink">rituals</span>
        </div>

        <div className="flex items-center gap-2.5 justify-end text-[13px] text-[var(--ink-500)]">
          <span>{formatToday(today)}</span>
        </div>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-[280px_1fr_320px] gap-5 px-7 pb-6 pt-1.5 flex-1 min-h-0 max-[1100px]:grid-cols-[240px_1fr_280px]">
        {/* LEFT */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center gap-3 bg-white/85 border border-[color:var(--line)] py-2.5 pr-3.5 pl-2.5 rounded-full">
            <div className="w-9 h-9 rounded-full bg-[var(--butter)] grid place-items-center">
              <Sparkles size={16} className="text-[var(--ink-700)]" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[14px]">Daily reset</div>
              <div className="text-[11px] text-[var(--ink-500)]">
                Health &amp; mindfulness
              </div>
            </div>
          </div>

          <div className="card p-[22px_22px_24px]">
            <div
              className="text-[88px] leading-[0.95] tracking-[-0.04em] font-medium"
              style={{
                backgroundImage: "linear-gradient(180deg, #1a1612 0%, #4a3f30 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {pct}
              <span className="text-[48px]">%</span>
            </div>
            <div className="text-[var(--ink-500)] text-[13px] mt-2">
              of today&apos;s habits done
            </div>
            <div className="flex items-center gap-2.5 mt-3.5 pt-3.5 border-t border-dashed border-[color:var(--line-2)] text-[12px] text-[var(--ink-500)]">
              <div className="flex-1 h-1.5 bg-[var(--sand-200)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, var(--moss-2), var(--moss))",
                  }}
                />
              </div>
              <span className="tabular">
                {totalToday}/{totalCount}
              </span>
            </div>
          </div>

          <div
            className="rounded-[var(--radius-card)] p-[16px_18px_18px] relative border text-[var(--ink-900)]"
            style={{
              background: "linear-gradient(160deg, #f7d96b 0%, #f3c948 100%)",
              borderColor: "rgba(255,255,255,0.4)",
              boxShadow: "0 8px 20px -10px rgba(180, 130, 30, 0.5)",
            }}
          >
            <div className="flex justify-between items-center mb-3.5">
              <div className="font-semibold text-[13px]">Weekly rhythm</div>
              <div className="bg-black/85 text-[var(--butter)] px-2.5 py-1 rounded-full text-[11px] font-medium">
                Last 30 days
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Cell num={longestOverall} lbl="Best streak" />
              <Cell num={`${pct}%`} lbl="Today" />
              <Cell num={totalCheckIns} lbl="Check-ins" />
            </div>
            <Link
              href="/habits"
              aria-label="Manage habits"
              className="absolute left-1/2 -translate-x-1/2 -bottom-3.5 w-7 h-7 rounded-full bg-white border border-[color:var(--line)] grid place-items-center shadow-[0_4px_10px_-4px_rgba(60,40,20,0.3)] hover:scale-105 transition-transform"
            >
              <Edit3 size={12} className="text-[var(--ink-900)]" />
            </Link>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex flex-col gap-[18px] overflow-y-auto min-h-0 pr-1.5">
          {(habits?.length ?? 0) === 0 ? (
            <EmptyState />
          ) : (
            habits!.map((h, i) => (
              <div
                key={h.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <HabitCard
                  habit={h}
                  checkIns={byHabit.get(h.id) ?? []}
                  doneToday={(byHabit.get(h.id) ?? []).some((c) => c.date === today)}
                  timezone={tz}
                />
              </div>
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="card p-[18px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-semibold text-[15px]">
                <span className="w-6 h-6 rounded-md bg-[#ffe9d9] grid place-items-center text-[var(--terra)]">
                  <Sparkles size={14} />
                </span>
                Gentle nudges
              </div>
              <Link
                href="/habits"
                className="text-[13px] text-[var(--ink-700)] inline-flex items-center gap-1 font-medium no-underline hover:text-[var(--ink-900)]"
              >
                <Plus size={12} /> Add
              </Link>
            </div>
            <div className="flex flex-col">
              {nudges.map((t, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-2.5 py-3 border-b border-dashed border-[color:var(--line)] last:border-b-0 text-[13px] leading-[1.45] cursor-pointer"
                >
                  <div className="flex-1 text-[var(--ink-700)]">{t}</div>
                  <span className="text-[var(--ink-400)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--ink-900)]">
                    <ArrowRight size={14} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-[var(--radius-card)] p-[16px_18px_18px] border"
            style={{
              background: "linear-gradient(160deg, #fff 0%, #f9f1e2 100%)",
              borderColor: "rgba(255,255,255,0.7)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <span className="tag voice mb-2">Reflection</span>
            <div className="text-[18px] font-medium tracking-[-0.01em] leading-[1.3] mt-2">
              How did{" "}
              <span className="serif-italic text-[21px]">today</span> feel?
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                aria-label="Record reflection"
                className="w-9 h-9 rounded-full bg-[var(--ink-900)] text-[#fbf3e6] grid place-items-center flex-shrink-0"
              >
                <Mic size={16} />
              </button>
              <div className="flex-1 h-7 flex items-center gap-[2px]">
                {Array.from({ length: 38 }).map((_, i) => {
                  const h = 4 + Math.abs(Math.sin(i * 0.7)) * 22;
                  return (
                    <span
                      key={i}
                      className="block w-[2px] rounded-[1px] bg-[var(--ink-700)]"
                      style={{ height: h, opacity: 0.45 + ((i % 5) / 12) }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-right text-[12px] text-[var(--ink-500)]">
            Longest run · <span className="serif-italic ink text-[14px]">{longestOverall}</span>
            {mindfulHours > 0 && (
              <>
                {" · "}
                {mindfulHours}h mindful
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({ num, lbl }: { num: React.ReactNode; lbl: string }) {
  return (
    <div>
      <div className="serif-italic text-[26px] tracking-[-0.02em] leading-none">{num}</div>
      <div className="text-[11px] text-[rgba(26,22,18,0.65)] mt-0.5">{lbl}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center gap-4 p-12 text-center">
      <p className="serif-italic text-[26px] text-[var(--ink-500)]">
        An empty page is a fine place to begin.
      </p>
      <Link href="/habits" className="btn-dark mt-2">
        Add your first habit <ArrowRight size={12} />
      </Link>
    </div>
  );
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
