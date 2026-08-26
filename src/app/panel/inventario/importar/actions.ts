"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { guardarFotoFactura, extraerLineasFactura, type LineaFacturaExtraida } from "@/lib/facturaOcr";
import { CATEGORIAS_PRODUCTO } from "@/lib/validations/inventario";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CategoriaProducto } from "@prisma/client";

type EstadoAnalisis =
  | { error: string }
  | { lineas: LineaFacturaExtraida[]; fotosUrl: string[] }
  | undefined;

export async function analizarFactura(_prevState: EstadoAnalisis, formData: FormData): Promise<EstadoAnalisis> {
  await requireRole(["ADMIN"]);

  const archivos = formData.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);
  if (archivos.length === 0) {
    return { error: "Selecciona al menos una foto de la guía o factura." };
  }

  try {
    const fotosUrl: string[] = [];
    const imagenesBase64: { base64: string; mediaType: string }[] = [];

    for (const archivo of archivos) {
      const bytes = Buffer.from(await archivo.arrayBuffer());
      const mediaType = archivo.type || "image/jpeg";
      fotosUrl.push(await guardarFotoFactura(bytes, mediaType));
      imagenesBase64.push({ base64: bytes.toString("base64"), mediaType });
    }

    const lineas = await extraerLineasFactura(imagenesBase64);
    if (lineas.length === 0) {
      return { error: "No se pudo leer ningún producto en la foto. Prueba con una imagen más nítida." };
    }

    return { lineas, fotosUrl };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error inesperado al leer la factura." };
  }
}

type LineaConfirmada = {
  productoId: string | null;
  nombre: string;
  sku: string | null;
  categoria: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
};

export async function confirmarImportacion(_prevState: string | undefined, formData: FormData) {
  const user = await requireRole(["ADMIN"]);

  const lineasRaw = formData.get("lineas");
  const fotosUrlRaw = formData.get("fotosUrl");
  if (typeof lineasRaw !== "string" || typeof fotosUrlRaw !== "string") {
    return "Datos inválidos";
  }

  let lineas: LineaConfirmada[];
  try {
    lineas = JSON.parse(lineasRaw);
  } catch {
    return "Datos inválidos";
  }

  if (!Array.isArray(lineas) || lineas.length === 0) {
    return "No hay líneas para importar";
  }

  const fotosUrl = fotosUrlRaw;

  await prisma.$transaction(async (tx) => {
    for (const linea of lineas) {
      if (linea.productoId) {
        await tx.movimientoInventario.create({
          data: {
            productoId: linea.productoId,
            tipo: "ENTRADA",
            cantidad: linea.cantidad,
            costoUnitario: linea.precioUnitario,
            motivo: "Importado desde foto de factura/guía",
            usuarioId: user.id,
            fotosUrl,
          },
        });
        await tx.producto.update({
          where: { id: linea.productoId },
          data: { stockActual: { increment: linea.cantidad }, costoUnitario: linea.precioUnitario },
        });
      } else {
        const categoria = CATEGORIAS_PRODUCTO.includes(linea.categoria as (typeof CATEGORIAS_PRODUCTO)[number])
          ? (linea.categoria as CategoriaProducto)
          : "OTRO";
        const nuevoProducto = await tx.producto.create({
          data: {
            nombre: linea.nombre,
            sku: linea.sku || null,
            categoria,
            unidad: linea.unidad || "unidad",
            precioVenta: 0,
            costoUnitario: linea.precioUnitario,
            stockActual: linea.cantidad,
            stockMinimo: 0,
          },
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: nuevoProducto.id,
            tipo: "ENTRADA",
            cantidad: linea.cantidad,
            costoUnitario: linea.precioUnitario,
            motivo: "Producto creado al importar foto de factura/guía",
            usuarioId: user.id,
            fotosUrl,
          },
        });
      }
    }
  });

  revalidatePath("/panel/inventario");
  redirect("/panel/inventario");
}
