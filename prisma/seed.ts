import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const empleadoPasswordHash = await bcrypt.hash("empleado123", 10);

  await prisma.usuario.upsert({
    where: { email: "admin@carbox.cl" },
    update: {},
    create: {
      nombre: "Francisco (Admin)",
      email: "admin@carbox.cl",
      passwordHash: adminPasswordHash,
      rol: "ADMIN",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "empleado@carbox.cl" },
    update: {},
    create: {
      nombre: "Empleado Mesón",
      email: "empleado@carbox.cl",
      passwordHash: empleadoPasswordHash,
      rol: "EMPLEADO",
    },
  });

  const servicios = [
    { nombre: "Cambio de aceite", descripcion: "Cambio de aceite de motor y filtro de aceite", precioBase: 25000, duracionMinutos: 45 },
    { nombre: "Cambio de filtros", descripcion: "Filtro de aire, aceite y/o combustible", precioBase: 15000, duracionMinutos: 10 },
    { nombre: "Cambio de neumáticos (par)", descripcion: "Cambio/instalación de 2 neumáticos", precioBase: 10000, duracionMinutos: 30 },
    { nombre: "Cambio de neumáticos (completo)", descripcion: "Cambio/instalación de 4 neumáticos", precioBase: 15000, duracionMinutos: 45 },
    { nombre: "Balanceo", descripcion: "Balanceo de neumáticos", precioBase: 0, duracionMinutos: 10 },
    { nombre: "Alineación", descripcion: "Alineación de dirección", precioBase: 20000, duracionMinutos: 20 },
    { nombre: "Frenos", descripcion: "Revisión y mantención del sistema de frenos", precioBase: 30000, duracionMinutos: 15 },
  ];

  for (const servicio of servicios) {
    const existente = await prisma.servicio.findFirst({ where: { nombre: servicio.nombre } });
    if (!existente) {
      await prisma.servicio.create({ data: servicio });
    }
  }

  const productos = [
    { nombre: "Aceite 5W-30 (litro)", sku: "ACE-5W30", categoria: "ACEITES_LUBRICANTES" as const, unidad: "litro", precioVenta: 8000, costoUnitario: 5000, stockActual: 40, stockMinimo: 15 },
    { nombre: "Filtro de aceite", sku: "FIL-ACE", categoria: "FILTROS" as const, unidad: "unidad", precioVenta: 6000, costoUnitario: 3500, stockActual: 20, stockMinimo: 10 },
    { nombre: "Filtro de aire", sku: "FIL-AIR", categoria: "FILTROS" as const, unidad: "unidad", precioVenta: 7000, costoUnitario: 4000, stockActual: 8, stockMinimo: 10 },
    { nombre: "Pastillas de freno (juego)", sku: "PAST-FRE", categoria: "FRENOS" as const, unidad: "juego", precioVenta: 28000, costoUnitario: 18000, stockActual: 6, stockMinimo: 5 },
    { nombre: "Neumático 195/65 R15", sku: "NEU-195-65-15", categoria: "NEUMATICOS" as const, unidad: "unidad", precioVenta: 55000, costoUnitario: 40000, stockActual: 12, stockMinimo: 4 },
  ];

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { sku: producto.sku },
      update: {},
      create: producto,
    });
  }

  const todosLosServicios = await prisma.servicio.findMany();
  const serviciosSinAlineacion = todosLosServicios.filter((s) => s.nombre !== "Alineación");

  const puesto1 = await prisma.puesto.findFirst({ where: { nombre: "Puesto 1" } });
  if (!puesto1) {
    await prisma.puesto.create({
      data: {
        nombre: "Puesto 1",
        servicios: { connect: todosLosServicios.map((s) => ({ id: s.id })) },
      },
    });
  }

  const puesto2 = await prisma.puesto.findFirst({ where: { nombre: "Puesto 2" } });
  if (!puesto2) {
    await prisma.puesto.create({
      data: {
        nombre: "Puesto 2",
        servicios: { connect: serviciosSinAlineacion.map((s) => ({ id: s.id })) },
      },
    });
  }

  const trabajadores = ["Juan Contreras", "Pedro Muñoz"];
  for (const nombre of trabajadores) {
    const existente = await prisma.trabajador.findFirst({ where: { nombre } });
    if (!existente) {
      await prisma.trabajador.create({ data: { nombre } });
    }
  }

  console.log("Seed completado: 2 usuarios, 6 servicios, 5 productos, 2 puestos, 2 trabajadores.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
