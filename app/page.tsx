import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="max-w-xl space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Build streaks that stick.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          A minimal habit tracker — daily check-ins, contribution heatmaps, and
          shareable streaks. Sign in with a magic link to get started.
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-full bg-foreground px-6 py-3 text-background transition-colors hover:opacity-90"
      >
        Sign in
      </Link>
    </main>
  );
}
