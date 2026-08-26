"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireRole } from "@/lib/permissions";
import { cotizacionCabeceraSchema } from "@/lib/validations/cotizacion";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notificarCotizacionLista } from "@/lib/notificaciones";

export async function crearCotizacion(_prevState: string | undefined, formData: FormData) {
  const user = await requireSession();

  const parsed = cotizacionCabeceraSchema.safeParse({
    nombreCliente: formData.get("nombreCliente"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    patente: formData.get("patente"),
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    anio: formData.get("anio") || undefined,
    observaciones: formData.get("observaciones"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Datos inválidos";
  }

  const servicioIds = formData.getAll("servicioId");
  const servicioCantidades = formData.getAll("servicioCantidad");
  const servicioNombresPersonalizados = formData.getAll("servicioNombrePersonalizado");
  const servicioPreciosPersonalizados = formData.getAll("servicioPrecioPersonalizado");
  const servicioCantidadesPersonalizadas = formData.getAll("servicioCantidadPersonalizada");

  const productoIds = formData.getAll("productoId");
  const productoCantidades = formData.getAll("productoCantidad");
  const materialNombresPersonalizados = formData.getAll("materialNombrePersonalizado");
  const materialCostosPersonalizados = formData.getAll("materialCostoPersonalizado");
  const materialPreciosPersonalizados = formData.getAll("materialPrecioPersonalizado");
  const materialCantidadesPersonalizadas = formData.getAll("materialCantidadPersonalizada");

  const lineasServicio: { servicioId: string; cantidad: number }[] = [];
  for (let i = 0; i < servicioIds.length; i++) {
    const cantidad = Number(servicioCantidades[i]);
    if (cantidad > 0) lineasServicio.push({ servicioId: String(servicioIds[i]), cantidad });
  }

  const lineasServicioPersonalizadas: { nombre: string; precio: number; cantidad: number }[] = [];
  for (let i = 0; i < servicioNombresPersonalizados.length; i++) {
    const nombre = String(servicioNombresPersonalizados[i]).trim();
    const precio = Number(servicioPreciosPersonalizados[i]);
    const cantidad = Number(servicioCantidadesPersonalizadas[i]) || 1;
    if (nombre && Number.isFinite(precio) && precio >= 0) {
      lineasServicioPersonalizadas.push({ nombre, precio, cantidad });
    }
  }

  const lineasProducto: { productoId: string; cantidad: number }[] = [];
  for (let i = 0; i < productoIds.length; i++) {
    const cantidad = Number(productoCantidades[i]);
    if (cantidad > 0) lineasProducto.push({ productoId: String(productoIds[i]), cantidad });
  }

  const lineasMaterialPersonalizadas: { nombre: string; costo: number; precio: number; cantidad: number }[] = [];
  for (let i = 0; i < materialNombresPersonalizados.length; i++) {
    const nombre = String(materialNombresPersonalizados[i]).trim();
    const costo = Number(materialCostosPersonalizados[i]) || 0;
    const precio = Number(materialPreciosPersonalizados[i]);
    const cantidad = Number(materialCantidadesPersonalizadas[i]) || 1;
    if (nombre && Number.isFinite(precio) && precio >= 0) {
      lineasMaterialPersonalizadas.push({ nombre, costo, precio, cantidad });
    }
  }

  if (
    lineasServicio.length === 0 &&
    lineasServicioPersonalizadas.length === 0 &&
    lineasProducto.length === 0 &&
    lineasMaterialPersonalizadas.length === 0
  ) {
    return "Agrega al menos un servicio o material a la cotización";
  }

  const servicios = await prisma.servicio.findMany({ where: { id: { in: lineasServicio.map((l) => l.servicioId) } } });
  const productos = await prisma.producto.findMany({ where: { id: { in: lineasProducto.map((l) => l.productoId) } } });

  const numero = (await prisma.cotizacion.count()) + 1;

  const cotizacion = await prisma.cotizacion.create({
    data: {
      numero,
      nombreCliente: parsed.data.nombreCliente,
      telefono: parsed.data.telefono || null,
      email: parsed.data.email || null,
      patente: parsed.data.patente ? parsed.data.patente.toUpperCase() : null,
      marca: parsed.data.marca || null,
      modelo: parsed.data.modelo || null,
      anio: parsed.data.anio ?? null,
      observaciones: parsed.data.observaciones || null,
      creadoPorId: user.id,
      servicios: {
        create: [
          ...lineasServicio.map((linea) => {
            const servicio = servicios.find((s) => s.id === linea.servicioId)!;
            return { servicioId: linea.servicioId, cantidad: linea.cantidad, precioCobrado: servicio.precioBase };
          }),
          ...lineasServicioPersonalizadas.map((linea) => ({
            nombrePersonalizado: linea.nombre,
            cantidad: linea.cantidad,
            precioCobrado: linea.precio,
          })),
        ],
      },
      productos: {
        create: [
          ...lineasProducto.map((linea) => {
            const producto = productos.find((p) => p.id === linea.productoId)!;
            return {
              productoId: linea.productoId,
              cantidad: linea.cantidad,
              precioUnitario: producto.precioVenta,
              costoUnitario: producto.costoUnitario,
            };
          }),
          ...lineasMaterialPersonalizadas.map((linea) => ({
            nombrePersonalizado: linea.nombre,
            cantidad: linea.cantidad,
            precioUnitario: linea.precio,
            costoUnitario: linea.costo,
          })),
        ],
      },
    },
  });

  await notificarCotizacionLista({
    id: cotizacion.id,
    numero: cotizacion.numero,
    nombreCliente: cotizacion.nombreCliente,
    telefono: cotizacion.telefono,
    email: cotizacion.email,
  });

  revalidatePath("/panel/cotizaciones");
  redirect(`/panel/cotizaciones/${cotizacion.id}`);
}

async function requireCotizacionEditable(id: string) {
  const cotizacion = await prisma.cotizacion.findUniqueOrThrow({ where: { id } });
  if (cotizacion.estado !== "PENDIENTE") {
    throw new Error("No se pueden agregar líneas a una cotización aprobada o rechazada");
  }
  return cotizacion;
}

export async function agregarServicioACotizacion(cotizacionId: string, _prevState: string | undefined, formData: FormData) {
  await requireSession();
  await requireCotizacionEditable(cotizacionId);

  const modo = formData.get("modo");
  const cantidad = Number(formData.get("cantidad")) || 1;

  if (modo === "catalogo") {
    const servicioId = formData.get("servicioId");
    if (typeof servicioId !== "string" || !servicioId) {
      return "Selecciona un servicio del catálogo";
    }
    const servicio = await prisma.servicio.findUniqueOrThrow({ where: { id: servicioId } });
    await prisma.cotizacionServicio.create({
      data: { cotizacionId, servicioId, cantidad, precioCobrado: servicio.precioBase },
    });
  } else {
    const nombre = formData.get("nombrePersonalizado");
    const precio = Number(formData.get("precioCobrado"));
    if (typeof nombre !== "string" || !nombre.trim()) {
      return "Escribe el nombre del servicio";
    }
    if (!Number.isFinite(precio) || precio < 0) {
      return "Precio inválido";
    }
    await prisma.cotizacionServicio.create({
      data: { cotizacionId, nombrePersonalizado: nombre.trim(), cantidad, precioCobrado: precio },
    });
  }

  revalidatePath(`/panel/cotizaciones/${cotizacionId}`);
  return undefined;
}

export async function agregarMaterialACotizacion(cotizacionId: string, _prevState: string | undefined, formData: FormData) {
  await requireSession();
  await requireCotizacionEditable(cotizacionId);

  const modo = formData.get("modo");
  const cantidad = Number(formData.get("cantidad")) || 1;

  if (modo === "inventario") {
    const productoId = formData.get("productoId");
    if (typeof productoId !== "string" || !productoId) {
      return "Selecciona un producto del inventario";
    }
    const producto = await prisma.producto.findUniqueOrThrow({ where: { id: productoId } });
    await prisma.cotizacionProducto.create({
      data: {
        cotizacionId,
        productoId,
        cantidad,
        precioUnitario: producto.precioVenta,
        costoUnitario: producto.costoUnitario,
      },
    });
  } else {
    const nombre = formData.get("nombrePersonalizado");
    const costo = Number(formData.get("costoUnitario")) || 0;
    const precio = Number(formData.get("precioUnitario"));
    if (typeof nombre !== "string" || !nombre.trim()) {
      return "Escribe el nombre del material";
    }
    if (!Number.isFinite(precio) || precio < 0) {
      return "Precio inválido";
    }
    await prisma.cotizacionProducto.create({
      data: {
        cotizacionId,
        nombrePersonalizado: nombre.trim(),
        cantidad,
        precioUnitario: precio,
        costoUnitario: costo,
      },
    });
  }

  revalidatePath(`/panel/cotizaciones/${cotizacionId}`);
  return undefined;
}

export async function aprobarCotizacion(id: string) {
  await requireSession();
  await prisma.cotizacion.update({ where: { id }, data: { estado: "APROBADA" } });
  revalidatePath("/panel/cotizaciones");
  revalidatePath(`/panel/cotizaciones/${id}`);
}

export async function rechazarCotizacion(id: string) {
  await requireSession();
  await prisma.cotizacion.update({ where: { id }, data: { estado: "RECHAZADA" } });
  revalidatePath("/panel/cotizaciones");
  revalidatePath(`/panel/cotizaciones/${id}`);
}

export async function eliminarCotizacion(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.cotizacion.delete({ where: { id } });
  revalidatePath("/panel/cotizaciones");
  redirect("/panel/cotizaciones");
}

export async function convertirCotizacionEnOrden(id: string, _prevState: string | undefined, formData: FormData) {
  const user = await requireSession();

  const cotizacion = await prisma.cotizacion.findUniqueOrThrow({
    where: { id },
    include: { servicios: true, productos: true },
  });

  if (cotizacion.estado !== "APROBADA") {
    return "La cotización debe estar aprobada antes de convertirla en orden";
  }

  let vehiculoId = cotizacion.vehiculoId;

  if (!vehiculoId) {
    const patenteInput = formData.get("patente");
    const patente = typeof patenteInput === "string" ? patenteInput.trim().toUpperCase() : cotizacion.patente;
    if (!patente) {
      return "Ingresa la patente del vehículo para generar la orden";
    }

    let vehiculo = await prisma.vehiculo.findUnique({ where: { patente } });
    if (!vehiculo) {
      const cliente = await prisma.cliente.create({
        data: { nombre: cotizacion.nombreCliente, telefono: cotizacion.telefono ?? "" },
      });
      vehiculo = await prisma.vehiculo.create({
        data: {
          patente,
          marca: cotizacion.marca,
          modelo: cotizacion.modelo,
          anio: cotizacion.anio,
          clienteId: cliente.id,
        },
      });
    }
    vehiculoId = vehiculo.id;
  }

  const vehiculoIdFinal = vehiculoId;

  const orden = await prisma.$transaction(async (tx) => {
    const numero = (await tx.ordenTrabajo.count()) + 1;

    const nuevaOrden = await tx.ordenTrabajo.create({
      data: {
        numero,
        vehiculoId: vehiculoIdFinal,
        creadoPorId: user.id,
        cotizacionOrigenId: cotizacion.id,
        observaciones: cotizacion.observaciones,
        servicios: {
          create: cotizacion.servicios.map((s) => ({
            servicioId: s.servicioId,
            nombrePersonalizado: s.nombrePersonalizado,
            cantidad: s.cantidad,
            precioCobrado: s.precioCobrado,
          })),
        },
        productos: {
          create: cotizacion.productos.map((p) => ({
            productoId: p.productoId,
            nombrePersonalizado: p.nombrePersonalizado,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario,
            costoUnitario: p.costoUnitario,
          })),
        },
      },
    });

    for (const p of cotizacion.productos) {
      if (!p.productoId) continue; // los materiales externos no controlan stock
      await tx.movimientoInventario.create({
        data: {
          productoId: p.productoId,
          tipo: "SALIDA",
          cantidad: p.cantidad,
          motivo: `Uso en OT #${numero} (desde cotización #${cotizacion.numero})`,
          usuarioId: user.id,
        },
      });
      await tx.producto.update({
        where: { id: p.productoId },
        data: { stockActual: { decrement: p.cantidad } },
      });
    }

    return nuevaOrden;
  });

  revalidatePath("/panel/cotizaciones");
  revalidatePath("/panel/ordenes");
  redirect(`/panel/ordenes/${orden.id}`);
}
