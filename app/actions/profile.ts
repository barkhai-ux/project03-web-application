"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ProfileSchema = z.object({
  display_name: z.string().trim().max(60).optional().or(z.literal("")),
  timezone: z.string().min(1).max(60),
  public_slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,30}$/u, "Slug must be 3-30 chars, a-z 0-9 -")
    .optional()
    .or(z.literal("")),
});

export async function updateProfile(formData: FormData): Promise<void> {
  const parsed = ProfileSchema.safeParse({
    display_name: formData.get("display_name") ?? "",
    timezone: formData.get("timezone") ?? "UTC",
    public_slug: formData.get("public_slug") ?? "",
  });
  if (!parsed.success) {
    redirect("/settings?error=" + encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid"));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { display_name, timezone, public_slug } = parsed.data;
  await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: display_name || null,
      timezone,
      public_slug: public_slug || null,
    });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  redirect("/settings?ok=1");
}
