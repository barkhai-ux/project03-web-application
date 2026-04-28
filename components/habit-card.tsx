import Link from "next/link";
import type { CheckInRow } from "@/lib/streaks";
import { computeStreaks } from "@/lib/streaks";
import { CheckInToggle } from "./check-in-toggle";

interface Props {
  habit: {
    id: string;
    name: string;
    color: string;
    period: "day" | "week";
    target_per_period: number;
  };
  checkIns: CheckInRow[];
  doneToday: boolean;
  timezone: string;
}

export function HabitCard({ habit, checkIns, doneToday, timezone }: Props) {
  const { current, longest } = computeStreaks(
    checkIns,
    habit.period,
    habit.target_per_period,
    timezone,
  );

  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <CheckInToggle habitId={habit.id} done={doneToday} color={habit.color} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/habits/${habit.id}`}
          className="block truncate font-medium hover:underline"
        >
          {habit.name}
        </Link>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {habit.period === "day" ? "Daily" : "Weekly"}
          {habit.target_per_period > 1
            ? ` · ${habit.target_per_period}× per ${habit.period}`
            : ""}
        </p>
      </div>
      <div className="text-right">
        <div
          className="text-lg font-semibold tabular-nums"
          style={{ color: habit.color }}
        >
          {current}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          best {longest}
        </div>
      </div>
    </div>
  );
}
