import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireSession } from "@/lib/permissions";

export default async function PuestosPage() {
  const user = await requireSession();
  const puestos = await prisma.puesto.findMany({
    orderBy: { nombre: "asc" },
    include: { servicios: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Puestos de trabajo</h1>
        {user.rol === "ADMIN" && (
          <Link href="/panel/puestos/nuevo">
            <Button>Nuevo puesto</Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow divide-y divide-slate-100">
        {puestos.map((puesto) => (
          <div key={puesto.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">
                {puesto.nombre} {!puesto.activo && <Badge color="gray">Inactivo</Badge>}
              </p>
              <p className="text-sm text-slate-500">
                {puesto.servicios.length > 0
                  ? puesto.servicios.map((s) => s.nombre).join(", ")
                  : "Sin servicios asignados"}
              </p>
            </div>
            {user.rol === "ADMIN" && (
              <Link href={`/panel/puestos/${puesto.id}`} className="text-green-700 text-sm hover:underline">
                Editar
              </Link>
            )}
          </div>
        ))}
        {puestos.length === 0 && (
          <p className="px-4 py-6 text-center text-slate-400 text-sm">Aún no hay puestos registrados.</p>
        )}
      </div>
    </div>
  );
}
