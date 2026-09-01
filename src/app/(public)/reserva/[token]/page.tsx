import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatFecha } from "@/lib/format";
import { ReservaAcciones } from "./reserva-acciones";

export default async function ReservaPublicaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const orden = await prisma.ordenTrabajo.findUnique({
    where: { tokenPublico: token },
    include: {
      vehiculo: { include: { cliente: true } },
      servicios: { include: { servicio: true } },
    },
  });

  if (!orden) notFound();

  const duracionMin = Math.max(
    orden.servicios.reduce((acc, l) => acc + (l.servicio?.duracionMinutos ?? 0) * l.cantidad, 0),
    20
  );

  const finalizada = orden.estado === "CANCELADA" || orden.estado === "COMPLETADA";

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Tu hora en Carbox</h1>
      <p className="text-slate-500 mb-6">
        Hola {orden.vehiculo.cliente.nombre}, esta es tu reserva.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6 text-sm">
        <p className="text-slate-400 uppercase text-xs mb-1">Vehículo</p>
        <p className="font-medium text-slate-900 mb-4">{orden.vehiculo.patente}</p>
        <p className="text-slate-400 uppercase text-xs mb-1">Servicio</p>
        <p className="font-medium text-slate-900 mb-4">
          {orden.servicios.map((s) => s.servicio?.nombre ?? s.nombrePersonalizado).join(", ") || "Sin servicios"}
        </p>
        <p className="text-slate-400 uppercase text-xs mb-1">Fecha y hora</p>
        <p className="font-medium text-slate-900">{formatFecha(orden.fechaProgramada)}</p>
      </div>

      {finalizada ? (
        <p className="text-sm text-slate-500">
          Esta reserva ya no está activa (
          {orden.estado === "CANCELADA" ? "fue cancelada" : "fue completada"}). Si necesitas agendar de nuevo,
          hazlo desde la página de inicio.
        </p>
      ) : (
        <ReservaAcciones
          token={token}
          ordenId={orden.id}
          duracionMin={duracionMin}
          confirmadoCliente={orden.confirmadoCliente}
        />
      )}
    </div>
  );
}
