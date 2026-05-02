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

  const initial = (profile?.display_name ?? user.email ?? "M")
    .charAt(0)
    .toUpperCase();

  const { count: habitCount } = await supabase
    .from("habits")
    .select("id", { count: "exact", head: true })
    .is("archived_at", null);

  const { count: checkInCount } = await supabase
    .from("check_ins")
    .select("id", { count: "exact", head: true });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-7 pb-7 pt-2 animate-fade-up">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h2 className="text-[26px] font-medium tracking-[-0.02em]">
            Your <span className="serif-italic text-[30px]">space</span>
          </h2>
          <div className="text-[var(--ink-500)] text-[13px] mt-1">
            Make Final feel like yours.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-[18px]">
        {/* Profile card */}
        <div className="card p-6 text-center h-fit">
          <div
            className="w-[84px] h-[84px] rounded-full grid place-items-center text-white font-semibold text-[32px] mx-auto mt-2 mb-3.5 border-2"
            style={{
              background: "linear-gradient(135deg, #f0c896 0%, #c98a5a 100%)",
              borderColor: "#fbf3e6",
            }}
          >
            {initial}
          </div>
          <div className="serif-italic text-[28px] leading-none">
            {profile?.display_name || "Friend"}
          </div>
          <div className="text-[var(--ink-500)] text-[13px] mt-1">{user.email}</div>

          <div className="grid grid-cols-3 gap-2 mt-[22px] pt-[22px] border-t border-dashed border-[color:var(--line)]">
            <Stat label="Habits" value={habitCount ?? 0} />
            <Stat label="Check-ins" value={checkInCount ?? 0} />
            <Stat label="Timezone" value={shortTz(profile?.timezone ?? "UTC")} />
          </div>
        </div>

        {/* Settings stack */}
        <div className="flex flex-col gap-[18px]">
          <form action={updateProfile} className="card p-[6px_22px]">
            <SectionTitle>Profile</SectionTitle>
            <Field
              label="Display name"
              hint="Shown on your dashboard greeting."
            >
              <input
                type="text"
                name="display_name"
                defaultValue={profile?.display_name ?? ""}
                maxLength={60}
                placeholder="What should we call you?"
                className="field"
              />
            </Field>
            <Field
              label="Timezone"
              hint="When 'today' rolls over for streak math."
            >
              <select
                name="timezone"
                defaultValue={profile?.timezone ?? "UTC"}
                className="field field-select"
              >
                {COMMON_TZS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Public slug"
              hint="Leave blank to keep your record private."
            >
              <input
                type="text"
                name="public_slug"
                defaultValue={profile?.public_slug ?? ""}
                pattern="[a-z0-9-]{3,30}"
                placeholder="e.g. arkhai"
                className="field"
              />
            </Field>
            <div className="py-4">
              <button type="submit" className="btn-dark">
                Save preferences
              </button>
            </div>
          </form>

          <form action="/auth/sign-out" method="POST" className="card p-[18px_22px]">
            <SectionTitle>Account</SectionTitle>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-[14px] font-medium">Sign out</div>
                <div className="text-[12px] text-[var(--ink-500)] mt-0.5">
                  End your session on this device.
                </div>
              </div>
              <button type="submit" className="btn-soft">
                Sign out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function shortTz(tz: string): string {
  const parts = tz.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="serif-italic text-[24px]">{value}</div>
      <div className="text-[11px] text-[var(--ink-500)]">{label}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold text-[var(--ink-400)] tracking-[0.1em] uppercase pt-3.5 pb-1">
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-dashed border-[color:var(--line)] last:border-b-0 gap-6">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium">{label}</div>
        {hint && (
          <div className="text-[12px] text-[var(--ink-500)] mt-0.5 max-w-[380px]">
            {hint}
          </div>
        )}
      </div>
      <div className="w-[240px] flex-shrink-0">{children}</div>
    </div>
  );
}
