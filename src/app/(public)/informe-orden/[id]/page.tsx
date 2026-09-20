import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCLP, formatFechaCorta } from "@/lib/format";
import { InformeHeader } from "@/components/public/informe-header";
import { CornerFrame } from "@/components/public/home/corner-frame";

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

          <div className="flex justify-end border-t border-ink/16 pt-4">
            <p className="font-[family-name:var(--font-barlow-condensed)] font-bold text-[24px]">
              Total: {formatCLP(total)}
            </p>
          </div>

          <p className="text-[12px] text-neutral-500 text-center mt-10">Gracias por confiar en Carbox.</p>
        </CornerFrame>
      </div>
    </div>
  );
}
