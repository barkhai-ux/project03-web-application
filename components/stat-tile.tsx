interface Props {
  label: string;
  value: number | string;
  caption?: string;
  divider?: boolean;
}

export function StatTile({ label, value, caption, divider = true }: Props) {
  return (
    <div
      className="px-1"
      style={{
        borderRight: divider ? "1px dashed var(--line)" : "none",
        paddingRight: 14,
      }}
    >
      <div className="text-[11px] text-[var(--ink-500)]">{label}</div>
      <div className="serif-italic mt-1 leading-none text-[34px] tabular ink">
        {value}
      </div>
      {caption && (
        <div className="mt-1 text-[11px] text-[var(--ink-500)]">{caption}</div>
      )}
    </div>
  );
}
