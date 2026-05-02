"use client";

import { useActionState } from "react";
import { createHabit, type ActionResult } from "@/app/actions/habits";

const COLORS = [
  "#c4623d", // terra
  "#3e7a52", // moss
  "#1f4e7a", // ink blue
  "#9c2a2a", // ox blood
  "#d39c2b", // mustard
  "#5a4a8a", // lilac
  "#a25b8a", // mauve
  "#2a6b6b", // teal
];

export function HabitForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createHabit,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="small-caps text-[var(--ink-400)]" htmlFor="name">
          Title
        </label>
        <input
          id="name"
          type="text"
          name="name"
          required
          maxLength={80}
          placeholder="e.g. Morning meditation"
          className="field mt-2"
        />
      </div>

      <div>
        <label className="small-caps text-[var(--ink-400)]">Ink</label>
        <div className="mt-3 flex flex-wrap gap-3">
          {COLORS.map((c, i) => (
            <label key={c} className="cursor-pointer" title={c}>
              <input
                type="radio"
                name="color"
                value={c}
                defaultChecked={i === 0}
                className="peer sr-only"
              />
              <span
                className="block h-7 w-7 rounded-full border-2 border-transparent transition-all peer-checked:border-[var(--ink-900)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--terra)]"
                style={{ backgroundColor: c }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="small-caps text-[var(--ink-400)]" htmlFor="period">
            Cadence
          </label>
          <select
            id="period"
            name="period"
            defaultValue="day"
            className="field field-select mt-2"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </div>
        <div>
          <label className="small-caps text-[var(--ink-400)]" htmlFor="target">
            Target
          </label>
          <input
            id="target"
            type="number"
            name="target_per_period"
            min={1}
            max={100}
            defaultValue={1}
            className="field mt-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-dark w-full justify-center"
      >
        {pending ? "Recording…" : "Add habit"}
      </button>

      {state?.ok === false && (
        <p className="serif-italic text-sm text-[var(--terra)]">{state.error}</p>
      )}
    </form>
  );
}
