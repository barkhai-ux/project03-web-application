import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/actions/profile";

const COMMON_TZS = [
  "UTC",
  "Asia/Ulaanbaatar",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
];

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, timezone, public_slug")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {user.email}
        </p>
      </div>

      <form action={updateProfile} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Display name</label>
          <input
            type="text"
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            maxLength={60}
            placeholder="What should we call you?"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Timezone</label>
          <select
            name="timezone"
            defaultValue={profile?.timezone ?? "UTC"}
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          >
            {COMMON_TZS.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Determines when "today" rolls over for streak calculations.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Public profile slug
          </label>
          <input
            type="text"
            name="public_slug"
            defaultValue={profile?.public_slug ?? ""}
            pattern="[a-z0-9-]{3,30}"
            placeholder="leave blank to keep profile private"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
          <p className="mt-1 text-xs text-zinc-500">
            If set, your profile becomes visible at /u/&lt;slug&gt;.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Save
        </button>
      </form>
    </div>
  );
}
