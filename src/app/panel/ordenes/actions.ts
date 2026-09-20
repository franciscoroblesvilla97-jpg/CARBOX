"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoOrden } from "@prisma/client";
import { notificarOrdenCompletada } from "@/lib/notificaciones";
import { checklistOrdenSchema, zonaDesdeCoordenadas } from "@/lib/validations/checklist";
import { put, del } from "@vercel/blob";

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

/** Un TECNICO solo puede actuar sobre las órdenes que tiene asignadas. */
async function requireAccesoOrden(ordenId: string) {
  const user = await requireSession();
  if (user.rol === "TECNICO") {
    const orden = await prisma.ordenTrabajo.findUniqueOrThrow({ where: { id: ordenId } });
    if (orden.trabajadorId !== user.trabajadorId) {
      throw new Error("No autorizado");
    }
  }
  return user;
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
  const user = await requireAccesoOrden(ordenId);
  await requireOrdenEditable(ordenId);

  const modo = formData.get("modo");
  const cantidad = Number(formData.get("cantidad")) || 1;

  if (modo === "pendiente") {
    const nombre = formData.get("nombrePersonalizado");
    if (typeof nombre !== "string" || !nombre.trim()) {
      return "Escribe el nombre del repuesto";
    }
    await prisma.ordenTrabajoProducto.create({
      data: {
        ordenTrabajoId: ordenId,
        nombrePersonalizado: nombre.trim(),
        cantidad,
        precioUnitario: 0,
        costoUnitario: 0,
        pendienteRevision: true,
      },
    });
  } else if (modo === "inventario") {
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
  await requireAccesoOrden(id);

  const orden = await prisma.ordenTrabajo.update({
    where: { id },
    data: {
      estado,
      fechaCierre: estado === "COMPLETADA" || estado === "CANCELADA" ? new Date() : null,
    },
    include: {
      vehiculo: { include: { cliente: true } },
      servicios: { include: { servicio: true } },
      productos: { include: { producto: true } },
    },
  });

  if (estado === "COMPLETADA") {
    const items = [
      ...orden.servicios.map((l) => ({
        nombre: l.servicio?.nombre ?? l.nombrePersonalizado ?? "Servicio",
        cantidad: l.cantidad,
        precio: Number(l.precioCobrado),
      })),
      ...orden.productos.map((l) => ({
        nombre: l.producto?.nombre ?? l.nombrePersonalizado ?? "Repuesto",
        cantidad: l.cantidad,
        precio: Number(l.precioUnitario),
      })),
    ];
    const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

    await notificarOrdenCompletada({
      id: orden.id,
      numero: orden.numero,
      clienteNombre: orden.vehiculo.cliente.nombre,
      telefono: orden.vehiculo.cliente.telefono,
      email: orden.vehiculo.cliente.email,
      items,
      total,
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

export async function guardarChecklist(ordenId: string, _prevState: string | undefined, formData: FormData) {
  const user = await requireAccesoOrden(ordenId);

  const payload = formData.get("payload");
  if (typeof payload !== "string") return "Datos inválidos";

  let json: unknown;
  try {
    json = JSON.parse(payload);
  } catch {
    return "Datos inválidos";
  }

  const parsed = checklistOrdenSchema.safeParse(json);
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Datos inválidos";
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    const checklist = await tx.checklistOrden.upsert({
      where: { ordenTrabajoId: ordenId },
      create: {
        ordenTrabajoId: ordenId,
        kilometraje: data.kilometraje ?? null,
        observaciones: data.observaciones || null,
        completadoPorId: user.rol === "TECNICO" ? user.trabajadorId : null,
        completadoEn: new Date(),
      },
      update: {
        kilometraje: data.kilometraje ?? null,
        observaciones: data.observaciones || null,
        completadoPorId: user.rol === "TECNICO" ? user.trabajadorId : null,
        completadoEn: new Date(),
      },
    });

    await tx.checklistItem.deleteMany({ where: { checklistOrdenId: checklist.id } });
    await tx.presionNeumatico.deleteMany({ where: { checklistOrdenId: checklist.id } });
    await tx.marcaCarroceria.deleteMany({ where: { checklistOrdenId: checklist.id } });

    await tx.checklistItem.createMany({
      data: data.items.map((i) => ({ ...i, checklistOrdenId: checklist.id })),
    });
    await tx.presionNeumatico.createMany({
      data: data.presiones.map((p) => ({ ...p, checklistOrdenId: checklist.id })),
    });
    if (data.danos.length > 0) {
      await tx.marcaCarroceria.createMany({
        data: data.danos.map((d) => ({
          tipo: d.tipo,
          x: d.x,
          y: d.y,
          zona: zonaDesdeCoordenadas(d.x, d.y),
          nota: d.nota || null,
          checklistOrdenId: checklist.id,
        })),
      });
    }
  });

  revalidatePath(`/panel/ordenes/${ordenId}`);
  revalidatePath(`/panel/ordenes/${ordenId}/informe`);
  return "Checklist guardado";
}

const TIPOS_ARCHIVO_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const TAMANO_MAXIMO_ARCHIVO = 10 * 1024 * 1024; // 10 MB

export async function subirArchivoOrden(ordenId: string, _prevState: string | undefined, formData: FormData) {
  const user = await requireAccesoOrden(ordenId);

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return "Selecciona un archivo";
  }
  if (!TIPOS_ARCHIVO_PERMITIDOS.includes(archivo.type)) {
    return "Solo se aceptan PDF o imágenes (jpg, png, webp)";
  }
  if (archivo.size > TAMANO_MAXIMO_ARCHIVO) {
    return "El archivo no puede superar los 10 MB";
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return "Almacenamiento de archivos no configurado. Avísale al administrador.";
  }

  const blob = await put(`ordenes/${ordenId}/${archivo.name}`, archivo, {
    access: "public",
    addRandomSuffix: true,
  });

  await prisma.archivoOrden.create({
    data: {
      ordenTrabajoId: ordenId,
      nombre: archivo.name,
      url: blob.url,
      tipo: archivo.type,
      subidoPorId: user.rol === "TECNICO" ? user.trabajadorId : null,
    },
  });

  revalidatePath(`/panel/ordenes/${ordenId}`);
  revalidatePath(`/panel/ordenes/${ordenId}/informe`);
  return undefined;
}

export async function fijarPrecioMaterialPendiente(
  ordenId: string,
  lineaId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  await requireRole(["ADMIN", "EMPLEADO"]);

  const productoId = formData.get("productoId");
  const costo = Number(formData.get("costoUnitario")) || 0;
  const precio = Number(formData.get("precioUnitario"));

  if (!Number.isFinite(precio) || precio < 0) {
    return "Precio inválido";
  }

  await prisma.ordenTrabajoProducto.update({
    where: { id: lineaId },
    data: {
      productoId: typeof productoId === "string" && productoId ? productoId : null,
      costoUnitario: costo,
      precioUnitario: precio,
      pendienteRevision: false,
    },
  });

  revalidatePath(`/panel/ordenes/${ordenId}`);
  revalidatePath(`/panel/ordenes/${ordenId}/informe`);
  return undefined;
}

export async function eliminarArchivoOrden(id: string) {
  const archivo = await prisma.archivoOrden.findUniqueOrThrow({ where: { id } });
  await requireAccesoOrden(archivo.ordenTrabajoId);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await del(archivo.url).catch(() => {});
  }
  await prisma.archivoOrden.delete({ where: { id } });

  revalidatePath(`/panel/ordenes/${archivo.ordenTrabajoId}`);
  revalidatePath(`/panel/ordenes/${archivo.ordenTrabajoId}/informe`);
}
