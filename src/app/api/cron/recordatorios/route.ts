import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarRecordatorio24h } from "@/lib/notificaciones";

// Corre una vez al día (ver vercel.json — el plan Hobby de Vercel no permite crons más
// frecuentes). La ventana de 12-36h cubre cualquier hora del día siguiente sin importar
// a qué hora exacta dispare el cron; el flag recordatorioEnviado evita reenvíos si la
// orden sigue cayendo en la ventana al día siguiente.
export async function GET(request: NextRequest) {
  if (process.env.CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const ahora = new Date();
  const desde = new Date(ahora.getTime() + 12 * 60 * 60 * 1000);
  const hasta = new Date(ahora.getTime() + 36 * 60 * 60 * 1000);

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
