"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { especificacionSchema } from "@/lib/validations/especificacion";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearEspecificacion(_prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = especificacionSchema.safeParse({
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    anioDesde: formData.get("anioDesde") || undefined,
    anioHasta: formData.get("anioHasta") || undefined,
    tipoAceite: formData.get("tipoAceite"),
    capacidadAceite: formData.get("capacidadAceite"),
    tipoFiltroAceite: formData.get("tipoFiltroAceite"),
    tipoFiltroAire: formData.get("tipoFiltroAire"),
    tipoNeumatico: formData.get("tipoNeumatico"),
    notas: formData.get("notas"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.especificacionVehiculo.create({
    data: {
      marca: parsed.data.marca,
      modelo: parsed.data.modelo,
      anioDesde: parsed.data.anioDesde ?? null,
      anioHasta: parsed.data.anioHasta ?? null,
      tipoAceite: parsed.data.tipoAceite || null,
      capacidadAceite: parsed.data.capacidadAceite || null,
      tipoFiltroAceite: parsed.data.tipoFiltroAceite || null,
      tipoFiltroAire: parsed.data.tipoFiltroAire || null,
      tipoNeumatico: parsed.data.tipoNeumatico || null,
      notas: parsed.data.notas || null,
    },
  });

  revalidatePath("/panel/especificaciones");
  redirect("/panel/especificaciones");
}

export async function actualizarEspecificacion(id: string, _prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = especificacionSchema.safeParse({
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    anioDesde: formData.get("anioDesde") || undefined,
    anioHasta: formData.get("anioHasta") || undefined,
    tipoAceite: formData.get("tipoAceite"),
    capacidadAceite: formData.get("capacidadAceite"),
    tipoFiltroAceite: formData.get("tipoFiltroAceite"),
    tipoFiltroAire: formData.get("tipoFiltroAire"),
    tipoNeumatico: formData.get("tipoNeumatico"),
    notas: formData.get("notas"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.especificacionVehiculo.update({
    where: { id },
    data: {
      marca: parsed.data.marca,
      modelo: parsed.data.modelo,
      anioDesde: parsed.data.anioDesde ?? null,
      anioHasta: parsed.data.anioHasta ?? null,
      tipoAceite: parsed.data.tipoAceite || null,
      capacidadAceite: parsed.data.capacidadAceite || null,
      tipoFiltroAceite: parsed.data.tipoFiltroAceite || null,
      tipoFiltroAire: parsed.data.tipoFiltroAire || null,
      tipoNeumatico: parsed.data.tipoNeumatico || null,
      notas: parsed.data.notas || null,
    },
  });

  revalidatePath("/panel/especificaciones");
  redirect("/panel/especificaciones");
}

export async function eliminarEspecificacion(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.especificacionVehiculo.delete({ where: { id } });
  revalidatePath("/panel/especificaciones");
  redirect("/panel/especificaciones");
}
