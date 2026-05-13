"use client";

import { useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import {
  decrementCheckInToday,
  incrementCheckInToday,
} from "@/app/actions/check-ins";

interface Props {
  habitId: string;
  count: number;
  target: number;
  color: string;
  unit?: string;
  size?: "sm" | "md";
}

export function CounterControl({
  habitId,
  count,
  target,
  color,
  unit,
  size = "md",
}: Props) {
  const [pending, startTransition] = useTransition();
  const pct = Math.min(100, Math.round((count / target) * 100));
  const done = count >= target;

  const btnDim = size === "sm" ? 26 : 30;
  const iconSize = size === "sm" ? 12 : 14;

  function inc() {
    startTransition(async () => {
      await incrementCheckInToday(habitId);
    });
  }
  function dec() {
    if (count <= 0) return;
    startTransition(async () => {
      await decrementCheckInToday(habitId);
    });
  }

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          disabled={pending || count <= 0}
          aria-label="Decrease"
          className="grid place-items-center rounded-full border bg-white text-[var(--ink-700)] hover:text-[var(--ink-900)] disabled:opacity-30 transition-colors"
          style={{
            width: btnDim,
            height: btnDim,
            borderColor: "var(--ink-300)",
          }}
        >
          <Minus size={iconSize} strokeWidth={2.5} />
        </button>

        <div className="tabular text-[14px] min-w-[44px] text-center font-medium">
          <span style={{ color: done ? color : undefined }}>{count}</span>
          <span className="text-[var(--ink-400)]"> / {target}</span>
          {unit && (
            <span className="text-[11px] text-[var(--ink-400)] ml-1 small-caps">
              {unit}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={inc}
          disabled={pending}
          aria-label="Increase"
          className="grid place-items-center rounded-full text-white disabled:opacity-60 transition-colors"
          style={{
            width: btnDim,
            height: btnDim,
            background: color,
          }}
        >
          <Plus size={iconSize} strokeWidth={2.5} />
        </button>
      </div>

      <div className="h-1.5 w-full bg-[var(--sand-200)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${pct}%`,
            background: done
              ? color
              : `linear-gradient(90deg, ${color}aa, ${color})`,
          }}
        />
      </div>
    </div>
  );
}
