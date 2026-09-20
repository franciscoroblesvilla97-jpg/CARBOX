import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { SolicitudRow } from "./solicitud-row";
import type { EstadoSolicitud } from "@prisma/client";

const estadoColor = {
  PENDIENTE: "yellow",
  CONFIRMADA: "green",
  RECHAZADA: "red",
} as const;

export default async function AgendamientosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filtro = (estado as EstadoSolicitud) ?? "PENDIENTE";

  const solicitudes = await prisma.solicitudAgendamiento.findMany({
    where: { estado: filtro },
    orderBy: { createdAt: "desc" },
    include: { ordenGenerada: true },
  });

  const tabs: EstadoSolicitud[] = ["PENDIENTE", "CONFIRMADA", "RECHAZADA"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-4">Solicitudes de agendamiento</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={`/panel/agendamientos?estado=${tab}`}
            className={filtro === tab ? "" : "opacity-60 hover:opacity-100"}
          >
            <Badge color={estadoColor[tab]}>{tab}</Badge>
          </Link>
        ))}
      </div>

      <div className="bg-paper border border-ink/12 divide-y divide-ink/10">
        {solicitudes.map((solicitud) => (
          <SolicitudRow key={solicitud.id} solicitud={solicitud} />
        ))}
        {solicitudes.length === 0 && (
          <p className="px-4 py-6 text-center text-neutral-400 text-sm">No hay solicitudes en este estado.</p>
        )}
      </div>
    </div>
  );
}
