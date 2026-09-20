import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function UsuariosPage() {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/dashboard");

  const usuarios = await prisma.usuario.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <Link href="/panel/usuarios/nuevo">
          <Button>Nuevo usuario</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow divide-y divide-slate-100">
        {usuarios.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">
                {u.nombre} {!u.activo && <Badge color="gray">Inactivo</Badge>}
              </p>
              <p className="text-sm text-slate-500">
                {u.email} ·{" "}
                <Badge color={u.rol === "ADMIN" ? "blue" : u.rol === "TECNICO" ? "yellow" : "gray"}>{u.rol}</Badge>
              </p>
            </div>
            <Link href={`/panel/usuarios/${u.id}`} className="text-green-700 text-sm hover:underline">
              Editar
            </Link>
          </div>
        ))}
        {usuarios.length === 0 && (
          <p className="px-4 py-6 text-center text-slate-400 text-sm">Aún no hay usuarios registrados.</p>
        )}
      </div>
    </div>
  );
}
