import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { inicioDelDia, formatHora, formatDuracion } from "@/lib/format";
import { AgendaCalendario } from "./agenda-calendario";
import type { EstadoOrden, OrdenTrabajoServicio, Servicio } from "@prisma/client";

const estadoColor = {
  PENDIENTE: "yellow",
  EN_PROGRESO: "blue",
  COMPLETADA: "green",
  CANCELADA: "red",
} as const;

const estadoLabel: Record<EstadoOrden, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

function duracionOrden(servicios: (OrdenTrabajoServicio & { servicio: Servicio | null })[]) {
  return servicios.reduce((acc, l) => acc + (l.servicio?.duracionMinutos ?? 0) * l.cantidad, 0);
}

export default async function DashboardPage() {
  const user = await requireSession();
  if (user.rol === "TECNICO") redirect("/panel/ordenes");

  const inicioAyer = inicioDelDia(-1);
  const inicioHoy = inicioDelDia(0);
  const inicioManana = inicioDelDia(1);
  const inicioPasadoManana = inicioDelDia(2);

  const [ordenesAyer, ordenesHoy, ordenesManana, todosLosProductos, puestos] = await Promise.all([
    prisma.ordenTrabajo.findMany({
      where: { fechaProgramada: { gte: inicioAyer, lt: inicioHoy } },
      include: { vehiculo: { include: { cliente: true } } },
    }),
    prisma.ordenTrabajo.findMany({
      where: { fechaProgramada: { gte: inicioHoy, lt: inicioManana } },
      orderBy: { fechaProgramada: "asc" },
      include: {
        vehiculo: { include: { cliente: true } },
        servicios: { include: { servicio: true } },
        productos: { include: { producto: true } },
        trabajador: true,
      },
    }),
    prisma.ordenTrabajo.findMany({
      where: { fechaProgramada: { gte: inicioManana, lt: inicioPasadoManana } },
      orderBy: { fechaProgramada: "asc" },
      include: {
        vehiculo: { include: { cliente: true } },
        servicios: { include: { servicio: true } },
        trabajador: true,
      },
    }),
    prisma.producto.findMany({ orderBy: { nombre: "asc" } }),
    prisma.puesto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  const ayerAbiertas = ordenesAyer.filter((o) => o.estado === "PENDIENTE" || o.estado === "EN_PROGRESO");
  const ayerCerradas = ordenesAyer.length - ayerAbiertas.length;
  const duracionTotalHoy = ordenesHoy.reduce((acc, o) => acc + duracionOrden(o.servicios), 0);
  const productosBajoStock = todosLosProductos.filter((p) => p.stockActual <= p.stockMinimo);

  // Los materiales de una orden se descuentan del stock apenas se agregan (ver crearOrdenTrabajo),
  // así que stockActual ya refleja ese consumo. Sumando la cantidad usada hoy de vuelta reconstruimos
  // el stock "antes de hoy" y con eso vemos cuánto de lo necesario hoy realmente alcanzó a cubrirse.
  const necesarioPorProducto = new Map<string, { nombre: string; unidad: string; necesario: number }>();
  for (const orden of ordenesHoy) {
    for (const linea of orden.productos) {
      if (!linea.productoId || !linea.producto) continue;
      const entrada = necesarioPorProducto.get(linea.productoId) ?? {
        nombre: linea.producto.nombre,
        unidad: linea.producto.unidad,
        necesario: 0,
      };
      entrada.necesario += linea.cantidad;
      necesarioPorProducto.set(linea.productoId, entrada);
    }
  }

  let materialesNecesarios = 0;
  let materialesConfirmados = 0;
  const materialesEnRiesgo: { nombre: string; faltante: number; unidad: string }[] = [];
  for (const [productoId, info] of necesarioPorProducto) {
    const producto = todosLosProductos.find((p) => p.id === productoId);
    const stockAntes = (producto?.stockActual ?? 0) + info.necesario;
    const confirmado = Math.min(info.necesario, Math.max(stockAntes, 0));
    materialesNecesarios += info.necesario;
    materialesConfirmados += confirmado;
    if (confirmado < info.necesario) {
      materialesEnRiesgo.push({ nombre: info.nombre, faltante: info.necesario - confirmado, unidad: info.unidad });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-2">Hola, {user.nombre}</h1>
      <p className="text-neutral-500 mb-6">Bienvenido al panel de Carbox.</p>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="bg-paper border border-ink/12 p-4">
          <p className="text-sm text-neutral-500 mb-1">Ayer</p>
          <p className="text-2xl font-bold text-ink">
            {ayerCerradas} <span className="text-sm font-normal text-neutral-500">de {ordenesAyer.length} cerradas</span>
          </p>
          {ayerAbiertas.length > 0 && (
            <p className="text-sm text-yellow-700 mt-1">{ayerAbiertas.length} quedaron abiertas</p>
          )}
        </div>
        <div className="bg-paper border border-ink/12 p-4">
          <p className="text-sm text-neutral-500 mb-1">Hoy</p>
          <p className="text-2xl font-bold text-ink">
            {ordenesHoy.length} <span className="text-sm font-normal text-neutral-500">órdenes</span>
          </p>
          {duracionTotalHoy > 0 && (
            <p className="text-sm text-neutral-500 mt-1">≈{formatDuracion(duracionTotalHoy)} de trabajo estimado</p>
          )}
        </div>
        <div className="bg-paper border border-ink/12 p-4">
          <p className="text-sm text-neutral-500 mb-1">Mañana</p>
          <p className="text-2xl font-bold text-ink">
            {ordenesManana.length} <span className="text-sm font-normal text-neutral-500">agendadas</span>
          </p>
          {ordenesManana.length > 0 && (
            <p className="text-sm text-neutral-500 mt-1">Primera a las {formatHora(ordenesManana[0].fechaProgramada)}</p>
          )}
        </div>
        <div className="bg-paper border border-ink/12 p-4">
          <p className="text-sm text-neutral-500 mb-1">Materiales</p>
          <p className="text-2xl font-bold text-ink">
            {materialesConfirmados}
            <span className="text-sm font-normal text-neutral-500">/{materialesNecesarios}</span>
          </p>
          {materialesNecesarios === 0 ? (
            <p className="text-sm text-neutral-500 mt-1">Sin materiales asignados hoy.</p>
          ) : materialesEnRiesgo.length > 0 ? (
            <p className="text-sm text-[#a63327] mt-1">Comprar con urgencia</p>
          ) : (
            <p className="text-sm text-accent-text mt-1">Cubierto</p>
          )}
        </div>
      </div>

      {materialesEnRiesgo.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-ink mb-3">Materiales que faltan para hoy</h2>
          <div className="bg-paper border border-ink/12 divide-y divide-ink/10 mb-8">
            {materialesEnRiesgo.map((m) => (
              <div key={m.nombre} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium text-ink">{m.nombre}</span>
                <span className="text-sm text-[#a63327]">
                  Faltan {m.faltante} {m.unidad}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {ayerAbiertas.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-ink mb-3">Ayer quedó pendiente</h2>
          <div className="bg-paper border border-ink/12 divide-y divide-ink/10 mb-8">
            {ayerAbiertas.map((orden) => (
              <Link
                key={orden.id}
                href={`/panel/ordenes/${orden.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface"
              >
                <div>
                  <p className="font-medium text-ink">
                    {orden.vehiculo.patente} — {orden.vehiculo.cliente.nombre}
                  </p>
                  <p className="text-xs text-neutral-400">OT #{orden.numero}</p>
                </div>
                <Badge color={estadoColor[orden.estado]}>{estadoLabel[orden.estado]}</Badge>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="text-lg font-semibold text-ink mb-3">Agenda de hoy</h2>
      <AgendaCalendario ordenes={ordenesHoy} puestos={puestos} />

      <h2 className="text-lg font-semibold text-ink mb-3">Vista previa de mañana</h2>
      <div className="bg-paper border border-ink/12 divide-y divide-ink/10 mb-8">
        {ordenesManana.map((orden) => (
          <Link
            key={orden.id}
            href={`/panel/ordenes/${orden.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-surface"
          >
            <span className="text-sm text-neutral-500 w-12 shrink-0">{formatHora(orden.fechaProgramada)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink truncate">
                {orden.vehiculo.patente} — {orden.vehiculo.cliente.nombre}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {orden.servicios.map((s) => s.servicio?.nombre ?? s.nombrePersonalizado).join(", ") || "Sin servicios"}
                {duracionOrden(orden.servicios) > 0 && ` · ${duracionOrden(orden.servicios)} min`}
                {" · "}
                {orden.trabajador?.nombre ?? "Sin asignar"}
              </p>
            </div>
          </Link>
        ))}
        {ordenesManana.length === 0 && (
          <p className="px-4 py-6 text-center text-neutral-400 text-sm">Aún no hay nada agendado para mañana.</p>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold text-ink">Productos con bajo stock</h2>
        {productosBajoStock.length > 0 && <Badge color="red">{productosBajoStock.length}</Badge>}
      </div>
      <div className="bg-paper border border-ink/12 divide-y divide-ink/10">
        {productosBajoStock.map((p) => (
          <Link
            key={p.id}
            href={`/panel/inventario/${p.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-surface"
          >
            <span className="font-medium text-ink">{p.nombre}</span>
            <span className="text-sm text-neutral-500">
              {p.stockActual} {p.unidad} (mínimo {p.stockMinimo})
            </span>
          </Link>
        ))}
        {productosBajoStock.length === 0 && (
          <p className="px-4 py-6 text-center text-neutral-400 text-sm">Todo el stock está por encima del mínimo. 👍</p>
        )}
      </div>
    </div>
  );
}
