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

  const serviciosPlanos = servicios.map((s) => ({ ...s, precioBase: Number(s.precioBase) }));
  const productosPlanos = productos.map((p) => ({
    ...p,
    precioVenta: Number(p.precioVenta),
    costoUnitario: Number(p.costoUnitario),
  }));
  const lineasServicio = cotizacion.servicios.map((l) => ({
    ...l,
    precioCobrado: Number(l.precioCobrado),
    descuento: Number(l.descuento),
    servicio: l.servicio ? { id: l.servicio.id, nombre: l.servicio.nombre } : null,
  }));
  const lineasProducto = cotizacion.productos.map((l) => ({
    ...l,
    precioUnitario: Number(l.precioUnitario),
    costoUnitario: Number(l.costoUnitario),
    descuento: Number(l.descuento),
    producto: l.producto ? { id: l.producto.id, nombre: l.producto.nombre } : null,
  }));

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
          <p className="text-sm text-neutral-500">
            {cotizacion.nombreCliente} {cotizacion.patente ? `— ${cotizacion.patente}` : ""}
          </p>
          {(cotizacion.marca || cotizacion.modelo || cotizacion.anio) && (
            <p className="text-sm text-neutral-500">
              {cotizacion.marca ?? ""} {cotizacion.modelo ?? ""} {cotizacion.anio ?? ""}
            </p>
          )}
          <h1 className="text-2xl font-bold text-ink">Cotización #{cotizacion.numero}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge color={estadoColor[cotizacion.estado]}>{cotizacion.estado}</Badge>
            <span className="text-xs text-neutral-400">{formatFecha(cotizacion.createdAt)}</span>
          </div>
          <Link href={`/panel/cotizaciones/${cotizacion.id}/informe`} className="text-sm text-accent-text hover:underline">
            Ver cotización para el cliente →
          </Link>
        </div>
        <EstadoActions cotizacionId={cotizacion.id} estado={cotizacion.estado} esAdmin={user.rol === "ADMIN"} />
      </div>

      <div className="bg-paper border border-ink/12 p-4 mb-4">
        <h2 className="text-sm font-semibold text-ink mb-3">Servicios</h2>
        <ServiciosTabla lineas={lineasServicio} cotizacionId={cotizacion.id} editable={editable} />
        {editable && (
          <div className="mt-4 pt-4 border-t border-ink/10">
            <AgregarServicioForm cotizacionId={cotizacion.id} servicios={serviciosPlanos} />
          </div>
        )}
      </div>

      <div className="bg-paper border border-ink/12 p-4 mb-4">
        <h2 className="text-sm font-semibold text-ink mb-3">Productos / materiales</h2>
        <ProductosTabla lineas={lineasProducto} cotizacionId={cotizacion.id} editable={editable} />
        {editable && (
          <div className="mt-4 pt-4 border-t border-ink/10">
            <AgregarMaterialForm cotizacionId={cotizacion.id} productos={productosPlanos} />
          </div>
        )}
      </div>

      {cotizacion.observaciones && (
        <div className="bg-paper border border-ink/12 p-4 mb-4">
          <h2 className="text-sm font-semibold text-ink mb-1">Observaciones</h2>
          <p className="text-sm text-neutral-600">{cotizacion.observaciones}</p>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <p className="text-lg font-bold text-ink">Total: {formatCLP(total)}</p>
      </div>

      {cotizacion.estado === "APROBADA" &&
        (cotizacion.ordenGenerada ? (
          <Link
            href={`/panel/ordenes/${cotizacion.ordenGenerada.id}`}
            className="text-accent-text font-medium hover:underline"
          >
            Ver orden de trabajo #{cotizacion.ordenGenerada.numero} →
          </Link>
        ) : (
          <div className="bg-paper border border-ink/12 p-4">
            <h2 className="text-sm font-semibold text-ink mb-3">Convertir en orden de trabajo</h2>
            <ConvertirForm cotizacionId={cotizacion.id} requierePatente={!cotizacion.vehiculoId && !cotizacion.patente} />
          </div>
        ))}
    </div>
  );
}
