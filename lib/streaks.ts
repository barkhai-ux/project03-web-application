import { addDays, isoWeekKey, todayInTz } from "./dates";

export type CheckInRow = { date: string; count: number };
export type Period = "day" | "week";

export interface StreakResult {
  current: number;
  longest: number;
}

/**
 * Compute current and longest streaks for a habit.
 *
 * Daily habits: a streak is consecutive days where the user met `target_per_period`.
 * Weekly habits: a streak is consecutive ISO weeks where the user's total count for
 * that week reached `target_per_period`.
 *
 * Today (or the current week) is "in progress" — failing to meet today's target
 * does NOT break the streak, but meeting it extends it.
 */
export function computeStreaks(
  checkIns: CheckInRow[],
  period: Period,
  targetPerPeriod: number,
  timezone: string,
): StreakResult {
  const today = todayInTz(timezone);

  if (period === "day") {
    return computeDailyStreaks(checkIns, targetPerPeriod, today);
  }
  return computeWeeklyStreaks(checkIns, targetPerPeriod, today);
}

function computeDailyStreaks(
  checkIns: CheckInRow[],
  target: number,
  today: string,
): StreakResult {
  const totals = new Map<string, number>();
  for (const c of checkIns) {
    totals.set(c.date, (totals.get(c.date) ?? 0) + c.count);
  }

  // Current streak: walk backwards from today; if today isn't met, start from yesterday.
  let current = 0;
  let cursor = today;
  if ((totals.get(cursor) ?? 0) < target) {
    cursor = addDays(cursor, -1);
  }
  while ((totals.get(cursor) ?? 0) >= target) {
    current++;
    cursor = addDays(cursor, -1);
  }

  // Longest: scan all met-days, find the longest run of consecutive dates.
  const metDays = [...totals.entries()]
    .filter(([, total]) => total >= target)
    .map(([d]) => d)
    .sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of metDays) {
    if (prev !== null && addDays(prev, 1) === d) run++;
    else run = 1;
    if (run > longest) longest = run;
    prev = d;
  }

  return { current: Math.max(current, 0), longest: Math.max(longest, current) };
}

function computeWeeklyStreaks(
  checkIns: CheckInRow[],
  target: number,
  today: string,
): StreakResult {
  const weekTotals = new Map<string, number>();
  for (const c of checkIns) {
    const wk = isoWeekKey(c.date);
    weekTotals.set(wk, (weekTotals.get(wk) ?? 0) + c.count);
  }

  // Current streak: walk back from current week.
  const todayWk = isoWeekKey(today);
  let current = 0;
  let cursor = todayWk;
  if ((weekTotals.get(cursor) ?? 0) < target) {
    cursor = prevWeekKey(cursor);
  }
  while ((weekTotals.get(cursor) ?? 0) >= target) {
    current++;
    cursor = prevWeekKey(cursor);
  }

  const metWeeks = [...weekTotals.entries()]
    .filter(([, total]) => total >= target)
    .map(([w]) => w)
    .sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const w of metWeeks) {
    if (prev !== null && nextWeekKey(prev) === w) run++;
    else run = 1;
    if (run > longest) longest = run;
    prev = w;
  }

  return { current: Math.max(current, 0), longest: Math.max(longest, current) };
}

function prevWeekKey(wk: string): string {
  return shiftWeek(wk, -1);
}

function nextWeekKey(wk: string): string {
  return shiftWeek(wk, 1);
}

function shiftWeek(wk: string, delta: number): string {
  const [y, w] = wk.split("-W").map(Number);
  // Approximate: take a Thursday in the given week, shift by 7*delta days, recompute.
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1));
  const targetThursday = new Date(week1Monday);
  targetThursday.setUTCDate(week1Monday.getUTCDate() + (w - 1) * 7 + 3 + delta * 7);
  const dateStr = targetThursday.toISOString().slice(0, 10);
  return isoWeekKey(dateStr);
}
