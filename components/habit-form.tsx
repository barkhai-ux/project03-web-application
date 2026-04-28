"use client";

import { useActionState } from "react";
import { createHabit, type ActionResult } from "@/app/actions/habits";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function HabitForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createHabit,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          required
          maxLength={80}
          placeholder="e.g. Read 20 pages"
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c, i) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={c}
                defaultChecked={i === 0}
                className="peer sr-only"
              />
              <span
                className="block h-7 w-7 rounded-full border-2 border-transparent transition-all peer-checked:border-zinc-900 dark:peer-checked:border-zinc-100"
                style={{ backgroundColor: c }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Period</label>
          <select
            name="period"
            defaultValue="day"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Target</label>
          <input
            type="number"
            name="target_per_period"
            min={1}
            max={100}
            defaultValue={1}
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-foreground px-3 py-2 text-sm text-background transition-colors hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create habit"}
      </button>

      {state?.ok === false && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
