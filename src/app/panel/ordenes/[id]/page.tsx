import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { formatCLP, formatFecha } from "@/lib/format";
import { EstadoActions } from "./estado-actions";
import { AsignacionForm } from "./asignacion-form";
import { AgregarServicioForm } from "./agregar-servicio-form";
import { AgregarMaterialForm } from "./agregar-material-form";
import { ChecklistForm } from "./checklist-form";
import { ArchivosOrden } from "./archivos-orden";

const estadoColor = {
  PENDIENTE: "yellow",
  EN_PROGRESO: "blue",
  COMPLETADA: "green",
  CANCELADA: "red",
} as const;

export default async function OrdenDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSession();

  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id },
    include: {
      vehiculo: { include: { cliente: true } },
      creadoPor: true,
      trabajador: true,
      puesto: true,
      servicios: { include: { servicio: true } },
      productos: { include: { producto: true } },
      checklist: { include: { items: { orderBy: { orden: "asc" } }, presiones: { orderBy: { orden: "asc" } }, danos: true } },
      archivos: { include: { subidoPor: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!orden) notFound();

  const esTecnico = user.rol === "TECNICO";
  if (esTecnico && orden.trabajadorId !== user.trabajadorId) notFound();

  const [trabajadores, puestos, servicios, productos] = await Promise.all([
    prisma.trabajador.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.puesto.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: { servicios: { select: { id: true } } },
    }),
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  const servicioIdsDeOrden = orden.servicios.map((l) => l.servicioId).filter((sid): sid is string => sid !== null);
  const puestosConCapacidad = puestos.map((p) => {
    const servicioIdsPuesto = new Set(p.servicios.map((s) => s.id));
    return {
      id: p.id,
      nombre: p.nombre,
      puedeRealizarTodos: servicioIdsDeOrden.every((sid) => servicioIdsPuesto.has(sid)),
    };
  });

  const ordenEditable = orden.estado === "PENDIENTE" || orden.estado === "EN_PROGRESO";

  const totalServicios = orden.servicios.reduce((acc, l) => acc + Number(l.precioCobrado) * l.cantidad, 0);
  const totalProductos = orden.productos.reduce((acc, l) => acc + Number(l.precioUnitario) * l.cantidad, 0);
  const total = totalServicios + totalProductos;
  const costoMateriales = orden.productos.reduce((acc, l) => acc + Number(l.costoUnitario) * l.cantidad, 0);
  const margen = total - costoMateriales;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">
            <Link href={`/panel/vehiculos/${orden.vehiculoId}`} className="text-green-700 hover:underline">
              {orden.vehiculo.patente}
            </Link>{" "}
            — {orden.vehiculo.marca ?? ""} {orden.vehiculo.modelo ?? ""} · {orden.vehiculo.cliente.nombre}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Orden de trabajo #{orden.numero}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge color={estadoColor[orden.estado]}>{orden.estado}</Badge>
            <span className="text-xs text-slate-400">Programada {formatFecha(orden.fechaProgramada)}</span>
          </div>
          <Link href={`/panel/ordenes/${orden.id}/informe`} className="text-sm text-green-700 hover:underline">
            Ver informe para el cliente →
          </Link>
        </div>
        <EstadoActions ordenId={orden.id} estado={orden.estado} esAdmin={user.rol === "ADMIN"} />
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Asignación</h2>
        {esTecnico ? (
          <p className="text-sm text-slate-600">
            Asignada a ti {orden.puesto && <>· Puesto: {orden.puesto.nombre}</>}
          </p>
        ) : (
          <AsignacionForm
            ordenId={orden.id}
            trabajadorId={orden.trabajadorId}
            puestoId={orden.puestoId}
            trabajadores={trabajadores}
            puestos={puestosConCapacidad}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Servicios</h2>
        <table className="w-full text-sm mb-4">
          <tbody className="divide-y divide-slate-100">
            {orden.servicios.map((linea) => (
              <tr key={linea.id}>
                <td className="py-2">
                  {linea.servicio?.nombre ?? linea.nombrePersonalizado}
                  {!linea.servicioId && <Badge color="blue">Personalizado</Badge>}
                </td>
                <td className="py-2 text-right text-slate-500">x{linea.cantidad}</td>
                {!esTecnico && (
                  <td className="py-2 text-right font-medium">
                    {formatCLP(Number(linea.precioCobrado) * linea.cantidad)}
                  </td>
                )}
              </tr>
            ))}
            {orden.servicios.length === 0 && (
              <tr>
                <td className="py-2 text-slate-400">Sin servicios en esta orden.</td>
              </tr>
            )}
          </tbody>
        </table>
        {ordenEditable && !esTecnico && <AgregarServicioForm ordenId={orden.id} servicios={servicios} />}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Productos / materiales usados</h2>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-left text-xs text-slate-400">
              <th className="font-normal pb-1">Producto</th>
              <th className="font-normal pb-1 text-right">Cant.</th>
              {user.rol === "ADMIN" && <th className="font-normal pb-1 text-right">Costo</th>}
              {!esTecnico && <th className="font-normal pb-1 text-right">Cobrado</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orden.productos.map((linea) => (
              <tr key={linea.id}>
                <td className="py-2">
                  {linea.producto?.nombre ?? linea.nombrePersonalizado}
                  {!linea.productoId && <Badge color="blue">Externo</Badge>}
                </td>
                <td className="py-2 text-right text-slate-500">x{linea.cantidad}</td>
                {user.rol === "ADMIN" && (
                  <td className="py-2 text-right text-slate-500">
                    {formatCLP(Number(linea.costoUnitario) * linea.cantidad)}
                  </td>
                )}
                {!esTecnico && (
                  <td className="py-2 text-right font-medium">
                    {formatCLP(Number(linea.precioUnitario) * linea.cantidad)}
                  </td>
                )}
              </tr>
            ))}
            {orden.productos.length === 0 && (
              <tr>
                <td colSpan={user.rol === "ADMIN" ? 4 : esTecnico ? 2 : 3} className="py-2 text-slate-400">
                  Sin productos en esta orden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {ordenEditable && !esTecnico && <AgregarMaterialForm ordenId={orden.id} productos={productos} />}
      </div>

      {orden.observaciones && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Observaciones</h2>
          <p className="text-sm text-slate-600">{orden.observaciones}</p>
        </div>
      )}

      {!esTecnico && (
        <div className="flex flex-col items-end gap-1 mb-6">
          {user.rol === "ADMIN" && (
            <>
              <p className="text-sm text-slate-500">Costo materiales: {formatCLP(costoMateriales)}</p>
              <p className="text-sm text-slate-500">
                Margen: <span className={margen >= 0 ? "text-green-700" : "text-red-700"}>{formatCLP(margen)}</span>
              </p>
            </>
          )}
          <p className="text-lg font-bold text-slate-900">Total: {formatCLP(total)}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Checklist de ingreso</h2>
        <ChecklistForm
          ordenId={orden.id}
          checklist={
            orden.checklist
              ? {
                  kilometraje: orden.checklist.kilometraje,
                  observaciones: orden.checklist.observaciones,
                  items: orden.checklist.items,
                  presiones: orden.checklist.presiones.map((p) => ({
                    posicion: p.posicion,
                    estado: p.estado,
                    recomendada: p.recomendada != null ? Number(p.recomendada) : null,
                    medida: p.medida != null ? Number(p.medida) : null,
                  })),
                  danos: orden.checklist.danos.map((d) => ({
                    tipo: d.tipo,
                    x: Number(d.x),
                    y: Number(d.y),
                    nota: d.nota,
                  })),
                }
              : null
          }
        />
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Archivos adjuntos</h2>
        <ArchivosOrden ordenId={orden.id} archivos={orden.archivos} />
      </div>
    </div>
  );
}
