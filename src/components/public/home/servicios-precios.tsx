import type { Servicio } from "@prisma/client";
import { formatCLP, formatDuracion } from "@/lib/format";

export function ServiciosPrecios({ servicios }: { servicios: Servicio[] }) {
  return (
    <section id="servicios" className="px-4 sm:px-[27.2px] py-[40.8px] bg-paper font-[family-name:var(--font-barlow)]">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-[13.6px] bg-ink text-paper text-[11px] font-semibold tracking-[0.16em] uppercase px-4 py-[13.6px]">
          <span>Servicio</span>
          <span>Precio base</span>
          <span>Duración</span>
        </div>
        {servicios.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-[2fr_1fr_1fr] gap-[13.6px] items-center px-4 py-[13.6px] border-b border-ink/10"
          >
            <div>
              <p className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[21px]">{s.nombre}</p>
              {s.descripcion && <p className="text-[14px] text-neutral-600">{s.descripcion}</p>}
            </div>
            <p className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[20px] text-accent-text">
              {Number(s.precioBase) > 0 ? formatCLP(s.precioBase.toString()) : "Consultar"}
            </p>
            <p className="text-[14px] text-neutral-600">{formatDuracion(s.duracionMinutos)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
