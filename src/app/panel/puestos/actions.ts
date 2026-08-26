"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { puestoSchema } from "@/lib/validations/trabajador";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearPuesto(_prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = puestoSchema.safeParse({
    nombre: formData.get("nombre"),
    activo: formData.get("activo"),
    servicioIds: formData.getAll("servicioIds"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.puesto.create({
    data: {
      nombre: parsed.data.nombre,
      activo: parsed.data.activo ?? true,
      servicios: { connect: parsed.data.servicioIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/panel/puestos");
  redirect("/panel/puestos");
}

export async function actualizarPuesto(id: string, _prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = puestoSchema.safeParse({
    nombre: formData.get("nombre"),
    activo: formData.get("activo"),
    servicioIds: formData.getAll("servicioIds"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.puesto.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      activo: parsed.data.activo ?? false,
      servicios: { set: parsed.data.servicioIds.map((sid) => ({ id: sid })) },
    },
  });

  revalidatePath("/panel/puestos");
  redirect("/panel/puestos");
}
