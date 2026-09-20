import Link from "next/link";

// Encabezado mínimo de marca para páginas-informe enlazadas por correo/WhatsApp
// (cotización, reserva, informe de orden): mismo sistema visual que la home,
// sin nav general del sitio ya que son vistas de un solo cliente puntual.
export function InformeHeader() {
  return (
    <header className="flex items-center gap-2 px-4 sm:px-[27.2px] py-[13.6px] bg-ink text-paper font-[family-name:var(--font-barlow)]">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex items-center justify-center w-[27px] h-[27px] bg-accent font-[family-name:var(--font-barlow-condensed)] font-bold text-[17px]">
          C
        </span>
        <span className="font-[family-name:var(--font-barlow-condensed)] font-bold text-[19px] tracking-[0.16em] uppercase">
          Carbox
        </span>
      </Link>
    </header>
  );
}
