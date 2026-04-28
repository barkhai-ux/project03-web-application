import { formatInTimeZone, toZonedTime } from "date-fns-tz";

/**
 * Today's date in the user's IANA timezone, formatted as YYYY-MM-DD.
 * Use this anywhere you would otherwise reach for `new Date().toISOString().slice(0,10)`,
 * which is timezone-buggy.
 */
export function todayInTz(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
}

export function formatDate(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

/** Add `days` to a YYYY-MM-DD date string without touching local time. */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** ISO week key (e.g. "2026-W17") for a YYYY-MM-DD date string. */
export function isoWeekKey(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // ISO week: Thursday determines the year.
  const day = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - day);
  const year = dt.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((dt.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Generate the last `n` YYYY-MM-DD date strings ending on `today`, oldest first. */
export function lastNDays(today: string, n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(today, -i));
  return out;
}

/** Convert a UTC instant to a YYYY-MM-DD date string in the given timezone. */
export function instantToDate(instant: Date, timezone: string): string {
  return formatInTimeZone(instant, timezone, "yyyy-MM-dd");
}

export { toZonedTime };
