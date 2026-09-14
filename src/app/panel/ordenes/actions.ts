"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoOrden } from "@prisma/client";
import { notificarOrdenCompletada } from "@/lib/notificaciones";

export async function crearOrdenTrabajo(_prevState: string | undefined, formData: FormData) {
  const user = await requireSession();

  const vehiculoId = formData.get("vehiculoId");
  const observaciones = formData.get("observaciones");
  const trabajadorId = formData.get("trabajadorId");
  const puestoId = formData.get("puestoId");
  const fechaProgramadaRaw = formData.get("fechaProgramada");

  if (typeof vehiculoId !== "string" || !vehiculoId) {
    return "Selecciona un vehículo";
  }

  const fechaProgramada =
    typeof fechaProgramadaRaw === "string" && fechaProgramadaRaw ? new Date(fechaProgramadaRaw) : new Date();
  if (Number.isNaN(fechaProgramada.getTime())) {
    return "Fecha y hora programada inválida";
  }

  const servicioIds = formData.getAll("servicioId");
  const servicioCantidades = formData.getAll("servicioCantidad");
  const productoIds = formData.getAll("productoId");
  const productoCantidades = formData.getAll("productoCantidad");

  const lineasServicio: { servicioId: string; cantidad: number }[] = [];
  for (let i = 0; i < servicioIds.length; i++) {
    const cantidad = Number(servicioCantidades[i]);
    if (cantidad > 0) {
      lineasServicio.push({ servicioId: String(servicioIds[i]), cantidad });
    }
  }

  const lineasProducto: { productoId: string; cantidad: number }[] = [];
  for (let i = 0; i < productoIds.length; i++) {
    const cantidad = Number(productoCantidades[i]);
    if (cantidad > 0) {
      lineasProducto.push({ productoId: String(productoIds[i]), cantidad });
    }
  }

  if (lineasServicio.length === 0 && lineasProducto.length === 0) {
    return "Agrega al menos un servicio o producto a la orden";
  }

  const servicios = await prisma.servicio.findMany({
    where: { id: { in: lineasServicio.map((l) => l.servicioId) } },
  });
  const productos = await prisma.producto.findMany({
    where: { id: { in: lineasProducto.map((l) => l.productoId) } },
  });

  const orden = await prisma.$transaction(async (tx) => {
    const { _max: maxOrden } = await tx.ordenTrabajo.aggregate({ _max: { numero: true } });
    const numero = (maxOrden.numero ?? 0) + 1;

    const nuevaOrden = await tx.ordenTrabajo.create({
      data: {
        numero,
        vehiculoId,
        fechaProgramada,
        creadoPorId: user.id,
        trabajadorId: typeof trabajadorId === "string" && trabajadorId ? trabajadorId : null,
        puestoId: typeof puestoId === "string" && puestoId ? puestoId : null,
        observaciones: typeof observaciones === "string" && observaciones ? observaciones : null,
        servicios: {
          create: lineasServicio.map((linea) => {
            const servicio = servicios.find((s) => s.id === linea.servicioId)!;
            return {
              servicioId: linea.servicioId,
              cantidad: linea.cantidad,
              precioCobrado: servicio.precioBase,
            };
          }),
        },
        productos: {
          create: lineasProducto.map((linea) => {
            const producto = productos.find((p) => p.id === linea.productoId)!;
            return {
              productoId: linea.productoId,
              cantidad: linea.cantidad,
              precioUnitario: producto.precioVenta,
              costoUnitario: producto.costoUnitario,
            };
          }),
        },
      },
    });

    for (const linea of lineasProducto) {
      await tx.movimientoInventario.create({
        data: {
          productoId: linea.productoId,
          tipo: "SALIDA",
          cantidad: linea.cantidad,
          motivo: `Uso en OT #${numero}`,
          usuarioId: user.id,
        },
      });
      await tx.producto.update({
        where: { id: linea.productoId },
        data: { stockActual: { decrement: linea.cantidad } },
      });
    }

    return nuevaOrden;
  });

  revalidatePath("/panel/ordenes");
  revalidatePath(`/panel/vehiculos/${vehiculoId}`);
  redirect(`/panel/ordenes/${orden.id}`);
}

async function requireOrdenEditable(id: string) {
  const orden = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id } });
  if (orden.estado === "COMPLETADA" || orden.estado === "CANCELADA") {
    throw new Error("No se pueden agregar líneas a una orden completada o cancelada");
  }
  return orden;
}

