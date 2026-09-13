import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { formatCLP, formatFecha } from "@/lib/format";
import { EstadoActions } from "./estado-actions";
import { ConvertirForm } from "./convertir-form";
import { AgregarServicioForm } from "./agregar-servicio-form";
import { AgregarMaterialForm } from "./agregar-material-form";
import { ServiciosTabla } from "./servicios-tabla";
import { ProductosTabla } from "./productos-tabla";

const estadoColor = {
  PENDIENTE: "yellow",
  APROBADA: "green",
  RECHAZADA: "red",
} as const;

export default async function CotizacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSession();

  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id },
    include: {
      servicios: { include: { servicio: true } },
      productos: { include: { producto: true } },
      ordenGenerada: true,
    },
  });

  if (!cotizacion) notFound();

  const [servicios, productos] = await Promise.all([
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  const editable = cotizacion.estado === "PENDIENTE";

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
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">
            {cotizacion.nombreCliente} {cotizacion.patente ? `— ${cotizacion.patente}` : ""}
          </p>
          {(cotizacion.marca || cotizacion.modelo || cotizacion.anio) && (
            <p className="text-sm text-slate-500">
              {cotizacion.marca ?? ""} {cotizacion.modelo ?? ""} {cotizacion.anio ?? ""}
            </p>
          )}
          <h1 className="text-2xl font-bold text-slate-900">Cotización #{cotizacion.numero}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge color={estadoColor[cotizacion.estado]}>{cotizacion.estado}</Badge>
            <span className="text-xs text-slate-400">{formatFecha(cotizacion.createdAt)}</span>
          </div>
          <Link href={`/panel/cotizaciones/${cotizacion.id}/informe`} className="text-sm text-green-700 hover:underline">
            Ver cotización para el cliente →
          </Link>
        </div>
        <EstadoActions cotizacionId={cotizacion.id} estado={cotizacion.estado} esAdmin={user.rol === "ADMIN"} />
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Servicios</h2>
        <ServiciosTabla lineas={cotizacion.servicios} cotizacionId={cotizacion.id} editable={editable} />
        {editable && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <AgregarServicioForm cotizacionId={cotizacion.id} servicios={servicios} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Productos / materiales</h2>
        <ProductosTabla lineas={cotizacion.productos} cotizacionId={cotizacion.id} editable={editable} />
        {editable && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <AgregarMaterialForm cotizacionId={cotizacion.id} productos={productos} />
          </div>
        )}
      </div>

      {cotizacion.observaciones && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Observaciones</h2>
          <p className="text-sm text-slate-600">{cotizacion.observaciones}</p>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <p className="text-lg font-bold text-slate-900">Total: {formatCLP(total)}</p>
      </div>

      {cotizacion.estado === "APROBADA" &&
        (cotizacion.ordenGenerada ? (
          <Link
            href={`/panel/ordenes/${cotizacion.ordenGenerada.id}`}
            className="text-green-700 font-medium hover:underline"
          >
            Ver orden de trabajo #{cotizacion.ordenGenerada.numero} →
          </Link>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Convertir en orden de trabajo</h2>
            <ConvertirForm cotizacionId={cotizacion.id} requierePatente={!cotizacion.vehiculoId && !cotizacion.patente} />
          </div>
        ))}
    </div>
  );
}
