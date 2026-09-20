import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatFechaCorta } from "@/lib/format";
import { VehiculoEditForm } from "./vehiculo-edit-form";

const estadoColor = {
  PENDIENTE: "yellow",
  EN_PROGRESO: "blue",
  COMPLETADA: "green",
  CANCELADA: "red",
} as const;

export default async function VehiculoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id },
    include: {
      cliente: true,
      ordenes: {
        orderBy: { fechaIngreso: "desc" },
        include: { servicios: { include: { servicio: true } } },
      },
    },
  });

  if (!vehiculo) notFound();

  const especificacion =
    vehiculo.marca && vehiculo.modelo
      ? await prisma.especificacionVehiculo
          .findMany({ where: { marca: vehiculo.marca, modelo: vehiculo.modelo } })
          .then(
            (lista) =>
              lista.find(
                (e) =>
                  (!e.anioDesde || !vehiculo.anio || vehiculo.anio >= e.anioDesde) &&
                  (!e.anioHasta || !vehiculo.anio || vehiculo.anio <= e.anioHasta)
              ) ?? lista[0]
          )
      : null;

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-1">
        Cliente:{" "}
        <Link href={`/panel/clientes/${vehiculo.clienteId}`} className="text-accent-text hover:underline">
          {vehiculo.cliente.nombre}
        </Link>
      </p>
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-2xl font-bold text-ink">{vehiculo.patente}</h1>
        {(!vehiculo.marca || !vehiculo.modelo) && <Badge color="yellow">Datos incompletos</Badge>}
      </div>
      <p className="text-neutral-500 mb-6">
        {vehiculo.marca || "Marca sin registrar"} {vehiculo.modelo || ""} {vehiculo.anio ? `— ${vehiculo.anio}` : ""}
      </p>

      <h2 className="text-lg font-semibold text-ink mb-3">Datos del vehículo</h2>
      <div className="mb-8">
        <VehiculoEditForm vehiculo={vehiculo} />
      </div>

      <h2 className="text-lg font-semibold text-ink mb-3">Ficha técnica</h2>
      <div className="bg-paper border border-ink/12 p-4 mb-8 text-sm">
        {especificacion ? (
          <div className="grid grid-cols-2 gap-3">
            <p>
              <span className="text-neutral-400">Aceite:</span> {especificacion.tipoAceite ?? "—"}{" "}
              {especificacion.capacidadAceite ? `(${especificacion.capacidadAceite})` : ""}
            </p>
            <p>
              <span className="text-neutral-400">Filtro de aceite:</span> {especificacion.tipoFiltroAceite ?? "—"}
            </p>
            <p>
              <span className="text-neutral-400">Filtro de aire:</span> {especificacion.tipoFiltroAire ?? "—"}
            </p>
            <p>
              <span className="text-neutral-400">Neumático:</span> {especificacion.tipoNeumatico ?? "—"}
            </p>
            {especificacion.notas && (
              <p className="col-span-2">
                <span className="text-neutral-400">Notas:</span> {especificacion.notas}
              </p>
            )}
            <Link
              href={`/panel/especificaciones/${especificacion.id}`}
              className="col-span-2 text-accent-text hover:underline text-xs"
            >
              Editar ficha técnica →
            </Link>
          </div>
        ) : vehiculo.marca && vehiculo.modelo ? (
          <p className="text-neutral-400">
            Sin ficha técnica registrada para {vehiculo.marca} {vehiculo.modelo}.{" "}
            <Link
              href={`/panel/especificaciones/nuevo?marca=${encodeURIComponent(vehiculo.marca)}&modelo=${encodeURIComponent(vehiculo.modelo)}`}
              className="text-accent-text hover:underline"
            >
              Crear ficha técnica →
            </Link>
          </p>
        ) : (
          <p className="text-neutral-400">Completa la marca y modelo del vehículo para ver su ficha técnica.</p>
        )}
      </div>

      <h2 className="text-lg font-semibold text-ink mb-3">Historial de servicio</h2>
      <div className="bg-paper border border-ink/12 divide-y divide-ink/10">
        {vehiculo.ordenes.map((orden) => (
          <Link
            key={orden.id}
            href={`/panel/ordenes/${orden.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-surface"
          >
            <div>
              <p className="font-medium text-ink">OT #{orden.numero}</p>
              <p className="text-sm text-neutral-500">
                {orden.servicios.map((s) => s.servicio?.nombre ?? s.nombrePersonalizado).join(", ") || "Sin servicios"}
              </p>
            </div>
            <div className="text-right">
              <Badge color={estadoColor[orden.estado]}>{orden.estado}</Badge>
              <p className="text-xs text-neutral-400 mt-1">{formatFechaCorta(orden.fechaIngreso)}</p>
            </div>
          </Link>
        ))}
        {vehiculo.ordenes.length === 0 && (
          <p className="px-4 py-6 text-center text-neutral-400 text-sm">Este vehículo aún no tiene órdenes de trabajo.</p>
        )}
      </div>
    </div>
  );
}
