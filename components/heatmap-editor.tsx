"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { Heatmap } from "./heatmap";
import { setCheckInCountOnDate } from "@/app/actions/check-ins";

interface Props {
  habitId: string;
  counts: Record<string, number>;
  today: string;
  color: string;
  target: number;
}

export function HeatmapEditor({ habitId, counts, today, color, target }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("0");
  const [pending, startTransition] = useTransition();

  function open(date: string) {
    if (date > today) return;
    setSelected(date);
    setDraft(String(counts[date] ?? 0));
  }
  function close() {
    setSelected(null);
  }
  function save() {
    if (!selected) return;
    const value = Math.max(0, Math.floor(Number(draft) || 0));
    startTransition(async () => {
      await setCheckInCountOnDate(habitId, selected, value);
      close();
    });
  }

  return (
    <div>
      <Heatmap counts={counts} today={today} color={color} weeks={26} onCellClick={open} />

      {selected && (
        <div className="mt-4 card p-4 flex items-center gap-3 animate-fade-up">
          <div className="flex-1 min-w-0">
            <div className="serif-italic text-[18px] leading-none">
              {formatLong(selected)}
            </div>
            <div className="text-[11px] text-[var(--ink-500)] mt-1 small-caps">
              {selected === today ? "Today" : "Backfill"}
            </div>
          </div>
          {target > 1 ? (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
              className="field tabular py-1.5 text-[14px] w-[100px]"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDraft(draft === "0" ? "1" : "0")}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium border"
                style={{
                  background: draft !== "0" ? color : "white",
                  color: draft !== "0" ? "white" : "var(--ink-700)",
                  borderColor: draft !== "0" ? color : "var(--ink-300)",
                }}
              >
                {draft !== "0" ? "Done" : "Not done"}
              </button>
            </div>
          )}
          <div className="text-[11px] text-[var(--ink-400)] tabular">
            / {target}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="btn-dark"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-[var(--ink-400)] hover:text-[var(--ink-900)]"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function formatLong(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
