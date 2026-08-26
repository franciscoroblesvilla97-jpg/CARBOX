import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrdenForm } from "./orden-form";

export default async function NuevaOrdenPage() {
  const [vehiculos, servicios, productos, trabajadores, puestos] = await Promise.all([
    prisma.vehiculo.findMany({ include: { cliente: true }, orderBy: { patente: "asc" } }),
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ orderBy: { nombre: "asc" } }),
    prisma.trabajador.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.puesto.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: { servicios: { select: { id: true } } },
    }),
  ]);

  const puestosConServicioIds = puestos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    servicioIds: p.servicios.map((s) => s.id),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Nueva orden de trabajo</h1>
      <p className="text-sm text-slate-500 mb-6">
        ¿El vehículo no existe todavía?{" "}
        <Link href="/panel/clientes/nuevo" className="text-green-700 hover:underline">
          Crea el cliente y su vehículo primero
        </Link>
        .
      </p>
      <OrdenForm
        vehiculos={vehiculos}
        servicios={servicios}
        productos={productos}
        trabajadores={trabajadores}
        puestos={puestosConServicioIds}
      />
    </div>
  );
}
