import { describe, expect, it } from "vitest";
import { computeStreaks } from "./streaks";
import { addDays, isoWeekKey, todayInTz } from "./dates";

const TZ = "Asia/Ulaanbaatar";

function seed(today: string, daysAgo: number[], count = 1) {
  return daysAgo.map((d) => ({ date: addDays(today, -d), count }));
}

describe("daily streaks", () => {
  const today = todayInTz(TZ);

  it("counts an unbroken 5-day run as current=5, longest=5", () => {
    const checks = seed(today, [0, 1, 2, 3, 4]);
    const { current, longest } = computeStreaks(checks, "day", 1, TZ);
    expect(current).toBe(5);
    expect(longest).toBe(5);
  });

  it("does not break the streak if today is missing (today is in-progress)", () => {
    const checks = seed(today, [1, 2, 3, 4]);
    const { current } = computeStreaks(checks, "day", 1, TZ);
    expect(current).toBe(4);
  });

  it("breaks the streak after a missed yesterday + day-before", () => {
    const checks = seed(today, [3, 4, 5]);
    const { current, longest } = computeStreaks(checks, "day", 1, TZ);
    expect(current).toBe(0);
    expect(longest).toBe(3);
  });

  it("with a gap on day 5, current = post-gap run, longest = longer segment", () => {
    // last 10 days, gap on day 5 ago: days 0-4 done, day 5 missed, days 6-9 done
    const checks = seed(today, [0, 1, 2, 3, 4, 6, 7, 8, 9]);
    const { current, longest } = computeStreaks(checks, "day", 1, TZ);
    expect(current).toBe(5);
    expect(longest).toBe(5);
  });

  it("requires target_per_period to be met", () => {
    const checks = [
      { date: addDays(today, 0), count: 1 },
      { date: addDays(today, -1), count: 2 },
      { date: addDays(today, -2), count: 1 },
    ];
    const { current } = computeStreaks(checks, "day", 2, TZ);
    expect(current).toBe(1);
  });
});

describe("weekly streaks", () => {
  const today = todayInTz(TZ);
  const thisWeek = isoWeekKey(today);

  it("counts current week as part of streak when target met", () => {
    const checks = [{ date: today, count: 3 }];
    const { current } = computeStreaks(checks, "week", 3, TZ);
    expect(current).toBe(1);
    expect(thisWeek).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("does not break when current week is in-progress (below target)", () => {
    // last week: 3 check-ins (target met). this week: 0 check-ins.
    const checks = [{ date: addDays(today, -7), count: 3 }];
    const { current } = computeStreaks(checks, "week", 3, TZ);
    expect(current).toBe(1);
  });
});

describe("edge cases", () => {
  it("returns zero streaks for empty check-ins", () => {
    expect(computeStreaks([], "day", 1, TZ)).toEqual({ current: 0, longest: 0 });
  });
});
