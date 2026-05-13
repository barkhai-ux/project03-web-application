"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import {
  deleteHabit,
  updateHabit,
  type ActionResult,
} from "@/app/actions/habits";

const COLORS = [
  "#c4623d",
  "#3e7a52",
  "#1f4e7a",
  "#9c2a2a",
  "#d39c2b",
  "#5a4a8a",
  "#a25b8a",
  "#2a6b6b",
];

interface Habit {
  id: string;
  name: string;
  color: string;
  period: "day" | "week";
  target_per_period: number;
}

export function HabitEditPanel({ habit }: { habit: Habit }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const result = await updateHabit(prev, formData);
      if (result?.ok) setOpen(false);
      return result;
    },
    null,
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePending, startDelete] = useTransition();

  function onDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    startDelete(async () => {
      await deleteHabit(habit.id);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-soft inline-flex items-center gap-1.5"
      >
        <Pencil size={12} /> Edit
      </button>
    );
  }

  return (
    <div className="card p-5 mt-3">
      <div className="flex items-center justify-between mb-4">
        <div className="serif-italic text-[20px]">Edit habit</div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close edit panel"
          className="text-[var(--ink-400)] hover:text-[var(--ink-900)]"
        >
          <X size={16} />
        </button>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="habit_id" value={habit.id} />

        <div>
          <label className="small-caps text-[var(--ink-400)]" htmlFor="edit-name">
            Title
          </label>
          <input
            id="edit-name"
            type="text"
            name="name"
            defaultValue={habit.name}
            required
            maxLength={80}
            className="field mt-2"
          />
        </div>

        <div>
          <label className="small-caps text-[var(--ink-400)]">Ink</label>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <label key={c} className="cursor-pointer" title={c}>
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={c.toLowerCase() === habit.color.toLowerCase()}
                  className="peer sr-only"
                />
                <span
                  className="block h-6 w-6 rounded-full border-2 border-transparent transition-all peer-checked:border-[var(--ink-900)]"
                  style={{ backgroundColor: c }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="small-caps text-[var(--ink-400)]"
              htmlFor="edit-period"
            >
              Cadence
            </label>
            <select
              id="edit-period"
              name="period"
              defaultValue={habit.period}
              className="field field-select mt-2"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
            </select>
          </div>
          <div>
            <label
              className="small-caps text-[var(--ink-400)]"
              htmlFor="edit-target"
            >
              Target
            </label>
            <input
              id="edit-target"
              type="number"
              name="target_per_period"
              defaultValue={habit.target_per_period}
              min={1}
              max={1_000_000}
              className="field mt-2"
            />
          </div>
        </div>

        {state?.ok === false && (
          <p className="serif-italic text-sm text-[var(--terra)]">{state.error}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={deletePending}
            className={
              "inline-flex items-center gap-1.5 text-[13px] " +
              (confirmingDelete
                ? "text-[var(--terra)] font-medium"
                : "text-[var(--ink-500)] hover:text-[var(--terra)]")
            }
          >
            <Trash2 size={13} />
            {confirmingDelete ? "Tap again to confirm" : "Delete habit"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-soft"
            >
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn-dark">
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
