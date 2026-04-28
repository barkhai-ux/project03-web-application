import { createClient } from "@/lib/supabase/server";
import { HabitForm } from "@/components/habit-form";
import { ArchiveButton } from "@/components/archive-button";
import Link from "next/link";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, color, period, target_per_period, archived_at, is_public")
    .order("created_at", { ascending: false });

  const active = habits?.filter((h) => !h.archived_at) ?? [];
  const archived = habits?.filter((h) => h.archived_at) ?? [];

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your habits</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {active.length} active{archived.length > 0 ? `, ${archived.length} archived` : ""}.
          </p>
        </div>

        {active.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No habits yet. Create one on the right to get started.
          </div>
        ) : (
          <ul className="space-y-2">
            {active.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <Link href={`/habits/${h.id}`} className="flex items-center gap-3 hover:underline">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: h.color }}
                  />
                  <span className="font-medium">{h.name}</span>
                  <span className="text-xs text-zinc-500">
                    {h.period === "day" ? "daily" : "weekly"}
                    {h.target_per_period > 1 ? ` · ${h.target_per_period}×` : ""}
                  </span>
                </Link>
                <ArchiveButton habitId={h.id} archived={false} />
              </li>
            ))}
          </ul>
        )}

        {archived.length > 0 && (
          <details className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">
              Archived ({archived.length})
            </summary>
            <ul className="mt-3 space-y-1">
              {archived.map((h) => (
                <li key={h.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} />
                    {h.name}
                  </span>
                  <ArchiveButton habitId={h.id} archived={true} />
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <aside className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="mb-4 font-medium">New habit</h2>
        <HabitForm />
      </aside>
    </div>
  );
}
