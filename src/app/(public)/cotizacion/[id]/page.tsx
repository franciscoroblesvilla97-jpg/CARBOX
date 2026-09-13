import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCLP, formatFechaCorta } from "@/lib/format";

export default async function CotizacionPublicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id },
    include: {
      servicios: { include: { servicio: true } },
      productos: { include: { producto: true } },
    },
  });

  if (!cotizacion) notFound();

  const totalServicios = cotizacion.servicios.reduce(
    (acc, l) => acc + Number(l.precioCobrado) * l.cantidad * (1 - Number(l.descuento) / 100),
    0
  );
  const totalProductos = cotizacion.productos.reduce(
    (acc, l) => acc + Number(l.precioUnitario) * l.cantidad * (1 - Number(l.descuento) / 100),
    0
  );
  const total = totalServicios + totalProductos;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="border border-slate-200 rounded-lg p-8">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Carbox</h1>
            <p className="text-sm text-slate-500">Pedro de Valdivia 525, Concepción</p>
            <p className="text-sm text-slate-500">+56 9 8210 6659 · contacto@carboxconce.cl</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-slate-900">Cotización</p>
            <p className="text-sm text-slate-500">N° {cotizacion.numero}</p>
            <p className="text-sm text-slate-500">{formatFechaCorta(cotizacion.createdAt)}</p>
          </div>
        </div>

        <div className="mb-6 text-sm">
          <p className="text-slate-400 uppercase text-xs mb-1">Cliente</p>
          <p className="font-medium text-slate-900">{cotizacion.nombreCliente}</p>
          {cotizacion.patente && (
            <p className="text-slate-600">
              Vehículo: {cotizacion.patente} {cotizacion.marca ?? ""} {cotizacion.modelo ?? ""} {cotizacion.anio ?? ""}
            </p>
          )}
        </div>

        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
              <th className="pb-2">Servicio</th>
              <th className="pb-2 text-right">Cant.</th>
              <th className="pb-2 text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cotizacion.servicios.map((linea) => (
              <tr key={linea.id}>
                <td className="py-2">{linea.servicio?.nombre ?? linea.nombrePersonalizado}</td>
                <td className="py-2 text-right">{linea.cantidad}</td>
                <td className="py-2 text-right">
                  {formatCLP(Number(linea.precioCobrado) * linea.cantidad * (1 - Number(linea.descuento) / 100))}
                  {Number(linea.descuento) > 0 && (
                    <span className="block text-xs text-slate-400">Desc. −{Number(linea.descuento)}%</span>
                  )}
                </td>
              </tr>
            ))}
            {cotizacion.servicios.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 text-slate-400">
                  Sin servicios.
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
            {cotizacion.productos.map((linea) => (
              <tr key={linea.id}>
                <td className="py-2">{linea.producto?.nombre ?? linea.nombrePersonalizado}</td>
                <td className="py-2 text-right">{linea.cantidad}</td>
                <td className="py-2 text-right">
                  {formatCLP(Number(linea.precioUnitario) * linea.cantidad * (1 - Number(linea.descuento) / 100))}
                  {Number(linea.descuento) > 0 && (
                    <span className="block text-xs text-slate-400">Desc. −{Number(linea.descuento)}%</span>
                  )}
                </td>
              </tr>
            ))}
            {cotizacion.productos.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 text-slate-400">
                  Sin productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {cotizacion.observaciones && (
          <div className="mb-6 text-sm">
            <p className="text-slate-400 uppercase text-xs mb-1">Observaciones</p>
            <p className="text-slate-700">{cotizacion.observaciones}</p>
          </div>
        )}

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <p className="text-xl font-bold text-slate-900">Total: {formatCLP(total)}</p>
        </div>

        <p className="text-xs text-slate-400 text-center mt-10">
          Cotización sujeta a disponibilidad de repuestos y cambios de precio. Válida por 15 días.
        </p>
      </div>
    </div>
  );
}
