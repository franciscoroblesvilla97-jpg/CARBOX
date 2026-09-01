"use server";

import { prisma } from "@/lib/prisma";
import { solicitudAgendamientoSchema } from "@/lib/validations/agendamiento";
import { duracionServicio, puestoDisponiblePara } from "@/lib/disponibilidad";
import { notificarSolicitudConfirmada } from "@/lib/notificaciones";

type State =
  | {
      fieldErrors?: Record<string, string>;
      formError?: string;
      success?: boolean;
      emailEnviado?: boolean;
      pendiente?: boolean;
    }
  | undefined;

export async function crearSolicitudAgendamiento(_prevState: State, formData: FormData): Promise<State> {
  const parsed = solicitudAgendamientoSchema.safeParse({
    nombreContacto: formData.get("nombreContacto"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    patente: formData.get("patente"),
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    anio: formData.get("anio") || undefined,
    servicioTexto: formData.get("servicioTexto"),
    fechaPreferida: formData.get("fechaPreferida"),
    comentario: formData.get("comentario"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string> = {};
    for (const [campo, mensajes] of Object.entries(flattened)) {
      if (mensajes?.[0]) fieldErrors[campo] = mensajes[0];
    }
    return { fieldErrors };
  }

  const fechaPreferida = new Date(parsed.data.fechaPreferida);

  // Si ya existe un vehículo con esa patente, se reutiliza (y su cliente).
  let vehiculo = await prisma.vehiculo.findUnique({ where: { patente: parsed.data.patente } });
  let clienteId: string;

  if (!vehiculo) {
    const cliente = await prisma.cliente.create({
      data: { nombre: parsed.data.nombreContacto, telefono: parsed.data.telefono, email: parsed.data.email || null },
    });
    vehiculo = await prisma.vehiculo.create({
      data: {
        patente: parsed.data.patente,
        marca: parsed.data.marca || null,
        modelo: parsed.data.modelo || null,
        anio: parsed.data.anio ?? null,
        clienteId: cliente.id,
      },
    });
    clienteId = cliente.id;
  } else {
    clienteId = vehiculo.clienteId;
  }

  const solicitud = await prisma.solicitudAgendamiento.create({
    data: {
      nombreContacto: parsed.data.nombreContacto,
      telefono: parsed.data.telefono,
      email: parsed.data.email || null,
      patente: parsed.data.patente,
      marca: parsed.data.marca || null,
      modelo: parsed.data.modelo || null,
      anio: parsed.data.anio ?? null,
      servicioTexto: parsed.data.servicioTexto,
      fechaPreferida,
      comentario: parsed.data.comentario || null,
      clienteId,
      vehiculoId: vehiculo.id,
    },
  });

  // Revalida disponibilidad justo antes de confirmar: si alguien más tomó esa hora
  // en el rato que el visitante llenaba el formulario, la solicitud queda pendiente
  // para que el equipo la coordine manualmente en vez de fallar.
  const duracion = await duracionServicio(parsed.data.servicioTexto);
  const puestoId = await puestoDisponiblePara(fechaPreferida, duracion);

  if (!puestoId) {
    // Alguien más tomó esa hora justo mientras se completaba el formulario: la solicitud
    // queda pendiente (como en el flujo antiguo) para que el equipo la coordine a mano.
    return { success: true, pendiente: true };
  }

  const servicioCoincidente = await prisma.servicio.findFirst({
    where: { nombre: { equals: parsed.data.servicioTexto } },
  });

  const numero = (await prisma.ordenTrabajo.count()) + 1;
  const admin = await prisma.usuario.findFirst({ where: { rol: "ADMIN" } });
  if (!admin) {
    // No debería pasar en un sistema ya en uso (el seed siempre crea un admin), pero
    // sin un usuario "creador" no se puede generar la orden — se deja como pendiente.
    return { success: true, pendiente: true };
  }

  await prisma.$transaction([
    prisma.solicitudAgendamiento.update({ where: { id: solicitud.id }, data: { estado: "CONFIRMADA" } }),
    prisma.ordenTrabajo.create({
      data: {
        numero,
        vehiculoId: vehiculo.id,
        fechaProgramada: fechaPreferida,
        puestoId,
        creadoPorId: admin.id,
        solicitudOrigenId: solicitud.id,
        observaciones: servicioCoincidente ? null : `Servicio solicitado: ${parsed.data.servicioTexto}`,
        servicios: servicioCoincidente
          ? { create: { servicioId: servicioCoincidente.id, cantidad: 1, precioCobrado: servicioCoincidente.precioBase } }
          : undefined,
      },
    }),
  ]);

  const emailEnviado = !!parsed.data.email;
  await notificarSolicitudConfirmada({
    nombreContacto: parsed.data.nombreContacto,
    telefono: parsed.data.telefono,
    email: parsed.data.email || null,
    fechaPreferida,
  });

  return { success: true, emailEnviado };
}
