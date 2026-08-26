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
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <Link href="/panel/clientes/nuevo">
          <Button>Nuevo cliente</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Vehículos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/panel/clientes/${cliente.id}`} className="text-green-700 font-medium hover:underline">
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
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
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
