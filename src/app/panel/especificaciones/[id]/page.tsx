import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { EspecificacionForm } from "../especificacion-form";

export default async function EditarEspecificacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/especificaciones");

  const { id } = await params;
  const especificacion = await prisma.especificacionVehiculo.findUnique({ where: { id } });
  if (!especificacion) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Editar ficha técnica</h1>
      <EspecificacionForm especificacion={especificacion} />
    </div>
  );
}
