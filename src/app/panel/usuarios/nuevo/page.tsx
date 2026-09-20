import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { UsuarioForm } from "../usuario-form";

export default async function NuevoUsuarioPage() {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/dashboard");

  const trabajadores = await prisma.trabajador.findMany({
    where: { activo: true, usuario: null },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Nuevo usuario</h1>
      <UsuarioForm trabajadores={trabajadores} />
    </div>
  );
}
