"use client";

import { startTransition, useOptimistic } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setHabitVisibility } from "@/app/actions/habits";

export function VisibilityToggle({
  habitId,
  isPublic,
}: {
  habitId: string;
  isPublic: boolean;
}) {
  const [optimistic, applyOptimistic] = useOptimistic<boolean, boolean>(
    isPublic,
    (_, next) => next,
  );

  function onClick() {
    const next = !optimistic;
    startTransition(async () => {
      applyOptimistic(next);
      await setHabitVisibility(habitId, next);
    });
  }

  return (
    <button
      type="button"
      title={optimistic ? "Visible on your public folio" : "Private"}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 serif-italic text-sm text-[var(--ink-400)] hover:text-[var(--ink-900)]"
    >
      {optimistic ? <Eye size={14} /> : <EyeOff size={14} />}
      {optimistic ? "public" : "private"}
    </button>
  );
}
