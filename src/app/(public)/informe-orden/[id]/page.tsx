import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCLP, formatFechaCorta } from "@/lib/format";
import { InformeHeader } from "@/components/public/informe-header";
import { CornerFrame } from "@/components/public/home/corner-frame";
import type { EstadoChecklist } from "@prisma/client";

const estadoChecklistLabel: Record<EstadoChecklist, string> = {
  OK: "OK",
  VIDA_UTIL: "Vida útil",
  CAMBIO: "Cambio",
};
// Mismos colores semánticos que el handoff de diseño: verde OK, ámbar vida útil, rojo cambio.
const estadoChecklistEstilo: Record<EstadoChecklist, React.CSSProperties> = {
  OK: { color: "#3f7d55", backgroundColor: "#eaf4ee" },
  VIDA_UTIL: { color: "#b8860b", backgroundColor: "#f8f1e0" },
  CAMBIO: { color: "#a63327", backgroundColor: "#faeceb" },
};

export default async function InformeOrdenPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    <div className="min-h-screen bg-paper font-[family-name:var(--font-barlow)]">
      <InformeHeader />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <CornerFrame className="p-8 bg-paper">
          <div className="flex items-start justify-between border-b border-ink/16 pb-4 mb-6">
            <div>
              <h1 className="font-[family-name:var(--font-barlow-condensed)] font-bold text-[24px] uppercase">
                Carbox
              </h1>
              <p className="text-[13px] text-neutral-600">Pedro de Valdivia 525, Concepción</p>
              <p className="text-[13px] text-neutral-600">+56 9 8210 6659 · contacto@carboxconce.cl</p>
            </div>
            <div className="text-right">
              <p className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[18px] uppercase">
                Informe de servicio
              </p>
              <p className="text-[13px] text-neutral-600">OT #{orden.numero}</p>
              <p className="text-[13px] text-neutral-600">{formatFechaCorta(orden.fechaIngreso)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-[14px]">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 mb-1">Cliente</p>
              <p className="font-medium">{orden.vehiculo.cliente.nombre}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 mb-1">Vehículo</p>
              <p className="font-medium">{orden.vehiculo.patente}</p>
              <p className="text-neutral-600">
                {orden.vehiculo.marca ?? ""} {orden.vehiculo.modelo ?? ""} {orden.vehiculo.anio ?? ""}
              </p>
            </div>
          </div>

          <table className="w-full text-[14px] mb-2">
            <thead>
              <tr className="text-left text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 border-b border-ink/16">
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
                  <td colSpan={3} className="py-2 text-neutral-500">
                    Sin servicios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <table className="w-full text-[14px] mb-6">
            <thead>
              <tr className="text-left text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 border-b border-ink/16">
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
                  <td colSpan={3} className="py-2 text-neutral-500">
                    Sin repuestos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {orden.observaciones && (
            <div className="mb-6 text-[14px]">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 mb-1">
                Observaciones
              </p>
              <p className="text-ink">{orden.observaciones}</p>
            </div>
          )}

          <div className="flex justify-end border-t border-ink/16 pt-4 mb-6">
            <p className="font-[family-name:var(--font-barlow-condensed)] font-bold text-[24px]">
              Total: {formatCLP(total)}
            </p>
          </div>

          {orden.checklist && (
            <div className="border-t border-ink/16 pt-6 mb-6">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 mb-3">
                Revisión de ingreso
              </p>

              {orden.checklist.kilometraje != null && (
                <p className="text-[14px] text-neutral-600 mb-3">
                  Kilometraje registrado: {orden.checklist.kilometraje} km
                </p>
              )}

              <table className="w-full text-[14px] mb-4">
                <thead>
                  <tr className="text-left text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 border-b border-ink/16">
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
                        <span
                          className="inline-block px-[6px] py-[2px] text-[11px] font-semibold uppercase"
                          style={estadoChecklistEstilo[item.estado]}
                        >
                          {estadoChecklistLabel[item.estado]}
                        </span>
                      </td>
                      <td className="py-1.5 text-neutral-600">{item.observacion ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="w-full text-[14px] mb-4">
                <thead>
                  <tr className="text-left text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 border-b border-ink/16">
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
                        <span
                          className="inline-block px-[6px] py-[2px] text-[11px] font-semibold uppercase"
                          style={estadoChecklistEstilo[p.estado]}
                        >
                          {estadoChecklistLabel[p.estado]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orden.checklist.danos.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 mb-1">
                    Carrocería
                  </p>
                  <ul className="text-[14px] text-neutral-600 list-disc list-inside">
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
                <div className="text-[14px]">
                  <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 mb-1">
                    Observaciones generales
                  </p>
                  <p className="text-ink">{orden.checklist.observaciones}</p>
                </div>
              )}
            </div>
          )}

          {orden.archivos.length > 0 && (
            <div className="border-t border-ink/16 pt-6 mb-6">
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 mb-2">
                Archivos adjuntos
              </p>
              <ul className="text-[14px] space-y-1">
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

          <p className="text-[12px] text-neutral-500 text-center mt-10">Gracias por confiar en Carbox.</p>
        </CornerFrame>
      </div>
    </div>
  );
}
