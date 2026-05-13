export function LoadingShell({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-7 pb-7 pt-2 animate-pulse">
      <div className="h-7 w-40 rounded-md bg-[var(--sand-200)] mb-3" />
      <div className="h-4 w-72 rounded-md bg-[var(--sand-200)] opacity-70 mb-6" />
      <div className="space-y-3.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="card p-5 flex items-center justify-between gap-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--sand-200)]" />
              <div className="h-4 rounded-md bg-[var(--sand-200)] flex-1 max-w-[280px]" />
            </div>
            <div className="h-4 w-20 rounded-md bg-[var(--sand-200)] opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}
