import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/logo-mark";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen items-start justify-center p-6 md:p-7">
      <div className="shell w-full max-w-[1360px] min-h-[calc(100vh-3rem)]">
        <div className="hero-photo" aria-hidden />
        <div className="hero-tint" aria-hidden />
        <div className="shell-inner">
          <header className="flex items-center justify-between px-7 pt-[18px] pb-2.5">
            <div className="flex items-center gap-2.5 ink">
              <LogoMark size={28} />
              <span className="text-[18px] font-semibold tracking-[-0.01em]">
                Final
              </span>
            </div>
            <Link
              href="/login"
              className="small-caps text-[var(--ink-500)] hover:text-[var(--ink-900)] transition-colors no-underline"
            >
              Sign in
            </Link>
          </header>

          <main className="flex-1 flex flex-col px-7 pb-12">
            <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pt-12 md:pt-20 items-center">
              <div className="md:col-span-7 animate-fade-up">
                <span className="tag voice">Vol. I &middot; A cozy ritual</span>
                <h1 className="mt-5 text-[clamp(3rem,8vw,5.5rem)] leading-[0.98] tracking-[-0.02em] font-medium">
                  Keep a{" "}
                  <span className="serif-italic">quiet</span>
                  <br />
                  record.
                </h1>
                <p className="mt-7 max-w-md text-[17px] leading-relaxed text-[var(--ink-700)]">
                  Final is a small, deliberate habit tracker. No notifications,
                  no medals, no streak shame. Just a page in a book you keep
                  coming back to.
                </p>

                <div className="mt-9 flex items-center gap-5">
                  <Link href="/login" className="btn-dark no-underline">
                    Begin <ArrowRight size={12} />
                  </Link>
                  <span className="small-caps text-[var(--ink-400)]">
                    Free &middot; open source
                  </span>
                </div>
              </div>

              <div
                className="md:col-span-5 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <DecorativeHeatmap />
                <p className="mt-3 serif-italic text-[14px] text-[var(--ink-500)] text-center">
                  ~ ninety-two days, gently logged ~
                </p>
              </div>
            </section>

            <section className="grid gap-8 md:grid-cols-3 mt-16 mb-6">
              <Tenet
                number="i."
                title="Mornings, not midnights"
                body="Today rolls over in your timezone, not UTC. A check-in at 11pm is a check-in for today."
              />
              <Tenet
                number="ii."
                title="Targets, not pressure"
                body="Daily or weekly cadence, with a custom target count. Skip a day, the streak waits."
              />
              <Tenet
                number="iii."
                title="A page, not a feed"
                body="Twelve months of check-ins as a single inked grid. Print-ready, glanceable, kept."
              />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function Tenet({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card p-6">
      <span className="serif-italic text-[24px] text-[var(--terra)]">{number}</span>
      <h3 className="mt-2 text-[20px] font-medium tracking-[-0.01em]">{title}</h3>
      <p className="mt-1.5 text-[var(--ink-700)] text-[14px] leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function DecorativeHeatmap() {
  const seed = (i: number) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const tier = (r: number) => {
    if (r < 0.25) return null;
    if (r < 0.45) return "#e9dcc1";
    if (r < 0.65) return "#d8b97a";
    if (r < 0.82) return "#3e7a52";
    return "#2d5a3d";
  };
  return (
    <svg viewBox="0 0 320 180" className="w-full">
      {Array.from({ length: 13 }).map((_, col) =>
        Array.from({ length: 7 }).map((_, row) => {
          const i = col * 7 + row;
          const r = seed(i);
          const fill = tier(r);
          const x = col * 22 + 6;
          const y = row * 22 + 14;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={16}
              height={16}
              rx={4}
              fill={fill ?? "rgba(0,0,0,0.05)"}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={0.6}
            />
          );
        }),
      )}
    </svg>
  );
}
