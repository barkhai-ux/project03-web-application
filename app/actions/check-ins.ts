"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayInTz } from "@/lib/dates";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function authAndToday(): Promise<{
  supabase: SupabaseClient;
  userId: string;
  today: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();
  const tz = data?.timezone ?? "UTC";
  return { supabase, userId: user.id, today: todayInTz(tz) };
}

export async function toggleCheckInToday(habitId: string): Promise<void> {
  const { supabase, userId, today } = await authAndToday();

  const { data: existing } = await supabase
    .from("check_ins")
    .select("id, count")
    .eq("habit_id", habitId)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    await supabase.from("check_ins").delete().eq("id", existing.id);
  } else {
    await supabase.from("check_ins").insert({
      habit_id: habitId,
      user_id: userId,
      date: today,
      count: 1,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/habits/${habitId}`);
}

export async function incrementCheckInToday(habitId: string): Promise<void> {
  const { supabase, userId, today } = await authAndToday();

  const { data: existing } = await supabase
    .from("check_ins")
    .select("id, count")
    .eq("habit_id", habitId)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("check_ins")
      .update({ count: existing.count + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("check_ins").insert({
      habit_id: habitId,
      user_id: userId,
      date: today,
      count: 1,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/habits/${habitId}`);
}

export async function decrementCheckInToday(habitId: string): Promise<void> {
  const { supabase, today } = await authAndToday();

  const { data: existing } = await supabase
    .from("check_ins")
    .select("id, count")
    .eq("habit_id", habitId)
    .eq("date", today)
    .maybeSingle();

  if (!existing) return;

  if (existing.count <= 1) {
    await supabase.from("check_ins").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("check_ins")
      .update({ count: existing.count - 1 })
      .eq("id", existing.id);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/habits/${habitId}`);
}

export async function setCheckInCountToday(
  habitId: string,
  count: number,
): Promise<void> {
  const { supabase, userId, today } = await authAndToday();

  const safe = Math.max(0, Math.min(1_000_000, Math.floor(count)));

  const { data: existing } = await supabase
    .from("check_ins")
    .select("id")
    .eq("habit_id", habitId)
    .eq("date", today)
    .maybeSingle();

  if (safe === 0) {
    if (existing) {
      await supabase.from("check_ins").delete().eq("id", existing.id);
    }
  } else if (existing) {
    await supabase
      .from("check_ins")
      .update({ count: safe })
      .eq("id", existing.id);
  } else {
    await supabase.from("check_ins").insert({
      habit_id: habitId,
      user_id: userId,
      date: today,
      count: safe,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/habits/${habitId}`);
}

export async function setCheckInCountOnDate(
  habitId: string,
  date: string,
  count: number,
): Promise<void> {
  const { supabase, userId, today } = await authAndToday();

  // Refuse future dates (can't pre-check tomorrow).
  if (date > today) return;

  const safe = Math.max(0, Math.min(1_000_000, Math.floor(count)));

  const { data: existing } = await supabase
    .from("check_ins")
    .select("id, note")
    .eq("habit_id", habitId)
    .eq("date", date)
    .maybeSingle();

  if (safe === 0) {
    // Only delete if there's no note attached (otherwise the user loses it silently).
    if (existing && !existing.note) {
      await supabase.from("check_ins").delete().eq("id", existing.id);
    } else if (existing) {
      await supabase
        .from("check_ins")
        .update({ count: 1 })
        .eq("id", existing.id);
    }
  } else if (existing) {
    await supabase
      .from("check_ins")
      .update({ count: safe })
      .eq("id", existing.id);
  } else {
    await supabase.from("check_ins").insert({
      habit_id: habitId,
      user_id: userId,
      date,
      count: safe,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/habits/${habitId}`);
}

export async function setCheckInNote(
  habitId: string,
  date: string,
  note: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trimmed = note.trim() || null;

  // Notes attach to existing check-ins (schema requires count > 0). If there's no
  // row for that date yet, create one with count = 1 so the note has somewhere to live.
  const { data: existing } = await supabase
    .from("check_ins")
    .select("id")
    .eq("habit_id", habitId)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("check_ins")
      .update({ note: trimmed })
      .eq("id", existing.id);
  } else if (trimmed !== null) {
    await supabase.from("check_ins").insert({
      habit_id: habitId,
      user_id: user.id,
      date,
      count: 1,
      note: trimmed,
    });
  }

  revalidatePath(`/habits/${habitId}`);
}
