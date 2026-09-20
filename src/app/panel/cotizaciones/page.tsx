import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCLP, formatFechaCorta } from "@/lib/format";
import type { EstadoCotizacion } from "@prisma/client";

const estadoColor = {
  PENDIENTE: "yellow",
  APROBADA: "green",
  RECHAZADA: "red",
} as const;

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filtro = (estado as EstadoCotizacion) ?? "PENDIENTE";

  const cotizaciones = await prisma.cotizacion.findMany({
    where: { estado: filtro },
    orderBy: { createdAt: "desc" },
    include: { servicios: true, productos: true, ordenGenerada: true },
  });

  const tabs: EstadoCotizacion[] = ["PENDIENTE", "APROBADA", "RECHAZADA"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-ink">Cotizaciones</h1>
        <Link href="/panel/cotizaciones/nueva">
          <Button>Nueva cotización</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={`/panel/cotizaciones?estado=${tab}`}
            className={filtro === tab ? "" : "opacity-60 hover:opacity-100"}
          >
            <Badge color={estadoColor[tab]}>{tab}</Badge>
          </Link>
        ))}
      </div>

      <div className="bg-paper border border-ink/12 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">N°</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {cotizaciones.map((c) => {
              const total =
                c.servicios.reduce((a, l) => a + Number(l.precioCobrado) * l.cantidad, 0) +
                c.productos.reduce((a, l) => a + Number(l.precioUnitario) * l.cantidad, 0);
              return (
                <tr key={c.id} className="hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link href={`/panel/cotizaciones/${c.id}`} className="text-accent-text font-medium hover:underline">
                      #{c.numero}
                    </Link>
                    {c.ordenGenerada && <span className="ml-2 text-xs text-neutral-400">→ OT #{c.ordenGenerada.numero}</span>}
                  </td>
                  <td className="px-4 py-3">{c.nombreCliente}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {c.patente ?? "—"}
                    {(c.marca || c.modelo) && (
                      <span className="block text-xs">
                        {c.marca ?? ""} {c.modelo ?? ""} {c.anio ?? ""}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{formatFechaCorta(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCLP(total)}</td>
                </tr>
              );
            })}
            {cotizaciones.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  No hay cotizaciones en este estado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
