"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildDigest, digestHorizon } from "@/lib/digests";
import { todayInTz } from "@/lib/dates";

export async function generateTodaysDigest(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();
  const tz = profile?.timezone ?? "UTC";
  const today = todayInTz(tz);

  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, period, target_per_period")
    .is("archived_at", null);

  const habitIds = (habits ?? []).map((h) => h.id);
  const { data: checkIns } = habitIds.length
    ? await supabase
        .from("check_ins")
        .select("habit_id, date, count")
        .in("habit_id", habitIds)
        .gte("date", digestHorizon(today))
    : { data: [] as { habit_id: string; date: string; count: number }[] };

  const digest = buildDigest(today, habits ?? [], checkIns ?? [], tz);

  await supabase.from("digests").upsert(
    {
      user_id: user.id,
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

  revalidatePath("/dashboard");
}
