interface Props {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 28, className }: Props) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        borderRadius: 8,
        background: "var(--ink-900)",
        color: "var(--sand-50)",
        fontFamily: "var(--font-serif)",
        fontSize: Math.round(size * 0.64),
        lineHeight: 1,
      }}
    >
      F
    </span>
  );
}
