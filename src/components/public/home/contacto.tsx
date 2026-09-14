import { TELEFONO_CARBOX, whatsappUrl } from "@/lib/whatsapp";
import { CornerFrame } from "./corner-frame";

export function Contacto() {
  return (
    <section
      id="local"
      className="bg-ink text-paper px-4 sm:px-[27.2px] py-[40.8px] font-[family-name:var(--font-barlow)]"
    >
      <div className="grid gap-[27.2px] items-center [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] max-w-6xl mx-auto">
        <div>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] font-semibold uppercase text-[clamp(26px,3vw,38px)]">
            Pedro de Valdivia 525, Concepción
          </h2>
          <p className="mt-3 text-neutral-300">Lunes a viernes 09:00 – 19:00 · Sábado 09:00 – 14:00</p>
          <p className="text-neutral-300">{TELEFONO_CARBOX}</p>
          <div className="mt-[20.4px] flex flex-wrap gap-[13.6px]">
            <a
              href={`tel:${TELEFONO_CARBOX}`}
              className="bg-paper text-ink font-[family-name:var(--font-barlow-condensed)] font-semibold text-[16px] tracking-[0.06em] uppercase px-6 py-[14px]"
            >
              Llamar
            </a>
            <a
              href={whatsappUrl("Hola Carbox, quisiera consultar por un servicio.")}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-paper/40 hover:border-paper text-paper font-[family-name:var(--font-barlow-condensed)] font-semibold text-[16px] tracking-[0.06em] uppercase px-6 py-[14px] transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <CornerFrame dark className="aspect-16/10 flex items-end p-4 bg-[repeating-linear-gradient(135deg,rgba(242,242,243,0.08),rgba(242,242,243,0.08)_10px,transparent_10px,transparent_20px)]">
          <span className="text-[12px] text-neutral-300">Mapa o fachada del local</span>
        </CornerFrame>
      </div>
    </section>
  );
}
