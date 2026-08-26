"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { trabajadorSchema } from "@/lib/validations/trabajador";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearTrabajador(_prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = trabajadorSchema.safeParse({
    nombre: formData.get("nombre"),
    activo: formData.get("activo"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.trabajador.create({
    data: { nombre: parsed.data.nombre, activo: parsed.data.activo ?? true },
  });

  revalidatePath("/panel/trabajadores");
  redirect("/panel/trabajadores");
}

export async function actualizarTrabajador(id: string, _prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = trabajadorSchema.safeParse({
    nombre: formData.get("nombre"),
    activo: formData.get("activo"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.trabajador.update({
    where: { id },
    data: { nombre: parsed.data.nombre, activo: parsed.data.activo ?? false },
  });

  revalidatePath("/panel/trabajadores");
  redirect("/panel/trabajadores");
}
