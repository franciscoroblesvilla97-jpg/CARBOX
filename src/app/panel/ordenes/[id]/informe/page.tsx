import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { formatCLP, formatFechaCorta } from "@/lib/format";
import { ImprimirButton } from "@/components/ui/imprimir-button";
import { Badge } from "@/components/ui/badge";
import type { EstadoChecklist } from "@prisma/client";

const estadoChecklistLabel: Record<EstadoChecklist, string> = {
  OK: "OK",
  VIDA_UTIL: "Vida útil",
  CAMBIO: "Cambio",
};
const estadoChecklistColor: Record<EstadoChecklist, "green" | "yellow" | "red"> = {
  OK: "green",
  VIDA_UTIL: "yellow",
  CAMBIO: "red",
};

export default async function InformeOrdenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id },
    include: {
      vehiculo: { include: { cliente: true } },
      trabajador: true,
      servicios: { include: { servicio: true } },
      productos: { include: { producto: true } },
      checklist: {
        include: {
          items: { orderBy: { orden: "asc" } },
          presiones: { orderBy: { orden: "asc" } },
          danos: true,
        },
      },
      archivos: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!orden) notFound();

  const totalServicios = orden.servicios.reduce((acc, l) => acc + Number(l.precioCobrado) * l.cantidad, 0);
  const totalProductos = orden.productos.reduce((acc, l) => acc + Number(l.precioUnitario) * l.cantidad, 0);
  const total = totalServicios + totalProductos;

  return (
    <div className="max-w-2xl mx-auto py-8 print:py-0">
      <div className="flex justify-end mb-4">
        <ImprimirButton />
      </div>

      <div className="border border-ink/16 rounded-lg p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b border-ink/16 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink">Carbox</h1>
            <p className="text-sm text-neutral-500">Pedro de Valdivia 525, Concepción</p>
            <p className="text-sm text-neutral-500">+56 9 8210 6659 · contacto@carboxconce.cl</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-ink">Informe de servicio</p>
            <p className="text-sm text-neutral-500">OT #{orden.numero}</p>
            <p className="text-sm text-neutral-500">{formatFechaCorta(orden.fechaIngreso)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-neutral-400 uppercase text-xs mb-1">Cliente</p>
            <p className="font-medium text-ink">{orden.vehiculo.cliente.nombre}</p>
            <p className="text-neutral-600">{orden.vehiculo.cliente.telefono}</p>
          </div>
          <div>
            <p className="text-neutral-400 uppercase text-xs mb-1">Vehículo</p>
            <p className="font-medium text-ink">{orden.vehiculo.patente}</p>
            <p className="text-neutral-600">
              {orden.vehiculo.marca ?? ""} {orden.vehiculo.modelo ?? ""} {orden.vehiculo.anio ?? ""}
            </p>
          </div>
        </div>

        {orden.trabajador && (
          <p className="text-sm text-neutral-500 mb-6">Trabajo realizado por: {orden.trabajador.nombre}</p>
        )}

        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="text-left text-xs text-neutral-400 border-b border-ink/16">
              <th className="pb-2">Servicio</th>
              <th className="pb-2 text-right">Cant.</th>
              <th className="pb-2 text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {orden.servicios.map((linea) => (
              <tr key={linea.id}>
                <td className="py-2">{linea.servicio?.nombre ?? linea.nombrePersonalizado}</td>
                <td className="py-2 text-right">{linea.cantidad}</td>
                <td className="py-2 text-right">{formatCLP(Number(linea.precioCobrado) * linea.cantidad)}</td>
              </tr>
            ))}
            {orden.servicios.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 text-neutral-400">
                  Sin servicios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left text-xs text-neutral-400 border-b border-ink/16">
              <th className="pb-2">Repuesto / material</th>
              <th className="pb-2 text-right">Cant.</th>
              <th className="pb-2 text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {orden.productos.map((linea) => (
              <tr key={linea.id}>
                <td className="py-2">{linea.producto?.nombre ?? linea.nombrePersonalizado}</td>
                <td className="py-2 text-right">{linea.cantidad}</td>
                <td className="py-2 text-right">{formatCLP(Number(linea.precioUnitario) * linea.cantidad)}</td>
              </tr>
            ))}
            {orden.productos.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 text-neutral-400">
                  Sin repuestos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {orden.observaciones && (
          <div className="mb-6 text-sm">
            <p className="text-neutral-400 uppercase text-xs mb-1">Observaciones</p>
            <p className="text-ink">{orden.observaciones}</p>
          </div>
        )}

        <div className="flex justify-end border-t border-ink/16 pt-4 mb-6">
          <p className="text-xl font-bold text-ink">Total: {formatCLP(total)}</p>
        </div>

        {orden.checklist && (
          <div className="border-t border-ink/16 pt-6 mb-6">
            <p className="text-neutral-400 uppercase text-xs mb-3">Revisión de ingreso</p>

            {orden.checklist.kilometraje != null && (
              <p className="text-sm text-neutral-600 mb-3">Kilometraje registrado: {orden.checklist.kilometraje} km</p>
            )}

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-xs text-neutral-400 border-b border-ink/16">
                  <th className="pb-2">Punto revisado</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {orden.checklist.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5">{item.nombre}</td>
                    <td className="py-1.5">
                      <Badge color={estadoChecklistColor[item.estado]}>{estadoChecklistLabel[item.estado]}</Badge>
                    </td>
                    <td className="py-1.5 text-neutral-500">{item.observacion ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-xs text-neutral-400 border-b border-ink/16">
                  <th className="pb-2">Neumático</th>
                  <th className="pb-2 text-right">Recomendada</th>
                  <th className="pb-2 text-right">Medida</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {orden.checklist.presiones.map((p) => (
                  <tr key={p.id}>
                    <td className="py-1.5">{p.posicion}</td>
                    <td className="py-1.5 text-right">{p.recomendada != null ? `${p.recomendada} psi` : "—"}</td>
                    <td className="py-1.5 text-right">{p.medida != null ? `${p.medida} psi` : "—"}</td>
                    <td className="py-1.5">
                      <Badge color={estadoChecklistColor[p.estado]}>{estadoChecklistLabel[p.estado]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orden.checklist.danos.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-neutral-400 mb-1">Carrocería</p>
                <ul className="text-sm text-neutral-600 list-disc list-inside">
                  {orden.checklist.danos.map((d) => (
                    <li key={d.id}>
                      {d.tipo === "GOLPE" ? "Golpe" : d.tipo === "RAYON" ? "Rayón" : "Otro"} en{" "}
                      {d.zona.toLowerCase()}
                      {d.nota ? ` — ${d.nota}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {orden.checklist.observaciones && (
              <div className="text-sm">
                <p className="text-xs text-neutral-400 mb-1">Observaciones generales</p>
                <p className="text-ink">{orden.checklist.observaciones}</p>
              </div>
            )}
          </div>
        )}

        {orden.archivos.length > 0 && (
          <div className="border-t border-ink/16 pt-6 mb-6">
            <p className="text-neutral-400 uppercase text-xs mb-2">Archivos adjuntos</p>
            <ul className="text-sm space-y-1">
              {orden.archivos.map((archivo) => (
                <li key={archivo.id}>
                  <a href={archivo.url} target="_blank" rel="noopener noreferrer" className="text-accent-text hover:underline">
                    {archivo.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-neutral-400 text-center mt-10">Gracias por confiar en Carbox.</p>
      </div>
    </div>
  );
}
