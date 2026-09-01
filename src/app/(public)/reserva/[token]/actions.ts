"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { puestoDisponiblePara } from "@/lib/disponibilidad";

function duracionOrden(servicios: { servicio: { duracionMinutos: number } | null; cantidad: number }[]) {
  return Math.max(
    servicios.reduce((acc, l) => acc + (l.servicio?.duracionMinutos ?? 0) * l.cantidad, 0),
    20
  );
}

export async function confirmarAsistencia(token: string) {
  await prisma.ordenTrabajo.update({
    where: { tokenPublico: token },
    data: { confirmadoCliente: true },
  });
  revalidatePath(`/reserva/${token}`);
}

export async function cambiarHora(token: string, nuevaFechaISO: string): Promise<{ error?: string }> {
  const orden = await prisma.ordenTrabajo.findUniqueOrThrow({
    where: { tokenPublico: token },
    include: { servicios: { include: { servicio: true } } },
  });

  const nuevaFecha = new Date(nuevaFechaISO);
  const duracion = duracionOrden(orden.servicios);
  const puestoId = await puestoDisponiblePara(nuevaFecha, duracion, orden.id);

  if (!puestoId) {
    return { error: "Esa hora ya no está disponible, elige otra." };
  }

  await prisma.ordenTrabajo.update({
    where: { id: orden.id },
    data: {
      fechaProgramada: nuevaFecha,
      puestoId,
      recordatorioEnviado: false,
      confirmadoCliente: true,
    },
  });

  revalidatePath(`/reserva/${token}`);
  revalidatePath("/panel/dashboard");
  return {};
}
