import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { formatCLP, formatFechaCorta } from "@/lib/format";
import { ImprimirButton } from "@/components/ui/imprimir-button";

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

      <div className="border border-slate-200 rounded-lg p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Carbox</h1>
            <p className="text-sm text-slate-500">Dirección de ejemplo 123, Concepción</p>
            <p className="text-sm text-slate-500">+56 9 1234 5678 · contacto@carbox.cl</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-slate-900">Informe de servicio</p>
            <p className="text-sm text-slate-500">OT #{orden.numero}</p>
            <p className="text-sm text-slate-500">{formatFechaCorta(orden.fechaIngreso)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-slate-400 uppercase text-xs mb-1">Cliente</p>
            <p className="font-medium text-slate-900">{orden.vehiculo.cliente.nombre}</p>
            <p className="text-slate-600">{orden.vehiculo.cliente.telefono}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase text-xs mb-1">Vehículo</p>
            <p className="font-medium text-slate-900">{orden.vehiculo.patente}</p>
            <p className="text-slate-600">
              {orden.vehiculo.marca ?? ""} {orden.vehiculo.modelo ?? ""} {orden.vehiculo.anio ?? ""}
            </p>
          </div>
        </div>

        {orden.trabajador && (
          <p className="text-sm text-slate-500 mb-6">Trabajo realizado por: {orden.trabajador.nombre}</p>
        )}

        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
              <th className="pb-2">Servicio</th>
              <th className="pb-2 text-right">Cant.</th>
              <th className="pb-2 text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orden.servicios.map((linea) => (
              <tr key={linea.id}>
                <td className="py-2">{linea.servicio?.nombre ?? linea.nombrePersonalizado}</td>
                <td className="py-2 text-right">{linea.cantidad}</td>
                <td className="py-2 text-right">{formatCLP(Number(linea.precioCobrado) * linea.cantidad)}</td>
              </tr>
            ))}
            {orden.servicios.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 text-slate-400">
                  Sin servicios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
              <th className="pb-2">Repuesto / material</th>
              <th className="pb-2 text-right">Cant.</th>
              <th className="pb-2 text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orden.productos.map((linea) => (
              <tr key={linea.id}>
                <td className="py-2">{linea.producto?.nombre ?? linea.nombrePersonalizado}</td>
                <td className="py-2 text-right">{linea.cantidad}</td>
                <td className="py-2 text-right">{formatCLP(Number(linea.precioUnitario) * linea.cantidad)}</td>
              </tr>
            ))}
            {orden.productos.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 text-slate-400">
                  Sin repuestos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {orden.observaciones && (
          <div className="mb-6 text-sm">
            <p className="text-slate-400 uppercase text-xs mb-1">Observaciones</p>
            <p className="text-slate-700">{orden.observaciones}</p>
          </div>
        )}

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <p className="text-xl font-bold text-slate-900">Total: {formatCLP(total)}</p>
        </div>

        <p className="text-xs text-slate-400 text-center mt-10">Gracias por confiar en Carbox.</p>
      </div>
    </div>
  );
}
