import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { PuestoForm } from "../puesto-form";

export default async function EditarPuestoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/puestos");

  const { id } = await params;
  const [puesto, servicios] = await Promise.all([
    prisma.puesto.findUnique({ where: { id }, include: { servicios: true } }),
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);
  if (!puesto) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Editar puesto</h1>
      <PuestoForm
        puesto={{ ...puesto, servicios: puesto.servicios.map((s) => ({ id: s.id, nombre: s.nombre })) }}
        servicios={servicios.map((s) => ({ id: s.id, nombre: s.nombre }))}
      />
    </div>
  );
}
