"use client";

import { useMemo, useState } from "react";
import { addDays } from "@/lib/dates";

interface Props {
  counts: Record<string, number>;
  today: string;
  color: string;
  weeks?: number;
}

const CELL = 14;
const GAP = 4;
const PAD_LEFT = 32;
const PAD_TOP = 22;

const TIERS = ["#e9dcc1", "#d8b97a", "#c69441", "#3e7a52", "#2d5a3d"];

export function Heatmap({ counts, today, weeks = 26 }: Props) {
  const [hover, setHover] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const { cells, monthLabels } = useMemo(() => {
    const todayRow = dayOfWeekIdx(today);
    const totalCells = (weeks - 1) * 7 + todayRow + 1;
    const days: { date: string; count: number; col: number; row: number }[] = [];
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

    return { cells: days, monthLabels: labels };
  }, [counts, today, weeks]);

  const maxCount = Math.max(1, ...Object.values(counts));
  const width = PAD_LEFT + weeks * (CELL + GAP);
  const height = PAD_TOP + 7 * (CELL + GAP);

  return (
    <div className="relative overflow-x-auto" onMouseLeave={() => setHover(null)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {[
          { row: 0, label: "M" },
          { row: 2, label: "W" },
          { row: 4, label: "F" },
        ].map(({ row, label }) => (
          <text
            key={label}
            x={4}
            y={PAD_TOP + row * (CELL + GAP) + CELL - 2}
            fontFamily="var(--font-serif)"
            fontStyle="italic"
            fontSize={11}
            fill="var(--ink-400)"
          >
            {label}
          </text>
        ))}

        {monthLabels.map((m) => (
          <text
            key={`${m.col}-${m.label}`}
            x={PAD_LEFT + m.col * (CELL + GAP)}
            y={14}
            fontFamily="var(--font-sans)"
            fontSize={10}
            letterSpacing="0.08em"
            fill="var(--ink-400)"
          >
            {m.label.toUpperCase()}
          </text>
        ))}

        {cells.map((c) => {
          const isToday = c.date === today;
          const tierIdx =
            c.count === 0
              ? -1
              : Math.min(4, Math.floor(((c.count - 1) / maxCount) * 5));
          const fill = tierIdx === -1 ? "rgba(0,0,0,0.05)" : TIERS[tierIdx];
          const x = PAD_LEFT + c.col * (CELL + GAP);
          const y = PAD_TOP + c.row * (CELL + GAP);
          return (
            <g
              key={c.date}
              onMouseEnter={() =>
                setHover({
                  date: c.date,
                  count: c.count,
                  x: x + CELL / 2,
                  y,
                })
              }
            >
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={4}
                fill={fill}
                stroke={isToday ? "var(--ink-900)" : "transparent"}
                strokeWidth={isToday ? 1.5 : 0}
              />
            </g>
          );
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 card px-3 py-1.5 text-xs"
          style={{
            left: hover.x,
            top: Math.max(0, hover.y - 42),
          }}
        >
          <div className="font-medium tabular">{hover.date}</div>
          <div className="serif-italic ink-soft">
            {hover.count === 0
              ? "—"
              : `${hover.count} ${hover.count === 1 ? "check-in" : "check-ins"}`}
          </div>
        </div>
      )}
    </div>
  );
}

function dayOfWeekIdx(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const js = dt.getUTCDay();
  return (js + 6) % 7;
}
