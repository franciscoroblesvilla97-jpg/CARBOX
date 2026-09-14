"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/permissions";
import { productoSchema, movimientoSchema } from "@/lib/validations/inventario";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearProducto(_prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = productoSchema.safeParse({
    nombre: formData.get("nombre"),
    sku: formData.get("sku"),
    categoria: formData.get("categoria"),
    unidad: formData.get("unidad"),
    precioVenta: formData.get("precioVenta"),
    costoUnitario: formData.get("costoUnitario"),
    stockActual: formData.get("stockActual"),
    stockMinimo: formData.get("stockMinimo"),
    marca: formData.get("marca"),
    medida: formData.get("medida"),
    indice: formData.get("indice"),
    imagenUrl: formData.get("imagenUrl"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  const producto = await prisma.producto.create({
    data: {
      nombre: parsed.data.nombre,
      sku: parsed.data.sku || null,
      categoria: parsed.data.categoria,
      unidad: parsed.data.unidad,
      precioVenta: parsed.data.precioVenta,
      costoUnitario: parsed.data.costoUnitario,
      stockActual: parsed.data.stockActual,
      stockMinimo: parsed.data.stockMinimo,
      marca: parsed.data.marca || null,
      medida: parsed.data.medida || null,
      indice: parsed.data.indice || null,
      imagenUrl: parsed.data.imagenUrl || null,
    },
  });

  revalidatePath("/panel/inventario");
  redirect(`/panel/inventario/${producto.id}`);
}

export async function actualizarProducto(id: string, _prevState: string | undefined, formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = productoSchema.safeParse({
    nombre: formData.get("nombre"),
    sku: formData.get("sku"),
    categoria: formData.get("categoria"),
    unidad: formData.get("unidad"),
    precioVenta: formData.get("precioVenta"),
    costoUnitario: formData.get("costoUnitario"),
    stockActual: formData.get("stockActual"),
    stockMinimo: formData.get("stockMinimo"),
    marca: formData.get("marca"),
    medida: formData.get("medida"),
    indice: formData.get("indice"),
    imagenUrl: formData.get("imagenUrl"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  await prisma.producto.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      sku: parsed.data.sku || null,
      categoria: parsed.data.categoria,
      unidad: parsed.data.unidad,
      precioVenta: parsed.data.precioVenta,
      costoUnitario: parsed.data.costoUnitario,
      stockActual: parsed.data.stockActual,
      stockMinimo: parsed.data.stockMinimo,
      marca: parsed.data.marca || null,
      medida: parsed.data.medida || null,
      indice: parsed.data.indice || null,
      imagenUrl: parsed.data.imagenUrl || null,
    },
  });

  revalidatePath(`/panel/inventario/${id}`);
  revalidatePath("/panel/inventario");
  return undefined;
}

export async function registrarMovimiento(productoId: string, _prevState: string | undefined, formData: FormData) {
  const user = await requireSession();

  const parsed = movimientoSchema.safeParse({
    tipo: formData.get("tipo"),
    cantidad: formData.get("cantidad"),
    costoUnitario: formData.get("costoUnitario") || undefined,
    motivo: formData.get("motivo"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  const { tipo, cantidad, motivo, costoUnitario } = parsed.data;
  const delta = tipo === "SALIDA" ? -cantidad : cantidad;

  await prisma.$transaction(async (tx) => {
    await tx.movimientoInventario.create({
      data: {
        productoId,
        tipo,
        cantidad,
        costoUnitario: costoUnitario ?? null,
        motivo: motivo || null,
        usuarioId: user.id,
      },
    });
    await tx.producto.update({
      where: { id: productoId },
      data: {
        stockActual: { increment: delta },
        // Al comprar stock con un costo distinto, se actualiza el costo unitario vigente del producto.
        ...(tipo === "ENTRADA" && costoUnitario !== undefined ? { costoUnitario } : {}),
      },
    });
  });

  revalidatePath(`/panel/inventario/${productoId}`);
  revalidatePath("/panel/inventario");
  return undefined;
}
