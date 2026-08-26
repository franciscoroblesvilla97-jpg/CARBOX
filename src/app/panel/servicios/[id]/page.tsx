import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { ServicioForm } from "../servicio-form";

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/servicios");

  const { id } = await params;
  const servicio = await prisma.servicio.findUnique({ where: { id } });
  if (!servicio) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Editar servicio</h1>
      <ServicioForm servicio={servicio} />
    </div>
  );
}
