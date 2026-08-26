"use server";

import { prisma } from "@/lib/prisma";
import { solicitudAgendamientoSchema } from "@/lib/validations/agendamiento";

type State =
  | { fieldErrors?: Record<string, string>; formError?: string; success?: boolean }
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

  await prisma.solicitudAgendamiento.create({
    data: {
      nombreContacto: parsed.data.nombreContacto,
      telefono: parsed.data.telefono,
      email: parsed.data.email || null,
      patente: parsed.data.patente,
      marca: parsed.data.marca || null,
      modelo: parsed.data.modelo || null,
      anio: parsed.data.anio ?? null,
      servicioTexto: parsed.data.servicioTexto,
      fechaPreferida: new Date(parsed.data.fechaPreferida),
      comentario: parsed.data.comentario || null,
    },
  });

  return { success: true };
}
