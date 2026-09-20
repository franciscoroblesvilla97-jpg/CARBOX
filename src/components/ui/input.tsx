import { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="block font-[family-name:var(--font-barlow-condensed)] font-semibold text-[11px] tracking-[0.1em] uppercase text-neutral-600 mb-1"
      {...props}
    />
  );
}

const baseControl =
  "w-full border bg-paper text-ink px-3 py-2 text-sm font-[family-name:var(--font-barlow)] focus:outline-2 focus:outline-accent focus:outline-offset-2 focus:border-accent";
const validClasses = "border-ink/24";
const invalidClasses = "border-[#a63327] focus:outline-[#a63327]";

export function Input({
  className = "",
  invalid = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={`${baseControl} ${invalid ? invalidClasses : validClasses} ${className}`} {...props} />;
}

export function Textarea({
  className = "",
  invalid = false,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={`${baseControl} ${invalid ? invalidClasses : validClasses} ${className}`} {...props} />;
}

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  function Select({ className = "", invalid = false, ...props }, ref) {
    return (
      <select ref={ref} className={`${baseControl} ${invalid ? invalidClasses : validClasses} ${className}`} {...props} />
    );
  }
);

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      {children}
      {error && <p className="mt-1 text-sm text-[#a63327]">{error}</p>}
    </div>
  );
}