export async function agregarServicioAOrden(ordenId: string, _prevState: string | undefined, formData: FormData) {
  await requireSession();
  await requireOrdenEditable(ordenId);

  const modo = formData.get("modo");
  const cantidad = Number(formData.get("cantidad")) || 1;

  if (modo === "catalogo") {
    const servicioId = formData.get("servicioId");
    if (typeof servicioId !== "string" || !servicioId) {
      return "Selecciona un servicio del catálogo";
    }
    const servicio = await prisma.servicio.findUniqueOrThrow({ where: { id: servicioId } });
    await prisma.ordenTrabajoServicio.create({
      data: { ordenTrabajoId: ordenId, servicioId, cantidad, precioCobrado: servicio.precioBase },
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
    await prisma.ordenTrabajoServicio.create({
      data: { ordenTrabajoId: ordenId, nombrePersonalizado: nombre.trim(), cantidad, precioCobrado: precio },
    });
  }

  revalidatePath(`/panel/ordenes/${ordenId}`);
  return undefined;
}

export async function agregarMaterialAOrden(ordenId: string, _prevState: string | undefined, formData: FormData) {
  const user = await requireSession();
  await requireOrdenEditable(ordenId);

  const modo = formData.get("modo");
  const cantidad = Number(formData.get("cantidad")) || 1;

  if (modo === "inventario") {
    const productoId = formData.get("productoId");
    if (typeof productoId !== "string" || !productoId) {
      return "Selecciona un producto del inventario";
    }
    const producto = await prisma.producto.findUniqueOrThrow({ where: { id: productoId } });

    await prisma.$transaction(async (tx) => {
      await tx.ordenTrabajoProducto.create({
        data: {
          ordenTrabajoId: ordenId,
          productoId,
          cantidad,
          precioUnitario: producto.precioVenta,
          costoUnitario: producto.costoUnitario,
        },
      });
      await tx.movimientoInventario.create({
        data: {
          productoId,
          tipo: "SALIDA",
          cantidad,
          motivo: `Uso en OT (agregado después)`,
          usuarioId: user.id,
        },
      });
      await tx.producto.update({
        where: { id: productoId },
        data: { stockActual: { decrement: cantidad } },
      });
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
    await prisma.ordenTrabajoProducto.create({
      data: {
        ordenTrabajoId: ordenId,
        nombrePersonalizado: nombre.trim(),
        cantidad,
        precioUnitario: precio,
        costoUnitario: costo,
      },
    });
  }

  revalidatePath(`/panel/ordenes/${ordenId}`);
  return undefined;
}

export async function reasignarOrden(id: string, _prevState: string | undefined, formData: FormData) {
  await requireSession();

  const trabajadorId = formData.get("trabajadorId");
  const puestoId = formData.get("puestoId");

  await prisma.ordenTrabajo.update({
    where: { id },
    data: {
      trabajadorId: typeof trabajadorId === "string" && trabajadorId ? trabajadorId : null,
      puestoId: typeof puestoId === "string" && puestoId ? puestoId : null,
    },
  });

  revalidatePath(`/panel/ordenes/${id}`);
  revalidatePath("/panel/ordenes");
  return undefined;
}

export async function actualizarEstadoOrden(id: string, estado: EstadoOrden) {
  await requireSession();

  const orden = await prisma.ordenTrabajo.update({
    where: { id },
    data: {
      estado,
      fechaCierre: estado === "COMPLETADA" || estado === "CANCELADA" ? new Date() : null,
    },
    include: { vehiculo: { include: { cliente: true } } },
  });

  if (estado === "COMPLETADA") {
    await notificarOrdenCompletada({
      id: orden.id,
      numero: orden.numero,
      clienteNombre: orden.vehiculo.cliente.nombre,
      telefono: orden.vehiculo.cliente.telefono,
      email: orden.vehiculo.cliente.email,
    });
  }

  revalidatePath(`/panel/ordenes/${id}`);
  revalidatePath("/panel/ordenes");
  revalidatePath(`/panel/vehiculos/${orden.vehiculoId}`);
}

export async function eliminarOrden(id: string) {
  await requireRole(["ADMIN"]);

  const orden = await prisma.ordenTrabajo.delete({ where: { id } });

  revalidatePath("/panel/ordenes");
  revalidatePath(`/panel/vehiculos/${orden.vehiculoId}`);
  redirect("/panel/ordenes");
}
