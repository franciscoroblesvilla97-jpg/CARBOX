"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { usuarioSchema, usuarioNuevoSchema, usuarioPasswordSchema } from "@/lib/validations/usuario";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearUsuario(_prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = usuarioNuevoSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    rol: formData.get("rol"),
    activo: formData.get("activo"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  const existente = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  if (existente) {
    return "Ya existe un usuario con ese email";
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.usuario.create({
    data: {
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      rol: parsed.data.rol,
      activo: parsed.data.activo ?? true,
      passwordHash,
    },
  });

  revalidatePath("/panel/usuarios");
  redirect("/panel/usuarios");
}

export async function actualizarUsuario(id: string, _prevState: string | undefined, formData: FormData) {
  const actor = await requireRole(["ADMIN"]);

  const parsed = usuarioSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    rol: formData.get("rol"),
    activo: formData.get("activo"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  if (actor.id === id && parsed.data.rol !== "ADMIN") {
    return "No puedes quitarte tu propio rol de administrador";
  }
  if (actor.id === id && parsed.data.activo === false) {
    return "No puedes desactivar tu propia cuenta";
  }

  const existente = await prisma.usuario.findFirst({ where: { email: parsed.data.email, NOT: { id } } });
  if (existente) {
    return "Ya existe otro usuario con ese email";
  }

  await prisma.usuario.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      rol: parsed.data.rol,
      activo: parsed.data.activo ?? false,
    },
  });

  revalidatePath("/panel/usuarios");
  redirect("/panel/usuarios");
}

export async function cambiarPasswordUsuario(id: string, _prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = usuarioPasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.usuario.update({
    where: { id },
    data: { passwordHash },
  });

  revalidatePath(`/panel/usuarios/${id}`);
  return "Contraseña actualizada";
}
