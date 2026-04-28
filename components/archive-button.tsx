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
      className="text-xs text-zinc-500 hover:text-foreground disabled:opacity-50 dark:text-zinc-400"
    >
      {archived ? "Restore" : "Archive"}
    </button>
  );
}
