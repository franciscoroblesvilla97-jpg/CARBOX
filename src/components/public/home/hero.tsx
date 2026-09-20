import Image from "next/image";
import { CornerFrame } from "./corner-frame";

export function Hero() {
  return (
    <section className="bg-field-deep text-paper px-4 sm:px-[27.2px] py-[47.6px] font-[family-name:var(--font-barlow)]">
      <div className="grid gap-[34px] items-center [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] max-w-6xl mx-auto">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-accent-light mb-3">
            Lubricentro · Concepción
          </p>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-bold uppercase text-[clamp(40px,5.6vw,70px)] leading-[0.95] text-balance">
            Cotiza y agenda
            <br />
            en tres pasos
          </h1>
          <p className="mt-5 text-[17px] leading-[1.55] text-neutral-200 max-w-[46ch]">
            Dinos qué necesita tu auto, elige la hora y confirma por WhatsApp. Sin llamadas, sin esperas en el mesón.
          </p>
          <div className="mt-[27.2px] flex flex-wrap gap-[13.6px]">
            <a
              href="#cotizar"
              className="bg-accent hover:bg-accent-hover text-paper font-[family-name:var(--font-barlow-condensed)] font-semibold text-[18px] tracking-[0.1em] uppercase px-6 py-[14px] transition-colors"
            >
              Empezar
            </a>
            <a
              href="#neumaticos"
              className="border border-paper/40 hover:border-paper text-paper font-[family-name:var(--font-barlow-condensed)] font-semibold text-[18px] tracking-[0.1em] uppercase px-6 py-[14px] transition-colors"
            >
              Buscar neumáticos
            </a>
          </div>
        </div>
        <CornerFrame dark className="aspect-4/3 relative overflow-hidden">
          <Image
            src="/taller-hero.jpg"
            alt="Fachada del taller Carbox en Pedro de Valdivia 525, Concepción"
            fill
            className="object-cover"
            priority
          />
        </CornerFrame>
      </div>
    </section>
  );
}
