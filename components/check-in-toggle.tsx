"use client";

import { useTransition } from "react";
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
  const dim = size === "sm" ? "h-8 w-8" : "h-12 w-12";
  const icon = size === "sm" ? 16 : 22;

  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={done ? "Undo check-in" : "Check in"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleCheckInToday(habitId);
        })
      }
      className={`${dim} flex items-center justify-center rounded-full border-2 transition-all duration-150 ${
        pending ? "opacity-60" : "hover:scale-105"
      }`}
      style={
        done
          ? { backgroundColor: color, borderColor: color, color: "#fff" }
          : { borderColor: color, color }
      }
    >
      {done ? <Check size={icon} strokeWidth={3} /> : null}
    </button>
  );
}
