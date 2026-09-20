import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { UsuarioForm } from "../usuario-form";
import { PasswordForm } from "../password-form";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/dashboard");

  const { id } = await params;
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) notFound();

  const trabajadores = await prisma.trabajador.findMany({
    where: { activo: true, OR: [{ usuario: null }, { usuario: { id: usuario.id } }] },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Editar usuario</h1>
      <UsuarioForm usuario={usuario} esUsuarioActual={user.id === usuario.id} trabajadores={trabajadores} />

      <h2 className="text-lg font-semibold text-slate-900 mt-10 mb-4">Contraseña</h2>
      <PasswordForm usuarioId={usuario.id} />
    </div>
  );
}
