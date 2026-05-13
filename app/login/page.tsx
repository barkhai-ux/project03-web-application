"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/logo-mark";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "confirm-sent" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setStatus("error");
        setError(error.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setStatus("error");
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setStatus("confirm-sent");
      }
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setError(null);
  }

  const submitting = status === "submitting";
  const isSignIn = mode === "signin";

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
                <span className="serif-italic text-[46px]">
                  {isSignIn ? "Sign in" : "Create account"}
                </span>
                .
              </h1>
              <p className="mt-3 text-[var(--ink-700)] leading-relaxed text-[14px]">
                {isSignIn
                  ? "Enter your email and password to continue."
                  : "Pick an email and a password. That's all we need."}
              </p>

              <div className="mt-8">
                {status === "confirm-sent" ? (
                  <div className="animate-stamp">
                    <span className="tag meeting">Confirm</span>
                    <p className="mt-3 serif-italic text-[24px]">
                      Verify your email to finish
                    </p>
                    <p className="mt-1 font-medium tabular text-[14px] break-all">
                      {email}
                    </p>
                    <p className="mt-4 text-[12px] text-[var(--ink-400)]">
                      We sent a confirmation link. Open it, then sign in.
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="btn-dark w-full justify-center mt-6"
                    >
                      Back to sign in
                      <ArrowRight size={12} />
                    </button>
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
                        autoComplete="email"
                        placeholder="you@somewhere.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="field mt-2"
                      />
                    </div>
                    <div>
                      <label
                        className="small-caps text-[var(--ink-400)]"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        autoComplete={
                          isSignIn ? "current-password" : "new-password"
                        }
                        placeholder={isSignIn ? "Your password" : "At least 6 characters"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="field mt-2"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-dark w-full justify-center"
                    >
                      {submitting
                        ? isSignIn
                          ? "Signing in…"
                          : "Creating…"
                        : isSignIn
                          ? "Sign in"
                          : "Create account"}
                      {!submitting && <ArrowRight size={12} />}
                    </button>
                    {error && (
                      <p className="serif-italic text-sm text-[var(--terra)]">
                        {error}
                      </p>
                    )}
                    <p className="text-[12px] text-[var(--ink-400)] pt-1">
                      {isSignIn ? (
                        <>
                          New here?{" "}
                          <button
                            type="button"
                            onClick={() => switchMode("signup")}
                            className="underline hover:text-[var(--ink-900)]"
                          >
                            Create an account
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => switchMode("signin")}
                            className="underline hover:text-[var(--ink-900)]"
                          >
                            Sign in
                          </button>
                        </>
                      )}
                    </p>
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
