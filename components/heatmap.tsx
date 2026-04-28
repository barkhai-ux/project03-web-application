"use client";

import { useMemo, useState } from "react";
import { addDays } from "@/lib/dates";

interface Props {
  /** YYYY-MM-DD strings → count */
  counts: Record<string, number>;
  /** Today's date in user's tz, YYYY-MM-DD */
  today: string;
  /** Brand color (hex) used at max intensity */
  color: string;
  /** Number of weeks to render (default 53 ≈ 1 year) */
  weeks?: number;
}

const CELL = 12;
const GAP = 3;
const PAD_LEFT = 28;
const PAD_TOP = 16;

export function Heatmap({ counts, today, color, weeks = 53 }: Props) {
  const [hover, setHover] = useState<{ date: string; count: number } | null>(
    null,
  );

  const { cells, monthLabels } = useMemo(() => {
    const totalDays = weeks * 7;
    const days: { date: string; count: number; col: number; row: number }[] = [];
    // End at today, walk back. Align so today is in the rightmost column.
    const todayRow = dayOfWeekIdx(today); // 0 = Mon ... 6 = Sun
    const totalCells = (weeks - 1) * 7 + todayRow + 1;
    for (let i = 0; i < totalCells; i++) {
      const date = addDays(today, -(totalCells - 1 - i));
      const col = Math.floor(i / 7);
      const row = i % 7;
      days.push({ date, count: counts[date] ?? 0, col, row });
    }

    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    for (const d of days) {
      const m = Number(d.date.slice(5, 7));
      if (d.row === 0 && m !== lastMonth) {
        labels.push({
          col: d.col,
          label: new Date(`${d.date}T00:00:00Z`).toLocaleString("en-US", {
            month: "short",
            timeZone: "UTC",
          }),
        });
        lastMonth = m;
      }
    }

    return { cells: days.slice(-totalDays), monthLabels: labels };
  }, [counts, today, weeks]);

  const maxCount = Math.max(1, ...Object.values(counts));
  const width = PAD_LEFT + weeks * (CELL + GAP);
  const height = PAD_TOP + 7 * (CELL + GAP);

  return (
    <div className="relative overflow-x-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Activity heatmap"
      >
        {/* Day-of-week labels */}
        {["Mon", "Wed", "Fri"].map((d, i) => (
          <text
            key={d}
            x={0}
            y={PAD_TOP + (i * 2 + 1) * (CELL + GAP) + CELL - 2}
            fontSize={9}
            className="fill-zinc-500"
          >
            {d}
          </text>
        ))}

        {/* Month labels */}
        {monthLabels.map((m) => (
          <text
            key={`${m.col}-${m.label}`}
            x={PAD_LEFT + m.col * (CELL + GAP)}
            y={10}
            fontSize={9}
            className="fill-zinc-500"
          >
            {m.label}
          </text>
        ))}

        {/* Cells */}
        {cells.map((c) => {
          const isToday = c.date === today;
          const intensity = c.count === 0 ? 0 : 0.25 + 0.75 * (c.count / maxCount);
          return (
            <rect
              key={c.date}
              x={PAD_LEFT + c.col * (CELL + GAP)}
              y={PAD_TOP + c.row * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={2}
              fill={c.count === 0 ? "transparent" : color}
              fillOpacity={intensity}
              stroke={isToday ? color : "rgb(228 228 231 / 0.6)"}
              strokeWidth={isToday ? 1.5 : 1}
              onMouseEnter={() =>
                setHover({ date: c.date, count: c.count })
              }
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            />
          );
        })}
      </svg>

      {hover && (
        <div className="pointer-events-none absolute left-0 top-0 rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-md dark:bg-zinc-100 dark:text-black">
          <span className="font-medium">{hover.date}</span>
          <span className="ml-2 text-zinc-300 dark:text-zinc-600">
            {hover.count} {hover.count === 1 ? "check-in" : "check-ins"}
          </span>
        </div>
      )}
    </div>
  );
}

/** 0 = Monday ... 6 = Sunday */
function dayOfWeekIdx(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const js = dt.getUTCDay(); // 0 = Sunday
  return (js + 6) % 7;
}
