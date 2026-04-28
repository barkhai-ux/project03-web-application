import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-semibold">
            Habit Tracker
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/dashboard"
              className="text-zinc-600 hover:text-foreground dark:text-zinc-400"
            >
              Dashboard
            </Link>
            <Link
              href="/habits"
              className="text-zinc-600 hover:text-foreground dark:text-zinc-400"
            >
              Habits
            </Link>
            <Link
              href="/settings"
              className="text-zinc-600 hover:text-foreground dark:text-zinc-400"
            >
              Settings
            </Link>
            <form action="/auth/sign-out" method="POST">
              <button
                type="submit"
                className="text-zinc-600 hover:text-foreground dark:text-zinc-400"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
