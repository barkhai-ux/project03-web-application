"use client";

import { useTransition } from "react";
import { archiveHabit, unarchiveHabit } from "@/app/actions/habits";

export function ArchiveButton({
  habitId,
  archived,
}: {
  habitId: string;
  archived: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (archived) await unarchiveHabit(habitId);
          else await archiveHabit(habitId);
        })
      }
      className="serif-italic text-sm text-[var(--ink-400)] hover:text-[var(--ink-900)] hover:underline disabled:opacity-50"
    >
      {archived ? "restore" : "archive"}
    </button>
  );
}
