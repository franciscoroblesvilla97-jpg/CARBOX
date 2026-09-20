import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFecha } from "@/lib/format";

const estadoColor = {
  PENDIENTE: "yellow",
  EN_PROGRESO: "blue",
  COMPLETADA: "green",
  CANCELADA: "red",
} as const;

export default async function OrdenesPage() {
  const user = await requireSession();
  const esTecnico = user.rol === "TECNICO";

  const ordenes = await prisma.ordenTrabajo.findMany({
    where: esTecnico ? { trabajadorId: user.trabajadorId ?? "__ninguno__" } : undefined,
    orderBy: { fechaProgramada: "desc" },
    include: {
      vehiculo: { include: { cliente: true } },
      productos: { where: { pendienteRevision: true }, select: { id: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">{esTecnico ? "Mis órdenes" : "Órdenes de trabajo"}</h1>
        {!esTecnico && (
          <Link href="/panel/ordenes/nueva">
            <Button>Nueva orden</Button>
          </Link>
        )}
      </div>

      <div className="bg-paper border border-ink/12 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">OT</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Programada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {ordenes.map((orden) => (
              <tr key={orden.id} className="hover:bg-surface">
                <td className="px-4 py-3">
                  <Link href={`/panel/ordenes/${orden.id}`} className="text-accent-text font-medium hover:underline">
                    #{orden.numero}
                  </Link>
                </td>
                <td className="px-4 py-3">{orden.vehiculo.patente}</td>
                <td className="px-4 py-3">{orden.vehiculo.cliente.nombre}</td>
                <td className="px-4 py-3">
                  <Badge color={estadoColor[orden.estado]}>{orden.estado}</Badge>
                  {!esTecnico && orden.productos.length > 0 && (
                    <span className="ml-1">
                      <Badge color="yellow">Repuesto pendiente</Badge>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500">{formatFecha(orden.fechaProgramada)}</td>
              </tr>
            ))}
            {ordenes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  Aún no hay órdenes de trabajo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
