// Marco de "plano técnico": borde fino + 4 marcas de esquina, según el sistema Industry.
// `dark` cambia el color de las marcas para usarse sobre fondos oscuros.
export function CornerFrame({
  children,
  dark = false,
  className = "",
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  const markColor = dark ? "border-accent-light" : "border-accent";
  const borderColor = dark ? "border-paper/40" : "border-ink/16";

  return (
    <div className={`relative border ${borderColor} ${className}`}>
      <span className={`absolute -top-px -left-px w-[7px] h-[7px] border-t border-l ${markColor} pointer-events-none`} />
      <span className={`absolute -top-px -right-px w-[7px] h-[7px] border-t border-r ${markColor} pointer-events-none`} />
      <span className={`absolute -bottom-px -left-px w-[7px] h-[7px] border-b border-l ${markColor} pointer-events-none`} />
      <span className={`absolute -bottom-px -right-px w-[7px] h-[7px] border-b border-r ${markColor} pointer-events-none`} />
      {children}
    </div>
  );
}
