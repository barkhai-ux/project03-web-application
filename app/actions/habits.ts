"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const HabitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/u, "Color must be a hex like #10b981")
    .default("#10b981"),
  icon: z.string().trim().max(40).optional().or(z.literal("")),
  period: z.enum(["day", "week"]),
  target_per_period: z.coerce.number().int().min(1).max(100).default(1),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createHabit(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = HabitSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || "#10b981",
    icon: formData.get("icon") ?? "",
    period: formData.get("period") || "day",
    target_per_period: formData.get("target_per_period") ?? 1,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name: parsed.data.name,
    color: parsed.data.color,
    icon: parsed.data.icon || null,
    period: parsed.data.period,
    target_per_period: parsed.data.target_per_period,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function archiveHabit(habitId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("habits")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", habitId)
    .eq("user_id", user.id);

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function unarchiveHabit(habitId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("habits")
    .update({ archived_at: null })
    .eq("id", habitId)
    .eq("user_id", user.id);

  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function setHabitVisibility(
  habitId: string,
  isPublic: boolean,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("habits")
    .update({ is_public: isPublic })
    .eq("id", habitId)
    .eq("user_id", user.id);

  revalidatePath("/habits");
  revalidatePath(`/habits/${habitId}`);
}
