"use client";

import { useState, useTransition } from "react";
import { setCheckInNote } from "@/app/actions/check-ins";

interface Props {
  habitId: string;
  date: string;
  initialNote: string;
}

export function NoteInput({ habitId, date, initialNote }: Props) {
  const [value, setValue] = useState(initialNote);
  const [saved, setSaved] = useState(initialNote);
  const [pending, startTransition] = useTransition();

  function commit() {
    const next = value.trim();
    if (next === saved) return;
    startTransition(async () => {
      await setCheckInNote(habitId, date, next);
      setSaved(next);
    });
  }

  const dirty = value.trim() !== saved;

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.currentTarget as HTMLInputElement).blur();
          }
        }}
        placeholder="How did it feel today? (optional)"
        maxLength={280}
        className="field flex-1 py-2 text-[13px]"
      />
      <span
        aria-live="polite"
        className="text-[11px] small-caps text-[var(--ink-400)] min-w-[44px] text-right"
      >
        {pending ? "saving" : dirty ? "unsaved" : saved ? "saved" : ""}
      </span>
    </div>
  );
}
