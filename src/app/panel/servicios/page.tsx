import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCLP } from "@/lib/format";
import { requireSession } from "@/lib/permissions";

export default async function ServiciosPage() {
  const user = await requireSession();
  const servicios = await prisma.servicio.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Catálogo de servicios</h1>
        {user.rol === "ADMIN" && (
          <Link href="/panel/servicios/nuevo">
            <Button>Nuevo servicio</Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow divide-y divide-slate-100">
        {servicios.map((servicio) => (
          <div key={servicio.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">
                {servicio.nombre} {!servicio.activo && <Badge color="gray">Inactivo</Badge>}
              </p>
              {servicio.descripcion && <p className="text-sm text-slate-500">{servicio.descripcion}</p>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">{servicio.duracionMinutos} min</span>
              <span className="font-medium">{formatCLP(servicio.precioBase.toString())}</span>
              {user.rol === "ADMIN" && (
                <Link href={`/panel/servicios/${servicio.id}`} className="text-green-700 text-sm hover:underline">
                  Editar
                </Link>
              )}
            </div>
          </div>
        ))}
        {servicios.length === 0 && (
          <p className="px-4 py-6 text-center text-slate-400 text-sm">Aún no hay servicios registrados.</p>
        )}
      </div>
    </div>
  );
}
