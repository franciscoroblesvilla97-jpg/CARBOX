import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { TrabajadorForm } from "../trabajador-form";

export default async function EditarTrabajadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/trabajadores");

  const { id } = await params;
  const trabajador = await prisma.trabajador.findUnique({ where: { id } });
  if (!trabajador) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Editar trabajador</h1>
      <TrabajadorForm trabajador={trabajador} />
    </div>
  );
}
