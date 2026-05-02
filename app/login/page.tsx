"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/logo-mark";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center p-6 md:p-7">
      <div className="shell w-full max-w-[1360px] min-h-[calc(100vh-3rem)]">
        <div className="hero-photo" aria-hidden />
        <div className="hero-tint" aria-hidden />
        <div className="shell-inner">
          <header className="flex items-center px-7 pt-[18px] pb-2.5">
            <Link href="/" className="inline-flex items-center gap-2.5 ink no-underline">
              <LogoMark size={28} />
              <span className="text-[18px] font-semibold tracking-[-0.01em]">
                Final
              </span>
            </Link>
          </header>

          <main className="flex-1 flex items-center justify-center px-7 pb-12">
            <div className="card w-full max-w-[440px] p-10 animate-fade-up">
              <span className="tag streak">Folio &middot; 1</span>
              <h1 className="mt-4 text-[40px] font-medium tracking-[-0.02em] leading-none">
                <span className="serif-italic text-[46px]">Sign in</span>.
              </h1>
              <p className="mt-3 text-[var(--ink-700)] leading-relaxed text-[14px]">
                We&apos;ll send a one-time link to your inbox. No password to forget,
                no account to create.
              </p>

              <div className="mt-8">
                {status === "sent" ? (
                  <div className="animate-stamp">
                    <span className="tag meeting">Mailed</span>
                    <p className="mt-3 serif-italic text-[24px]">
                      A link is on its way to
                    </p>
                    <p className="mt-1 font-medium tabular text-[14px] break-all">
                      {email}
                    </p>
                    <p className="mt-4 text-[12px] text-[var(--ink-400)]">
                      Check spam if it doesn&apos;t arrive within a minute.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                      <label
                        className="small-caps text-[var(--ink-400)]"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        placeholder="you@somewhere.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="field mt-2"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="btn-dark w-full justify-center"
                    >
                      {status === "sending" ? "Mailing…" : "Send link"}
                      {status !== "sending" && <ArrowRight size={12} />}
                    </button>
                    {error && (
                      <p className="serif-italic text-sm text-[var(--terra)]">
                        {error}
                      </p>
                    )}
                  </form>
                )}
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 mt-8 small-caps text-[var(--ink-400)] hover:text-[var(--ink-900)] no-underline"
              >
                <ArrowLeft size={12} /> Back
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
