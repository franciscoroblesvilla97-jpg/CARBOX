import { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="block text-sm font-medium text-slate-700 mb-1" {...props} />;
}

const baseControl =
  "w-full rounded-md border bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2";
const validClasses = "border-slate-300 focus:ring-green-500";
const invalidClasses = "border-red-500 focus:ring-red-500";

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
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
