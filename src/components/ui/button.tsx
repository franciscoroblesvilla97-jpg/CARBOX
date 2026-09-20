import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-paper hover:bg-accent-hover",
  secondary: "bg-ink text-paper hover:bg-[#2c2f31]",
  danger: "bg-[#a63327] text-paper hover:bg-[#8c2a1f]",
  ghost: "bg-transparent text-ink hover:bg-surface border border-ink/24",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 font-[family-name:var(--font-barlow-condensed)] font-semibold text-[14px] tracking-[0.04em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
