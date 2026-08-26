import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { PuestoForm } from "../puesto-form";

export default async function NuevoPuestoPage() {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/puestos");

  const servicios = await prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nuevo puesto</h1>
      <PuestoForm servicios={servicios} />
    </div>
  );
}
