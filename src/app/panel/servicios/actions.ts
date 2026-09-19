"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { servicioSchema } from "@/lib/validations/servicio";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearServicio(_prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = servicioSchema.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    precioBase: formData.get("precioBase"),
    duracionMinutos: formData.get("duracionMinutos"),
    activo: formData.get("activo"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.servicio.create({
    data: {
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion || null,
      precioBase: parsed.data.precioBase,
      duracionMinutos: parsed.data.duracionMinutos,
      activo: parsed.data.activo ?? true,
    },
  });

  revalidatePath("/panel/servicios");
  revalidatePath("/");
  redirect("/panel/servicios");
}

export async function actualizarServicio(id: string, _prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = servicioSchema.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    precioBase: formData.get("precioBase"),
    duracionMinutos: formData.get("duracionMinutos"),
    activo: formData.get("activo"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.servicio.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion || null,
      precioBase: parsed.data.precioBase,
      duracionMinutos: parsed.data.duracionMinutos,
      activo: parsed.data.activo ?? false,
    },
  });

  revalidatePath("/panel/servicios");
  revalidatePath("/");
  redirect("/panel/servicios");
}
