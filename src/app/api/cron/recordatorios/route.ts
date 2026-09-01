import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarRecordatorio24h } from "@/lib/notificaciones";

// Corre cada hora (ver vercel.json). Busca órdenes agendadas entre 23 y 25 horas desde
// ahora — la ventana de 2h evita huecos entre ejecuciones consecutivas del cron; el flag
// recordatorioEnviado evita mandar el mismo recordatorio dos veces si una orden cae en
// la superposición de dos ventanas seguidas.
export async function GET(request: NextRequest) {
  if (process.env.CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const ahora = new Date();
  const desde = new Date(ahora.getTime() + 23 * 60 * 60 * 1000);
  const hasta = new Date(ahora.getTime() + 25 * 60 * 60 * 1000);

  const ordenes = await prisma.ordenTrabajo.findMany({
    where: {
      recordatorioEnviado: false,
      estado: { in: ["PENDIENTE", "EN_PROGRESO"] },
      fechaProgramada: { gte: desde, lt: hasta },
    },
    include: { vehiculo: { include: { cliente: true } } },
  });

  for (const orden of ordenes) {
    await notificarRecordatorio24h({
      numero: orden.numero,
      tokenPublico: orden.tokenPublico,
      clienteNombre: orden.vehiculo.cliente.nombre,
      telefono: orden.vehiculo.cliente.telefono,
      email: orden.vehiculo.cliente.email,
      fechaProgramada: orden.fechaProgramada,
    });
    await prisma.ordenTrabajo.update({ where: { id: orden.id }, data: { recordatorioEnviado: true } });
  }

  return NextResponse.json({ enviados: ordenes.length });
}
