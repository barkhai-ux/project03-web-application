"use client";

import { useTransition, useState } from "react";
import { Check } from "lucide-react";
import { toggleCheckInToday } from "@/app/actions/check-ins";

interface Props {
  habitId: string;
  done: boolean;
  color: string;
  size?: "sm" | "md";
}

export function CheckInToggle({ habitId, done, color, size = "md" }: Props) {
  const [pending, startTransition] = useTransition();
  const [justChecked, setJustChecked] = useState(false);
  const dim = size === "sm" ? 18 : 22;
  const iconSize = size === "sm" ? 11 : 12;
  const stroke = 1.5;

  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={done ? "Undo check-in" : "Mark complete"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (!done) setJustChecked(true);
          await toggleCheckInToday(habitId);
          setTimeout(() => setJustChecked(false), 240);
        })
      }
      className="flex-shrink-0 grid place-items-center rounded-full transition-all duration-200 disabled:opacity-60"
      style={{
        width: dim,
        height: dim,
        background: done ? color : "white",
        border: `${stroke}px solid ${done ? color : "var(--ink-300)"}`,
        color: done ? "white" : "transparent",
      }}
    >
      {done && (
        <Check
          size={iconSize}
          strokeWidth={3}
          className={justChecked ? "animate-stamp" : ""}
        />
      )}
    </button>
  );
}
