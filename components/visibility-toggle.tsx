"use client";

import { useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setHabitVisibility } from "@/app/actions/habits";

export function VisibilityToggle({
  habitId,
  isPublic,
}: {
  habitId: string;
  isPublic: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      title={isPublic ? "Visible on your public folio" : "Private"}
      onClick={() =>
        startTransition(async () => {
          await setHabitVisibility(habitId, !isPublic);
        })
      }
      className="inline-flex items-center gap-1.5 serif-italic text-sm text-[var(--ink-400)] hover:text-[var(--ink-900)] disabled:opacity-50"
    >
      {isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
      {isPublic ? "public" : "private"}
    </button>
  );
}
