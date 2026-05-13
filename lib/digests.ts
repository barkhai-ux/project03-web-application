import { addDays } from "./dates";
import { computeStreaks, type Period } from "./streaks";

export interface DigestHabit {
  id: string;
  name: string;
  period: Period;
  target_per_period: number;
}

export interface DigestCheckIn {
  habit_id: string;
  date: string;
  count: number;
}

export interface DigestStats {
  for_date: string;
  completion_pct: number;
  done_count: number;
  total_count: number;
  longest_streak: number;
  highlight_habit_id: string | null;
  message: string;
}

/**
 * Compute a daily digest from the user's habits + recent check-ins.
 * Pure — no DB access — so it's trivial to unit test and to call from both
 * a server action (manual trigger) and a cron/Ralph route.
 */
export function buildDigest(
  forDate: string,
  habits: DigestHabit[],
  checkIns: DigestCheckIn[],
  timezone: string,
): DigestStats {
  const byHabit = new Map<string, DigestCheckIn[]>();
  for (const c of checkIns) {
    const arr = byHabit.get(c.habit_id) ?? [];
    arr.push(c);
    byHabit.set(c.habit_id, arr);
  }

  const totalCount = habits.length;
  const doneCount = habits.filter((h) =>
    (byHabit.get(h.id) ?? []).some((c) => c.date === forDate),
  ).length;
  const completionPct =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  let longestStreak = 0;
  let highlightId: string | null = null;
  for (const h of habits) {
    const { current, longest } = computeStreaks(
      byHabit.get(h.id) ?? [],
      h.period,
      h.target_per_period,
      timezone,
    );
    if (current > longestStreak) {
      longestStreak = current;
      highlightId = h.id;
    } else if (current === longestStreak && longest > 0 && highlightId === null) {
      highlightId = h.id;
    }
  }

  return {
    for_date: forDate,
    completion_pct: completionPct,
    done_count: doneCount,
    total_count: totalCount,
    longest_streak: longestStreak,
    highlight_habit_id: highlightId,
    message: composeMessage(doneCount, totalCount, longestStreak, habits, highlightId),
  };
}

function composeMessage(
  done: number,
  total: number,
  longest: number,
  habits: DigestHabit[],
  highlightId: string | null,
): string {
  if (total === 0) {
    return "No habits on file yet. Add one to start a streak.";
  }
  const highlight = highlightId
    ? habits.find((h) => h.id === highlightId)?.name
    : null;

  const completionLine =
    done === total
      ? `Clean sweep — you hit all ${total}.`
      : done === 0
        ? `Quiet day. ${total} ${total === 1 ? "habit is" : "habits are"} still waiting.`
        : `You nailed ${done} of ${total}.`;

  const streakLine =
    highlight && longest > 1
      ? ` "${highlight}" is on a ${longest}-day run.`
      : highlight && longest === 1
        ? ` "${highlight}" got off the ground today.`
        : "";

  return `${completionLine}${streakLine}`.trim();
}

/** Slice the relevant lookback window for streak math (~6 weeks is plenty). */
export function digestHorizon(forDate: string): string {
  return addDays(forDate, -45);
}
