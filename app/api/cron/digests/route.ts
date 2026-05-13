import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { buildDigest, digestHorizon } from "@/lib/digests";
import { todayInTz } from "@/lib/dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Autonomous daily-digest generator.
 *
 * Intended to be invoked once a day by Vercel Cron (or a Ralph Wiggum loop).
 * Iterates every user with at least one active habit and upserts a digest
 * row for that user's "today" (in their own timezone).
 *
 * Gated by CRON_SECRET — request must carry:
 *   Authorization: Bearer ${CRON_SECRET}
 *
 * Vercel Cron sends this header automatically when the env var is set.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Pull every profile + their habits in two reads. For a small project this is
  // fine; a real deployment would page or push the loop into a SQL function.
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, timezone");
  if (profilesError) {
    return NextResponse.json(
      { error: profilesError.message },
      { status: 500 },
    );
  }

  let processed = 0;
  let skipped = 0;
  const errors: Array<{ userId: string; message: string }> = [];

  for (const profile of profiles ?? []) {
    const tz = profile.timezone ?? "UTC";
    const today = todayInTz(tz);
    const horizon = digestHorizon(today);

    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select("id, name, period, target_per_period")
      .eq("user_id", profile.id)
      .is("archived_at", null);

    if (habitsError) {
      errors.push({ userId: profile.id, message: habitsError.message });
      continue;
    }
    if (!habits || habits.length === 0) {
      skipped++;
      continue;
    }

    const habitIds = habits.map((h) => h.id);
    const { data: checkIns, error: checkInsError } = await supabase
      .from("check_ins")
      .select("habit_id, date, count")
      .in("habit_id", habitIds)
      .gte("date", horizon);

    if (checkInsError) {
      errors.push({ userId: profile.id, message: checkInsError.message });
      continue;
    }

    const digest = buildDigest(today, habits, checkIns ?? [], tz);

    const { error: upsertError } = await supabase.from("digests").upsert(
      {
        user_id: profile.id,
        for_date: digest.for_date,
        completion_pct: digest.completion_pct,
        done_count: digest.done_count,
        total_count: digest.total_count,
        longest_streak: digest.longest_streak,
        highlight_habit_id: digest.highlight_habit_id,
        message: digest.message,
      },
      { onConflict: "user_id,for_date" },
    );

    if (upsertError) {
      errors.push({ userId: profile.id, message: upsertError.message });
      continue;
    }
    processed++;
  }

  return NextResponse.json({
    ok: errors.length === 0,
    processed,
    skipped,
    total: profiles?.length ?? 0,
    errors,
  });
}
