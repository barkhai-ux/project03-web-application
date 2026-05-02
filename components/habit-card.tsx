import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
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

  const cadenceLabel =
    habit.period === "day" ? "Daily ritual" : "Weekly cadence";
  const targetLabel =
    habit.target_per_period > 1
      ? `${habit.target_per_period}× per ${habit.period}`
      : "1× target";

  return (
    <article className="card p-[18px_20px] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(60,40,20,0.22)]">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="w-[22px] h-[22px] rounded-md grid place-items-center"
            style={{ background: habit.color, opacity: 0.9 }}
          >
            <span
              className="block w-2 h-2 rounded-full"
              style={{ background: "white" }}
            />
          </span>
          <Link
            href={`/habits/${habit.id}`}
            className={
              "text-[18px] font-medium tracking-[-0.01em] ink no-underline transition-colors hover:text-[var(--terra)] " +
              (doneToday ? "line-through decoration-[rgba(0,0,0,0.25)] decoration-[1px]" : "")
            }
          >
            {habit.name}
          </Link>
        </div>
        <span
          className={
            "tag " + (doneToday ? "meeting" : habit.period === "day" ? "task" : "voice")
          }
        >
          {doneToday ? "Done today" : cadenceLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <Meta k="Cadence" v={targetLabel} />
        <Meta
          k="Streak"
          v={
            current > 0 ? (
              <span className="inline-flex items-center gap-1 tabular">
                <Flame size={11} style={{ color: habit.color }} />
                {current} {current === 1 ? "day" : "days"}
              </span>
            ) : (
              "Begin again"
            )
          }
        />
        <Meta k="Best" v={`${longest} ${longest === 1 ? "day" : "days"}`} />
      </div>

      <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-dashed border-[color:var(--line-2)]">
        <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-500)]">
          <CheckInToggle habitId={habit.id} done={doneToday} color={habit.color} />
          <span>{doneToday ? "Marked complete" : "Ready when you are"}</span>
        </div>
        <Link href={`/habits/${habit.id}`} className="btn-soft no-underline">
          View
          <ArrowRight size={12} />
        </Link>
      </div>
    </article>
  );
}

function Meta({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="text-[12px]">
      <div className="text-[var(--ink-400)] mb-1 text-[11px]">{k}</div>
      <div className="text-[var(--ink-900)] font-medium text-[13px] leading-[1.35]">{v}</div>
    </div>
  );
}
