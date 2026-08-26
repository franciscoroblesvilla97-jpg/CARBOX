import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/permissions";

export default async function EspecificacionesPage() {
  const user = await requireSession();
  const especificaciones = await prisma.especificacionVehiculo.findMany({
    orderBy: [{ marca: "asc" }, { modelo: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Ficha técnica de modelos</h1>
        {user.rol === "ADMIN" && (
          <Link href="/panel/especificaciones/nuevo">
            <Button>Nueva ficha</Button>
          </Link>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Datos de referencia por marca/modelo/año: tipo de aceite, neumático y otros insumos que usa cada vehículo.
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Años</th>
              <th className="px-4 py-3">Aceite</th>
              <th className="px-4 py-3">Filtros</th>
              <th className="px-4 py-3">Neumático</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {especificaciones.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  {user.rol === "ADMIN" ? (
                    <Link href={`/panel/especificaciones/${e.id}`} className="text-green-700 font-medium hover:underline">
                      {e.marca}
                    </Link>
                  ) : (
                    e.marca
                  )}
                </td>
                <td className="px-4 py-3">{e.modelo}</td>
                <td className="px-4 py-3 text-slate-500">
                  {e.anioDesde ?? "?"}–{e.anioHasta ?? "?"}
                </td>
                <td className="px-4 py-3">
                  {e.tipoAceite ?? "—"} {e.capacidadAceite ? `(${e.capacidadAceite})` : ""}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {[e.tipoFiltroAceite, e.tipoFiltroAire].filter(Boolean).join(" / ") || "—"}
                </td>
                <td className="px-4 py-3">{e.tipoNeumatico ?? "—"}</td>
              </tr>
            ))}
            {especificaciones.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Aún no hay fichas técnicas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
