"use client";

import { useTransition } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { generateTodaysDigest } from "@/app/actions/digests";

interface Digest {
  for_date: string;
  completion_pct: number;
  done_count: number;
  total_count: number;
  longest_streak: number;
  message: string;
}

export function DigestCard({
  digest,
  today,
}: {
  digest: Digest | null;
  today: string;
}) {
  const [pending, startTransition] = useTransition();
  const isFresh = digest?.for_date === today;

  function refresh() {
    startTransition(async () => {
      await generateTodaysDigest();
    });
  }

  return (
    <div
      className="rounded-[var(--radius-card)] p-[18px_20px_20px] border"
      style={{
        background: "linear-gradient(160deg, #1a1612 0%, #2c241a 100%)",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 12px 24px -14px rgba(0,0,0,0.5)",
        color: "#fbf3e6",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="inline-flex items-center gap-2 font-semibold text-[13px]">
          <span className="w-6 h-6 rounded-md bg-[var(--butter)] grid place-items-center text-[var(--ink-900)]">
            <Sparkles size={13} />
          </span>
          Daily digest
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={refresh}
          aria-label="Regenerate digest"
          className="inline-flex items-center gap-1 text-[11px] small-caps text-[rgba(251,243,230,0.6)] hover:text-[var(--butter)] disabled:opacity-50"
        >
          <RefreshCw size={11} className={pending ? "animate-spin" : ""} />
          {pending ? "Mixing" : isFresh ? "Refresh" : "Generate"}
        </button>
      </div>

      {digest ? (
        <>
          <div className="serif-italic text-[22px] leading-[1.25]">
            {digest.message}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-dashed border-[rgba(251,243,230,0.15)]">
            <Stat num={`${digest.completion_pct}%`} lbl="Done" />
            <Stat num={`${digest.done_count}/${digest.total_count}`} lbl="Habits" />
            <Stat num={digest.longest_streak} lbl="Top streak" />
          </div>
          {!isFresh && (
            <div className="text-[11px] text-[rgba(251,243,230,0.5)] mt-3 tabular">
              From {digest.for_date}
            </div>
          )}
        </>
      ) : (
        <div className="serif-italic text-[18px] text-[rgba(251,243,230,0.7)]">
          No digest yet. Tap generate to brew today&apos;s reflection.
        </div>
      )}
    </div>
  );
}

function Stat({ num, lbl }: { num: React.ReactNode; lbl: string }) {
  return (
    <div>
      <div className="serif-italic text-[22px] tracking-[-0.02em] leading-none text-[var(--butter)]">
        {num}
      </div>
      <div className="text-[10px] text-[rgba(251,243,230,0.6)] mt-1 small-caps">
        {lbl}
      </div>
    </div>
  );
}
