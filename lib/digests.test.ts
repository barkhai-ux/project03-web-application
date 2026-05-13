import { describe, expect, it } from "vitest";
import { buildDigest, type DigestHabit } from "./digests";
import { addDays, todayInTz } from "./dates";

const TZ = "Asia/Ulaanbaatar";

const habits: DigestHabit[] = [
  { id: "h1", name: "Meditate", period: "day", target_per_period: 1 },
  { id: "h2", name: "Read", period: "day", target_per_period: 1 },
  { id: "h3", name: "Run", period: "week", target_per_period: 3 },
];

describe("buildDigest", () => {
  const today = todayInTz(TZ);

  it("returns 0% with empty habit list", () => {
    const d = buildDigest(today, [], [], TZ);
    expect(d.completion_pct).toBe(0);
    expect(d.total_count).toBe(0);
    expect(d.message).toMatch(/no habits/i);
  });

  it("computes completion when some habits are done today", () => {
    const checks = [
      { habit_id: "h1", date: today, count: 1 },
      { habit_id: "h2", date: today, count: 1 },
    ];
    const d = buildDigest(today, habits, checks, TZ);
    expect(d.done_count).toBe(2);
    expect(d.total_count).toBe(3);
    expect(d.completion_pct).toBe(67);
  });

  it("reports clean-sweep message when every habit is done", () => {
    const checks = [
      { habit_id: "h1", date: today, count: 1 },
      { habit_id: "h2", date: today, count: 1 },
      { habit_id: "h3", date: today, count: 3 },
    ];
    const d = buildDigest(today, habits, checks, TZ);
    expect(d.completion_pct).toBe(100);
    expect(d.message).toMatch(/clean sweep/i);
  });

  it("highlights the habit with the longest active streak", () => {
    const longRun = [0, 1, 2, 3, 4].map((n) => ({
      habit_id: "h1",
      date: addDays(today, -n),
      count: 1,
    }));
    const shortRun = [{ habit_id: "h2", date: today, count: 1 }];
    const d = buildDigest(today, habits, [...longRun, ...shortRun], TZ);
    expect(d.highlight_habit_id).toBe("h1");
    expect(d.longest_streak).toBe(5);
    expect(d.message).toContain("Meditate");
  });

  it("uses 'quiet day' wording when nothing is checked off today", () => {
    const yesterdayOnly = [{ habit_id: "h1", date: addDays(today, -1), count: 1 }];
    const d = buildDigest(today, habits, yesterdayOnly, TZ);
    expect(d.done_count).toBe(0);
    expect(d.message).toMatch(/quiet day/i);
  });
});
