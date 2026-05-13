import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/logo-mark";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, timezone, public_slug")
    .eq("public_slug", slug)
    .maybeSingle();

  if (!profile) notFound();

  const name = profile.display_name ?? slug;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative flex min-h-screen items-start justify-center p-6 md:p-7">
      <div className="shell w-full max-w-[1100px] min-h-[calc(100vh-3rem)]">
        <div className="shell-inner">
          <header className="flex items-center justify-between px-7 pt-[18px] pb-2.5">
            <Link href="/" className="inline-flex items-center gap-2.5 ink no-underline">
              <LogoMark size={28} />
              <span className="text-[18px] font-semibold tracking-[-0.01em]">
                Final
              </span>
            </Link>
            <span className="small-caps text-[var(--ink-400)]">Public folio</span>
          </header>

          <main className="flex-1 flex flex-col px-7 pb-12 pt-2 gap-6">
            <div className="card p-8 flex items-center gap-5 animate-fade-up">
              <div
                className="w-[72px] h-[72px] rounded-full grid place-items-center text-white font-semibold text-[28px] border-2"
                style={{
                  background: "linear-gradient(135deg, #f0c896 0%, #c98a5a 100%)",
                  borderColor: "#fbf3e6",
                }}
              >
                {initial}
              </div>
              <div className="flex-1">
                <div className="serif-italic text-[36px] leading-none">{name}</div>
                <div className="text-[var(--ink-500)] text-[13px] mt-2">
                  @{slug} &middot; {profile.timezone}
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 small-caps text-[var(--ink-400)] hover:text-[var(--ink-900)] no-underline"
              >
                <ArrowLeft size={12} /> Home
              </Link>
            </div>

            <div className="card p-8 text-center animate-fade-up">
              <p className="serif-italic text-[22px] text-[var(--ink-500)]">
                Their rituals will appear here soon.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
