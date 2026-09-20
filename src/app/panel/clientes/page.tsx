import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
    include: { vehiculos: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Clientes</h1>
        <Link href="/panel/clientes/nuevo">
          <Button>Nuevo cliente</Button>
        </Link>
      </div>

      <div className="bg-paper border border-ink/12 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Vehículos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-surface">
                <td className="px-4 py-3">
                  <Link href={`/panel/clientes/${cliente.id}`} className="text-accent-text font-medium hover:underline">
                    {cliente.nombre}
                  </Link>
                </td>
                <td className="px-4 py-3">{cliente.telefono}</td>
                <td className="px-4 py-3">{cliente.email ?? "—"}</td>
                <td className="px-4 py-3">{cliente.vehiculos.length}</td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  Aún no hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
