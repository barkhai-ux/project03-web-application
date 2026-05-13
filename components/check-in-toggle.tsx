"use client";

import { startTransition, useOptimistic } from "react";
import { Check } from "lucide-react";
import { toggleCheckInToday } from "@/app/actions/check-ins";

interface Props {
  habitId: string;
  done: boolean;
  color: string;
  size?: "sm" | "md";
}

export function CheckInToggle({ habitId, done, color, size = "md" }: Props) {
  const [optimisticDone, applyOptimistic] = useOptimistic<boolean, boolean>(
    done,
    (_, next) => next,
  );
  const dim = size === "sm" ? 18 : 22;
  const iconSize = size === "sm" ? 11 : 12;
  const stroke = 1.5;

  function onClick() {
    const next = !optimisticDone;
    startTransition(async () => {
      applyOptimistic(next);
      await toggleCheckInToday(habitId);
    });
  }

  return (
    <button
      type="button"
      aria-pressed={optimisticDone}
      aria-label={optimisticDone ? "Undo check-in" : "Mark complete"}
      onClick={onClick}
      className="flex-shrink-0 grid place-items-center rounded-full transition-all duration-200"
      style={{
        width: dim,
        height: dim,
        background: optimisticDone ? color : "white",
        border: `${stroke}px solid ${optimisticDone ? color : "var(--ink-300)"}`,
        color: optimisticDone ? "white" : "transparent",
      }}
    >
      {optimisticDone && (
        <Check size={iconSize} strokeWidth={3} className="animate-stamp" />
      )}
    </button>
  );
}
