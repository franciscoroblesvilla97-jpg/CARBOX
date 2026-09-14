import { whatsappUrl } from "@/lib/whatsapp";

const NAV = [
  { href: "#cotizar", label: "Cotizar y agendar" },
  { href: "#servicios", label: "Servicios y precios" },
  { href: "#neumaticos", label: "Neumáticos" },
  { href: "#local", label: "Contacto" },
];

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-5 px-4 sm:px-[27.2px] py-[13.6px] bg-ink text-paper font-[family-name:var(--font-barlow)]">
      <a href="#" className="flex items-center gap-2 shrink-0">
        <span className="flex items-center justify-center w-[27px] h-[27px] bg-accent font-[family-name:var(--font-barlow-condensed)] font-bold text-[17px]">
          C
        </span>
        <span className="font-[family-name:var(--font-barlow-condensed)] font-bold text-[19px] tracking-[0.16em] uppercase">
          Carbox
        </span>
      </a>
      <nav className="hidden md:flex items-center gap-5 text-[14px] font-medium tracking-[0.04em] text-neutral-300">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="hover:text-paper transition-colors">
            {item.label}
          </a>
        ))}
      </nav>
      <a
        href={whatsappUrl("Hola Carbox, quisiera consultar por un servicio.")}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 bg-accent hover:bg-accent-hover text-paper font-[family-name:var(--font-barlow-condensed)] font-semibold text-[16px] tracking-[0.06em] uppercase px-[20.4px] py-[10.2px] transition-colors"
      >
        WhatsApp
      </a>
    </header>
  );
}
