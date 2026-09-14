"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notificarSolicitudConfirmada, notificarSolicitudRechazada } from "@/lib/notificaciones";

export async function confirmarSolicitud(id: string) {
  await requireSession();

  const solicitud = await prisma.solicitudAgendamiento.findUniqueOrThrow({ where: { id } });

  // Si ya existe un vehículo con esa patente, se reutiliza (y su cliente).
  // Si no, se crea un cliente + vehículo nuevos a partir de los datos de la solicitud,
  // incluyendo marca/modelo/año si el visitante los ingresó.
  let vehiculo = await prisma.vehiculo.findUnique({ where: { patente: solicitud.patente } });

  if (!vehiculo) {
    const cliente = await prisma.cliente.create({
      data: { nombre: solicitud.nombreContacto, telefono: solicitud.telefono, email: solicitud.email },
    });
    vehiculo = await prisma.vehiculo.create({
      data: {
        patente: solicitud.patente,
        marca: solicitud.marca,
        modelo: solicitud.modelo,
        anio: solicitud.anio,
        clienteId: cliente.id,
      },
    });
  }

  await prisma.solicitudAgendamiento.update({
    where: { id },
    data: { estado: "CONFIRMADA", vehiculoId: vehiculo.id, clienteId: vehiculo.clienteId },
  });

  await notificarSolicitudConfirmada({
    nombreContacto: solicitud.nombreContacto,
    telefono: solicitud.telefono,
    email: solicitud.email,
    fechaPreferida: solicitud.fechaPreferida,
  });

  revalidatePath("/panel/agendamientos");
  revalidatePath("/panel/clientes");
}

export async function rechazarSolicitud(id: string) {
  await requireSession();

  const solicitud = await prisma.solicitudAgendamiento.update({
    where: { id },
    data: { estado: "RECHAZADA" },
  });

  await notificarSolicitudRechazada({
    nombreContacto: solicitud.nombreContacto,
    telefono: solicitud.telefono,
    email: solicitud.email,
  });

  revalidatePath("/panel/agendamientos");
}

export async function convertirEnOrden(id: string) {
  const user = await requireSession();

  const solicitud = await prisma.solicitudAgendamiento.findUniqueOrThrow({ where: { id } });

  if (!solicitud.vehiculoId) {
    throw new Error("La solicitud aún no tiene un vehículo vinculado");
  }

  // Si el texto del servicio solicitado coincide con uno del catálogo, se agrega
  // directamente como línea de la orden (con su precio) en vez de quedar solo como nota.
  const servicioCoincidente = await prisma.servicio.findFirst({
    where: { nombre: { equals: solicitud.servicioTexto } },
  });

  const { _max: maxOrden } = await prisma.ordenTrabajo.aggregate({ _max: { numero: true } });
  const numero = (maxOrden.numero ?? 0) + 1;

  const orden = await prisma.ordenTrabajo.create({
    data: {
      numero,
      vehiculoId: solicitud.vehiculoId,
      fechaProgramada: solicitud.fechaPreferida,
      creadoPorId: user.id,
      solicitudOrigenId: solicitud.id,
      observaciones: [servicioCoincidente ? null : `Servicio solicitado: ${solicitud.servicioTexto}`, solicitud.comentario]
        .filter(Boolean)
        .join(" — ") || null,
      servicios: servicioCoincidente
        ? {
            create: {
              servicioId: servicioCoincidente.id,
              cantidad: 1,
              precioCobrado: servicioCoincidente.precioBase,
            },
          }
        : undefined,
    },
  });

  revalidatePath("/panel/agendamientos");
  revalidatePath("/panel/ordenes");
  redirect(`/panel/ordenes/${orden.id}`);
}
