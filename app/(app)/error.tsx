"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center px-7 py-12">
      <div className="card p-8 max-w-md text-center animate-fade-up">
        <span className="tag voice">Something snagged</span>
        <h2 className="mt-3 serif-italic text-[28px] leading-tight">
          We couldn&apos;t load this page.
        </h2>
        <p className="mt-3 text-[var(--ink-500)] text-[13px] leading-relaxed">
          The connection to your data hiccuped. It&apos;s usually temporary.
          {error.digest && (
            <span className="block mt-2 text-[11px] small-caps text-[var(--ink-400)] tabular">
              Ref {error.digest}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn-dark mt-5 inline-flex items-center gap-1.5"
        >
          <RefreshCw size={12} /> Try again
        </button>
      </div>
    </div>
  );
}
