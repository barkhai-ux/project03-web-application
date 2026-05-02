import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HabitForm } from "@/components/habit-form";
import { ArchiveButton } from "@/components/archive-button";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, color, period, target_per_period, archived_at, is_public")
    .order("created_at", { ascending: false });

  const active = habits?.filter((h) => !h.archived_at) ?? [];
  const archived = habits?.filter((h) => h.archived_at) ?? [];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-7 pb-7 pt-2 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-[22px]">
        <section>
          <header className="mb-5">
            <p className="small-caps text-[var(--terra)]">Index</p>
            <h2 className="mt-2 text-[34px] font-medium tracking-[-0.02em]">
              Your <span className="serif-italic text-[40px]">habits</span>.
            </h2>
            <p className="mt-1.5 text-[var(--ink-500)] text-[13px]">
              {active.length} {active.length === 1 ? "entry" : "entries"} on file
              {archived.length > 0 ? `, ${archived.length} retired` : ""}.
            </p>
          </header>

          {active.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="serif-italic text-[24px] text-[var(--ink-500)]">
                No habits yet. Begin on the right.
              </p>
            </div>
          ) : (
            <ul className="card divide-y divide-dashed divide-[color:var(--line)] p-0 overflow-hidden">
              {active.map((h) => (
                <li
                  key={h.id}
                  className="group flex items-center justify-between px-5 py-4"
                >
                  <Link
                    href={`/habits/${h.id}`}
                    className="flex items-center gap-3.5 no-underline ink flex-1 min-w-0"
                  >
                    <span
                      aria-hidden
                      className="block h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: h.color }}
                    />
                    <span className="serif-italic text-[22px] truncate group-hover:text-[var(--terra)] transition-colors">
                      {h.name}
                    </span>
                    <span className="text-[12px] text-[var(--ink-400)] ml-1">
                      {h.period === "day" ? "daily" : "weekly"}
                      {h.target_per_period > 1 ? ` · ${h.target_per_period}×` : ""}
                    </span>
                  </Link>
                  <div className="flex items-center gap-4">
                    <ArchiveButton habitId={h.id} archived={false} />
                    <Link
                      href={`/habits/${h.id}`}
                      aria-label="Open"
                      className="text-[var(--ink-400)] group-hover:text-[var(--ink-900)] transition-colors"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {archived.length > 0 && (
            <details className="mt-5 card p-5">
              <summary className="cursor-pointer small-caps text-[var(--ink-400)] hover:text-[var(--ink-900)]">
                Retired ({archived.length})
              </summary>
              <ul className="mt-4 space-y-2 text-sm">
                {archived.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between text-[var(--ink-500)]"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="h-2 w-2 rounded-full opacity-60"
                        style={{ backgroundColor: h.color }}
                      />
                      <span className="serif-italic">{h.name}</span>
                    </span>
                    <ArchiveButton habitId={h.id} archived={true} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <aside className="card h-fit p-6 md:sticky md:top-3 animate-fade-up">
          <p className="small-caps text-[var(--ink-400)]">New entry</p>
          <h2 className="mt-1.5 text-[24px] font-medium tracking-[-0.02em]">
            <span className="serif-italic text-[28px]">Begin</span> something.
          </h2>
          <div className="mt-5">
            <HabitForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
