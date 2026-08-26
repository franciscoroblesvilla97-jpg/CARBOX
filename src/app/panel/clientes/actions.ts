"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { clienteSchema, vehiculoSchema } from "@/lib/validations/cliente";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearCliente(_prevState: string | undefined, formData: FormData) {
  await requireSession();

  const parsed = clienteSchema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    rut: formData.get("rut"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  const cliente = await prisma.cliente.create({
    data: {
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email || null,
      rut: parsed.data.rut || null,
    },
  });

  revalidatePath("/panel/clientes");
  redirect(`/panel/clientes/${cliente.id}`);
}

export async function actualizarCliente(id: string, _prevState: string | undefined, formData: FormData) {
  await requireSession();

  const parsed = clienteSchema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    rut: formData.get("rut"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.cliente.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email || null,
      rut: parsed.data.rut || null,
    },
  });

  revalidatePath(`/panel/clientes/${id}`);
  return undefined;
}

export async function crearVehiculo(clienteId: string, _prevState: string | undefined, formData: FormData) {
  await requireSession();

  const parsed = vehiculoSchema.safeParse({
    patente: formData.get("patente"),
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    anio: formData.get("anio") || undefined,
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.vehiculo.create({
    data: {
      patente: parsed.data.patente,
      marca: parsed.data.marca || null,
      modelo: parsed.data.modelo || null,
      anio: parsed.data.anio ?? null,
      clienteId,
    },
  });

  revalidatePath(`/panel/clientes/${clienteId}`);
  return undefined;
}

export async function actualizarVehiculo(id: string, _prevState: string | undefined, formData: FormData) {
  await requireSession();

  const parsed = vehiculoSchema.safeParse({
    patente: formData.get("patente"),
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    anio: formData.get("anio") || undefined,
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  const vehiculo = await prisma.vehiculo.update({
    where: { id },
    data: {
      patente: parsed.data.patente,
      marca: parsed.data.marca || null,
      modelo: parsed.data.modelo || null,
      anio: parsed.data.anio ?? null,
    },
  });

  revalidatePath(`/panel/vehiculos/${id}`);
  revalidatePath(`/panel/clientes/${vehiculo.clienteId}`);
  return undefined;
}
