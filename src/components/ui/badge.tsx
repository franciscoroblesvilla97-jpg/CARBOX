const colorClasses = {
  gray: "bg-neutral-100 text-neutral-700",
  green: "bg-[#eaf4ee] text-[#3f7d55]",
  yellow: "bg-[#f8f1e0] text-[#b8860b]",
  red: "bg-[#faeceb] text-[#a63327]",
  blue: "bg-accent-tint text-accent-text",
} as const;

export function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: keyof typeof colorClasses;
}) {
  return (
    <span
      className={`inline-flex items-center px-[6px] py-[2px] font-[family-name:var(--font-barlow-condensed)] text-[11px] font-semibold uppercase tracking-[0.04em] ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}
