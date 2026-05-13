import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/logo-mark";
import { Heatmap } from "@/components/heatmap";
import { addDays, todayInTz } from "@/lib/dates";
import { computeStreaks } from "@/lib/streaks";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, timezone, public_slug")
    .eq("public_slug", slug)
    .maybeSingle();

  if (!profile) notFound();

  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, color, period, target_per_period")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  const name = profile.display_name ?? slug;
  const initial = name.charAt(0).toUpperCase();
  const publicHabits = habits ?? [];

  const tz = profile.timezone ?? "UTC";
  const today = todayInTz(tz);
  const horizon = addDays(today, -190);

  const habitIds = publicHabits.map((h) => h.id);
  const { data: checkInsRaw } = habitIds.length
    ? await supabase
        .from("check_ins")
        .select("habit_id, date, count")
        .in("habit_id", habitIds)
        .gte("date", horizon)
    : { data: [] as { habit_id: string; date: string; count: number }[] };
  const checkIns = checkInsRaw ?? [];

  const aggregated: Record<string, number> = {};
  const byHabit = new Map<string, { date: string; count: number }[]>();
  for (const c of checkIns) {
    aggregated[c.date] = (aggregated[c.date] ?? 0) + c.count;
    const arr = byHabit.get(c.habit_id) ?? [];
    arr.push({ date: c.date, count: c.count });
    byHabit.set(c.habit_id, arr);
  }
  const totalCheckIns = checkIns.length;

  const habitStreaks = publicHabits.map((h) => {
    const { current, longest } = computeStreaks(
      byHabit.get(h.id) ?? [],
      h.period,
      h.target_per_period,
      tz,
    );
    return { id: h.id, current, longest };
  });
  const streakMap = new Map(habitStreaks.map((s) => [s.id, s]));
  const longestOverall = habitStreaks.reduce(
    (max, s) => Math.max(max, s.longest),
    0,
  );

  return (
    <div className="relative flex min-h-screen items-start justify-center p-6 md:p-7">
      <div className="shell w-full max-w-[1100px] min-h-[calc(100vh-3rem)]">
        <div className="shell-inner">
          <header className="flex items-center justify-between px-7 pt-[18px] pb-2.5">
            <Link href="/" className="inline-flex items-center gap-2.5 ink no-underline">
              <LogoMark size={28} />
              <span className="text-[18px] font-semibold tracking-[-0.01em]">
                Final
              </span>
            </Link>
            <span className="small-caps text-[var(--ink-400)]">Public folio</span>
          </header>

          <main className="flex-1 flex flex-col px-7 pb-12 pt-2 gap-6">
            <div className="card p-8 flex items-center gap-5 animate-fade-up">
              <div
                className="w-[72px] h-[72px] rounded-full grid place-items-center text-white font-semibold text-[28px] border-2"
                style={{
                  background: "linear-gradient(135deg, #f0c896 0%, #c98a5a 100%)",
                  borderColor: "#fbf3e6",
                }}
              >
                {initial}
              </div>
              <div className="flex-1">
                <div className="serif-italic text-[36px] leading-none">{name}</div>
                <div className="text-[var(--ink-500)] text-[13px] mt-2">
                  @{slug} &middot; {profile.timezone}
                </div>
              </div>
              <div className="text-right">
                <div className="serif-italic text-[34px] leading-none">
                  {longestOverall}
                </div>
                <div className="text-[11px] text-[var(--ink-500)] mt-1 small-caps">
                  Best run
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 small-caps text-[var(--ink-400)] hover:text-[var(--ink-900)] no-underline"
              >
                <ArrowLeft size={12} /> Home
              </Link>
            </div>

            {publicHabits.length > 0 && (
              <div className="card p-7 animate-fade-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="serif-italic text-[22px]">Last 26 weeks</div>
                  <div className="text-[12px] text-[var(--ink-500)] tabular">
                    {totalCheckIns} check-ins
                  </div>
                </div>
                <Heatmap counts={aggregated} today={today} color="#3e7a52" />
              </div>
            )}

            {publicHabits.length === 0 ? (
              <div className="card p-8 text-center animate-fade-up">
                <p className="serif-italic text-[22px] text-[var(--ink-500)]">
                  No public rituals yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicHabits.map((h, i) => (
                  <div
                    key={h.id}
                    className="card p-6 animate-fade-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="block w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: h.color }}
                      />
                      <div className="serif-italic text-[22px] leading-none">
                        {h.name}
                      </div>
                    </div>
                    <div className="text-[12px] text-[var(--ink-500)] mt-2 small-caps">
                      {h.period === "day" ? "Daily" : "Weekly"} &middot; target {h.target_per_period}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-dashed border-[color:var(--line)]">
                      <div>
                        <div className="serif-italic text-[26px] tracking-[-0.02em] leading-none">
                          {streakMap.get(h.id)?.current ?? 0}
                        </div>
                        <div className="text-[11px] text-[var(--ink-500)] mt-0.5">
                          Current streak
                        </div>
                      </div>
                      <div>
                        <div className="serif-italic text-[26px] tracking-[-0.02em] leading-none">
                          {streakMap.get(h.id)?.longest ?? 0}
                        </div>
                        <div className="text-[11px] text-[var(--ink-500)] mt-0.5">
                          Longest
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
