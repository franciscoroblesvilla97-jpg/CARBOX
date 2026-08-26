import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClienteForm } from "../cliente-form";
import { VehiculoForm } from "./vehiculo-form";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { vehiculos: { orderBy: { createdAt: "desc" } } },
  });

  if (!cliente) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{cliente.nombre}</h1>
        <ClienteForm cliente={cliente} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Vehículos</h2>
        <div className="bg-white rounded-lg shadow divide-y divide-slate-100 mb-4">
          {cliente.vehiculos.map((vehiculo) => (
            <Link
              key={vehiculo.id}
              href={`/panel/vehiculos/${vehiculo.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <span className="font-medium text-green-700">{vehiculo.patente}</span>
              <span className="text-slate-500 text-sm">
                {vehiculo.marca ?? ""} {vehiculo.modelo ?? ""} {vehiculo.anio ? `(${vehiculo.anio})` : ""}
              </span>
            </Link>
          ))}
          {cliente.vehiculos.length === 0 && (
            <p className="px-4 py-6 text-center text-slate-400 text-sm">Sin vehículos registrados.</p>
          )}
        </div>
        <VehiculoForm clienteId={cliente.id} />
      </div>
    </div>
  );
}
