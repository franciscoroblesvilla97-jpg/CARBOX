import Link from "next/link";
import { empaquetarBloques } from "@/lib/agendaCalendario";
import { minutosDesdeMedianocheChile } from "@/lib/timezone";
import type { EstadoOrden, OrdenTrabajoServicio, Servicio, Vehiculo, Cliente, Trabajador, Puesto } from "@prisma/client";

const HORA_INICIO = 9;
const HORA_FIN = 18;
const PX_POR_MIN = 1; // 60px por hora
const ALTO_TOTAL = (HORA_FIN - HORA_INICIO) * 60 * PX_POR_MIN;
const ALTO_MIN_BLOQUE = 24;

const estadoClases: Record<EstadoOrden, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
  EN_PROGRESO: "bg-blue-100 text-blue-800 border-blue-300",
  COMPLETADA: "bg-green-100 text-green-800 border-green-300",
  CANCELADA: "bg-red-100 text-red-800 border-red-300",
};

type OrdenConDatos = {
  id: string;
  numero: number;
  estado: EstadoOrden;
  fechaProgramada: Date;
  puestoId: string | null;
  vehiculo: Vehiculo & { cliente: Cliente };
  servicios: (OrdenTrabajoServicio & { servicio: Servicio | null })[];
  trabajador: Trabajador | null;
};

function duracionOrden(servicios: (OrdenTrabajoServicio & { servicio: Servicio | null })[]) {
  return servicios.reduce((acc, l) => acc + (l.servicio?.duracionMinutos ?? 0) * l.cantidad, 0);
}

export function AgendaCalendario({ ordenes, puestos }: { ordenes: OrdenConDatos[]; puestos: Puesto[] }) {
  const columnas = [...puestos.map((p) => ({ id: p.id, nombre: p.nombre })), { id: null, nombre: "Sin asignar" }];
  const horas = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div className="flex">
        <div className="w-12 shrink-0 border-r border-slate-100" />
        {columnas.map((col) => (
          <div
            key={col.id ?? "sin-asignar"}
            className="flex-1 min-w-0 text-center text-xs font-medium text-slate-700 py-2 border-b border-l border-slate-100 bg-slate-50"
          >
            {col.nombre}
          </div>
        ))}
      </div>
      <div className="flex">
        <div className="w-12 shrink-0 relative border-r border-slate-100" style={{ height: ALTO_TOTAL }}>
          {horas.map((h) => (
            <div key={h} className="absolute left-0 right-0 text-[11px] text-slate-400 px-1" style={{ top: (h - HORA_INICIO) * 60 }}>
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>
        {columnas.map((col) => {
          const ordenesColumna = ordenes.filter((o) => o.puestoId === col.id);
          const bloques = empaquetarBloques(
            ordenesColumna.map((o) => {
              const inicioMin = minutosDesdeMedianocheChile(o.fechaProgramada);
              return { inicioMin, duracionMin: Math.max(duracionOrden(o.servicios), 20), orden: o };
            })
          );

          return (
            <div key={col.id ?? "sin-asignar"} className="flex-1 min-w-0 relative border-l border-slate-100" style={{ height: ALTO_TOTAL }}>
              {horas.map((h) => (
                <div key={h} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: (h - HORA_INICIO) * 60 }} />
              ))}
              {bloques.map((b) => {
                const topSinClamp = (b.inicioMin - HORA_INICIO * 60) * PX_POR_MIN;
                const alto = Math.max(b.duracionMin * PX_POR_MIN, ALTO_MIN_BLOQUE);
                const top = Math.min(Math.max(topSinClamp, 0), ALTO_TOTAL - alto);
                const ancho = 100 / b.lanesTotal;
                return (
                  <Link
                    key={b.orden.id}
                    href={`/panel/ordenes/${b.orden.id}`}
                    className={`absolute rounded border px-1.5 py-0.5 text-[11px] overflow-hidden hover:opacity-80 ${estadoClases[b.orden.estado]}`}
                    style={{ top, height: alto, left: `${b.lane * ancho}%`, width: `calc(${ancho}% - 2px)` }}
                  >
                    <p className="font-medium truncate">{b.orden.vehiculo.patente}</p>
                    <p className="truncate">
                      {b.orden.servicios.map((s) => s.servicio?.nombre ?? s.nombrePersonalizado).join(", ") || "Sin servicios"}
                    </p>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
      {ordenes.length === 0 && (
        <p className="px-4 py-6 text-center text-slate-400 text-sm">No hay órdenes programadas para hoy.</p>
      )}
    </div>
  );
}
