import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { formatCLP, formatFechaCorta } from "@/lib/format";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EstadoOrden } from "@prisma/client";

const ESTADOS_ORDEN: EstadoOrden[] = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"];

const etiquetaEstado: Record<EstadoOrden, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

const colorEstado: Record<EstadoOrden, "yellow" | "blue" | "green" | "red"> = {
  PENDIENTE: "yellow",
  EN_PROGRESO: "blue",
  COMPLETADA: "green",
  CANCELADA: "red",
};

function inicioDelMes() {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
}

function finDelDia(fecha: Date) {
  const f = new Date(fecha);
  f.setHours(23, 59, 59, 999);
  return f;
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; estado?: string }>;
}) {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/dashboard");

  const { desde, hasta, estado } = await searchParams;
  const fechaDesde = desde ? new Date(desde) : inicioDelMes();
  const fechaHasta = hasta ? finDelDia(new Date(hasta)) : finDelDia(new Date());
  const filtroEstado = estado === "TODAS" ? "TODAS" : ESTADOS_ORDEN.includes(estado as EstadoOrden) ? (estado as EstadoOrden) : "COMPLETADA";

  const ordenesFiltradas = await prisma.ordenTrabajo.findMany({
    where: {
      ...(filtroEstado === "TODAS" ? {} : { estado: filtroEstado }),
      fechaIngreso: { gte: fechaDesde, lte: fechaHasta },
    },
    include: { servicios: true, productos: true, vehiculo: { include: { cliente: true } } },
    orderBy: { fechaIngreso: "desc" },
  });

  const ventasServicios = ordenesFiltradas.reduce(
    (acc, o) => acc + o.servicios.reduce((a, l) => a + Number(l.precioCobrado) * l.cantidad, 0),
    0
  );
  const ventasProductos = ordenesFiltradas.reduce(
    (acc, o) => acc + o.productos.reduce((a, l) => a + Number(l.precioUnitario) * l.cantidad, 0),
    0
  );
  const ventasTotal = ventasServicios + ventasProductos;

  const costoMateriales = ordenesFiltradas.reduce(
    (acc, o) => acc + o.productos.reduce((a, l) => a + Number(l.costoUnitario) * l.cantidad, 0),
    0
  );
  const margen = ventasTotal - costoMateriales;

  const comprasEntrada = await prisma.movimientoInventario.findMany({
    where: { tipo: "ENTRADA", costoUnitario: { not: null }, createdAt: { gte: fechaDesde, lte: fechaHasta } },
  });
  const gastoCompras = comprasEntrada.reduce((acc, m) => acc + Number(m.costoUnitario) * m.cantidad, 0);

  const consumo = await prisma.movimientoInventario.groupBy({
    by: ["productoId"],
    where: { tipo: "SALIDA", createdAt: { gte: fechaDesde, lte: fechaHasta } },
    _sum: { cantidad: true },
    orderBy: { _sum: { cantidad: "desc" } },
    take: 10,
  });

  const productos = await prisma.producto.findMany({
    where: { id: { in: consumo.map((c) => c.productoId) } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Reportes</h1>

      <form className="flex items-end gap-3 mb-8">
        <Field label="Desde">
          <Input type="date" name="desde" defaultValue={fechaDesde.toISOString().slice(0, 10)} />
        </Field>
        <Field label="Hasta">
          <Input type="date" name="hasta" defaultValue={fechaHasta.toISOString().slice(0, 10)} />
        </Field>
        <Field label="Órdenes">
          <Select name="estado" defaultValue={filtroEstado}>
            <option value="COMPLETADA">Solo completadas</option>
            <option value="TODAS">Todas (cualquier estado)</option>
            {ESTADOS_ORDEN.map((e) => (
              <option key={e} value={e}>
                Solo {etiquetaEstado[e].toLowerCase()}
              </option>
            ))}
          </Select>
        </Field>
        <div className="mb-4">
          <Button type="submit">Filtrar</Button>
        </div>
      </form>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-slate-500">Ventas servicios</p>
          <p className="text-xl font-bold text-slate-900">{formatCLP(ventasServicios)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-slate-500">Ventas productos</p>
          <p className="text-xl font-bold text-slate-900">{formatCLP(ventasProductos)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-slate-500">
            Total ({ordenesFiltradas.length} {ordenesFiltradas.length === 1 ? "orden" : "órdenes"}
            {filtroEstado === "TODAS" ? "" : ` ${etiquetaEstado[filtroEstado].toLowerCase()}${ordenesFiltradas.length === 1 ? "" : "s"}`}
            )
          </p>
          <p className="text-xl font-bold text-green-700">{formatCLP(ventasTotal)}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-slate-500">Costo materiales (en órdenes)</p>
          <p className="text-xl font-bold text-slate-900">{formatCLP(costoMateriales)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-slate-500">Margen (ventas − costo materiales)</p>
          <p className={`text-xl font-bold ${margen >= 0 ? "text-green-700" : "text-red-700"}`}>{formatCLP(margen)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-slate-500">Gasto en compras de stock</p>
          <p className="text-xl font-bold text-slate-900">{formatCLP(gastoCompras)}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-3">Órdenes incluidas en este período</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">OT</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ordenesFiltradas.map((orden) => {
              const totalOrden =
                orden.servicios.reduce((a, l) => a + Number(l.precioCobrado) * l.cantidad, 0) +
                orden.productos.reduce((a, l) => a + Number(l.precioUnitario) * l.cantidad, 0);
              return (
                <tr key={orden.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/panel/ordenes/${orden.id}`} className="text-green-700 font-medium hover:underline">
                      #{orden.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{orden.vehiculo.patente}</td>
                  <td className="px-4 py-3">{orden.vehiculo.cliente.nombre}</td>
                  <td className="px-4 py-3">
                    <Badge color={colorEstado[orden.estado]}>{etiquetaEstado[orden.estado]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatFechaCorta(orden.fechaIngreso)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCLP(totalOrden)}</td>
                </tr>
              );
            })}
            {ordenesFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No hay órdenes que calcen con este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-3">Productos más consumidos</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Cantidad consumida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {consumo.map((c) => {
              const producto = productos.find((p) => p.id === c.productoId);
              return (
                <tr key={c.productoId}>
                  <td className="px-4 py-3">{producto?.nombre ?? "—"}</td>
                  <td className="px-4 py-3">
                    {c._sum.cantidad} {producto?.unidad}
                  </td>
                </tr>
              );
            })}
            {consumo.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-slate-400">
                  Sin movimientos de salida en el período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        Período: {formatFechaCorta(fechaDesde)} – {formatFechaCorta(fechaHasta)}
      </p>
    </div>
  );
}
