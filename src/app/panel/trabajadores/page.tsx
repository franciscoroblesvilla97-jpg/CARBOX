import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireSession } from "@/lib/permissions";

export default async function TrabajadoresPage() {
  const user = await requireSession();
  const trabajadores = await prisma.trabajador.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Trabajadores</h1>
        {user.rol === "ADMIN" && (
          <Link href="/panel/trabajadores/nuevo">
            <Button>Nuevo trabajador</Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow divide-y divide-slate-100">
        {trabajadores.map((trabajador) => (
          <div key={trabajador.id} className="flex items-center justify-between px-4 py-3">
            <p className="font-medium text-slate-900">
              {trabajador.nombre} {!trabajador.activo && <Badge color="gray">Inactivo</Badge>}
            </p>
            {user.rol === "ADMIN" && (
              <Link href={`/panel/trabajadores/${trabajador.id}`} className="text-green-700 text-sm hover:underline">
                Editar
              </Link>
            )}
          </div>
        ))}
        {trabajadores.length === 0 && (
          <p className="px-4 py-6 text-center text-slate-400 text-sm">Aún no hay trabajadores registrados.</p>
        )}
      </div>
    </div>
  );
}
