import { prisma } from "@/lib/prisma";
import { proximaHoraDisponible } from "@/lib/format";
import { esHoyChile, inicioDiaChile, minutosDesdeMedianocheChile } from "@/lib/timezone";

const HORA_INICIO = 9;
const HORA_FIN = 19;
const PASO_MIN = 30;
const DURACION_MIN_DEFAULT = 30;

export async function duracionServicio(servicioTexto: string) {
  const servicio = await prisma.servicio.findFirst({ where: { nombre: servicioTexto } });
  return Math.max(servicio?.duracionMinutos || 0, DURACION_MIN_DEFAULT);
}

// Suma la duración de varios servicios marcados a la vez (cotizador de la home), con mínimo 30 min.
export async function duracionServicios(servicioIds: string[]) {
  if (servicioIds.length === 0) return DURACION_MIN_DEFAULT;
  const servicios = await prisma.servicio.findMany({ where: { id: { in: servicioIds } } });
  const total = servicios.reduce((acc, s) => acc + (s.duracionMinutos || 0), 0);
  return Math.max(total, DURACION_MIN_DEFAULT);
}

async function ocupacionDelDia(dia: Date, excluirOrdenId?: string) {
  const inicio = inicioDiaChile(dia);
  const fin = new Date(inicio.getTime() + 24 * 60 * 60000);

  const [puestos, ordenes] = await Promise.all([
    prisma.puesto.findMany({ where: { activo: true } }),
    prisma.ordenTrabajo.findMany({
      where: {
        fechaProgramada: { gte: inicio, lt: fin },
        estado: { not: "CANCELADA" },
        ...(excluirOrdenId ? { id: { not: excluirOrdenId } } : {}),
      },
      include: { servicios: { include: { servicio: true } } },
    }),
  ]);

  const bloques = ordenes
    .filter((o) => o.puestoId)
    .map((o) => {
      const inicioMin = minutosDesdeMedianocheChile(o.fechaProgramada);
      const duracion = Math.max(
        o.servicios.reduce((acc, l) => acc + (l.servicio?.duracionMinutos ?? 0) * l.cantidad, 0),
        20
      );
      return { puestoId: o.puestoId as string, inicioMin, finMin: inicioMin + duracion };
    });

  return { puestos, bloques };
}

function hayPuestoLibre(
  puestos: { id: string }[],
  bloques: { puestoId: string; inicioMin: number; finMin: number }[],
  inicioMin: number,
  duracionMin: number
) {
  return puestos.some(
    (p) =>
      !bloques.some(
        (b) => b.puestoId === p.id && inicioMin < b.finMin && inicioMin + duracionMin > b.inicioMin
      )
  );
}

// Lista los horarios (Date) disponibles para un día, dada la duración del servicio elegido.
export async function horariosDisponibles(dia: Date, duracionMin: number, excluirOrdenId?: string) {
  const { puestos, bloques } = await ocupacionDelDia(dia, excluirOrdenId);
  if (puestos.length === 0) return [];

  const inicio = inicioDiaChile(dia);
  const minimoHoyMin = esHoyChile(dia) ? minutosDesdeMedianocheChile(proximaHoraDisponible()) : -Infinity;

  const disponibles: Date[] = [];
  for (let min = HORA_INICIO * 60; min + duracionMin <= HORA_FIN * 60; min += PASO_MIN) {
    if (min < minimoHoyMin) continue;
    if (hayPuestoLibre(puestos, bloques, min, duracionMin)) {
      disponibles.push(new Date(inicio.getTime() + min * 60000));
    }
  }
  return disponibles;
}

// Busca un puesto libre para una fecha/hora exacta (usado al confirmar la reserva,
// para revalidar y asignar puesto de forma atómica respecto a lo que se le mostró al visitante).
export async function puestoDisponiblePara(fecha: Date, duracionMin: number, excluirOrdenId?: string) {
  const { puestos, bloques } = await ocupacionDelDia(fecha, excluirOrdenId);
  const inicioMin = minutosDesdeMedianocheChile(fecha);

  for (const p of puestos) {
    const ocupado = bloques.some(
      (b) => b.puestoId === p.id && inicioMin < b.finMin && inicioMin + duracionMin > b.inicioMin
    );
    if (!ocupado) return p.id;
  }
  return null;
}
