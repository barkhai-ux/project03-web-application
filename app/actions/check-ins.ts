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

  await supabase
    .from("check_ins")
    .update({ note: note.trim() || null })
    .eq("habit_id", habitId)
    .eq("date", date)
    .eq("user_id", user.id);

  revalidatePath(`/habits/${habitId}`);
}
