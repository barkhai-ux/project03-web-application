"use client";

import { startTransition, useOptimistic, useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  decrementCheckInToday,
  incrementCheckInToday,
  setCheckInCountToday,
} from "@/app/actions/check-ins";

interface Props {
  habitId: string;
  count: number;
  target: number;
  color: string;
  unit?: string;
  size?: "sm" | "md";
}

// Habits with bigger targets (steps, calories, water in mL, etc.) get a typed
// input instead of +/- buttons.
const INPUT_MODE_THRESHOLD = 30;

export function CounterControl(props: Props) {
  return props.target > INPUT_MODE_THRESHOLD ? (
    <NumericInput {...props} />
  ) : (
    <StepButtons {...props} />
  );
}

function StepButtons({ habitId, count, target, color, unit, size = "md" }: Props) {
  const [optimistic, applyOptimistic] = useOptimistic<number, number>(
    count,
    (state, delta) => Math.max(0, state + delta),
  );

  const pct = Math.min(100, Math.round((optimistic / target) * 100));
  const done = optimistic >= target;
  const btnDim = size === "sm" ? 26 : 30;
  const iconSize = size === "sm" ? 12 : 14;

  function inc() {
    startTransition(async () => {
      applyOptimistic(1);
      await incrementCheckInToday(habitId);
    });
  }
  function dec() {
    if (optimistic <= 0) return;
    startTransition(async () => {
      applyOptimistic(-1);
      await decrementCheckInToday(habitId);
    });
  }

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          disabled={optimistic <= 0}
          aria-label="Decrease"
          className="grid place-items-center rounded-full border bg-white text-[var(--ink-700)] hover:text-[var(--ink-900)] disabled:opacity-30 transition-colors"
          style={{ width: btnDim, height: btnDim, borderColor: "var(--ink-300)" }}
        >
          <Minus size={iconSize} strokeWidth={2.5} />
        </button>

        <div className="tabular text-[14px] min-w-[44px] text-center font-medium">
          <span style={{ color: done ? color : undefined }}>{optimistic}</span>
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
          aria-label="Increase"
          className="grid place-items-center rounded-full text-white transition-colors"
          style={{ width: btnDim, height: btnDim, background: color }}
        >
          <Plus size={iconSize} strokeWidth={2.5} />
        </button>
      </div>

      <ProgressBar pct={pct} color={color} done={done} />
    </div>
  );
}

function NumericInput({ habitId, count, target, color, unit }: Props) {
  const [optimistic, applyOptimistic] = useOptimistic<number, number>(
    count,
    (_, next) => Math.max(0, next),
  );
  const [draft, setDraft] = useState<string>(String(count));

  const pct = Math.min(100, Math.round((optimistic / target) * 100));
  const done = optimistic >= target;
  const dirty = String(optimistic) !== draft.trim();

  function commit() {
    const parsed = Math.max(0, Math.floor(Number(draft) || 0));
    if (parsed === optimistic) {
      setDraft(String(optimistic));
      return;
    }
    startTransition(async () => {
      applyOptimistic(parsed);
      setDraft(String(parsed));
      await setCheckInCountToday(habitId, parsed);
    });
  }

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          className="field tabular py-1.5 text-[14px] flex-1 min-w-0 max-w-[120px]"
          style={{ borderColor: done ? color : undefined }}
        />
        <div className="text-[12px] text-[var(--ink-400)] tabular whitespace-nowrap">
          / {target.toLocaleString()}
          {unit && (
            <span className="text-[11px] ml-1 small-caps">{unit}</span>
          )}
        </div>
        {dirty && (
          <button
            type="button"
            onClick={commit}
            className="text-[11px] small-caps px-2.5 py-1 rounded-full text-white"
            style={{ background: color }}
          >
            Save
          </button>
        )}
      </div>
      <ProgressBar pct={pct} color={color} done={done} />
    </div>
  );
}

function ProgressBar({
  pct,
  color,
  done,
}: {
  pct: number;
  color: string;
  done: boolean;
}) {
  return (
    <div className="h-1.5 w-full bg-[var(--sand-200)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{
          width: `${pct}%`,
          background: done ? color : `linear-gradient(90deg, ${color}aa, ${color})`,
        }}
      />
    </div>
  );
}
