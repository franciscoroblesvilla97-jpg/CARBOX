"use client";

import { useTransition } from "react";
import Link from "next/link";
import { confirmarSolicitud, rechazarSolicitud, convertirEnOrden } from "./actions";
import { Button } from "@/components/ui/button";
import { formatFecha } from "@/lib/format";
import type { SolicitudAgendamiento, OrdenTrabajo } from "@prisma/client";

type SolicitudConOrden = SolicitudAgendamiento & { ordenGenerada: OrdenTrabajo | null };

export function SolicitudRow({ solicitud }: { solicitud: SolicitudConOrden }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="px-4 py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-ink">
            {solicitud.nombreContacto} <span className="text-neutral-400 font-normal">· {solicitud.patente}</span>
          </p>
          <p className="text-sm text-neutral-500">
            {solicitud.telefono} {solicitud.email ? `· ${solicitud.email}` : ""}
          </p>
          {(solicitud.marca || solicitud.modelo || solicitud.anio) && (
            <p className="text-sm text-neutral-500">
              {solicitud.marca ?? ""} {solicitud.modelo ?? ""} {solicitud.anio ?? ""}
            </p>
          )}
          <p className="text-sm text-ink mt-1">
            {solicitud.servicioTexto} — preferencia {formatFecha(solicitud.fechaPreferida)}
          </p>
          {solicitud.comentario && <p className="text-sm text-neutral-500 mt-1">&ldquo;{solicitud.comentario}&rdquo;</p>}
        </div>
      </div>

      {solicitud.estado === "PENDIENTE" && (
        <div className="mt-3 flex items-center gap-2">
          <Button disabled={pending} onClick={() => startTransition(() => confirmarSolicitud(solicitud.id))}>
            Confirmar
          </Button>
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => startTransition(() => rechazarSolicitud(solicitud.id))}
          >
            Rechazar
          </Button>
        </div>
      )}

      {solicitud.estado === "CONFIRMADA" && solicitud.vehiculoId && (
        <div className="mt-3">
          {solicitud.ordenGenerada ? (
            <Link
              href={`/panel/ordenes/${solicitud.ordenGenerada.id}`}
              className="text-accent-text text-sm font-medium hover:underline"
            >
              Ver orden de trabajo #{solicitud.ordenGenerada.numero} →
            </Link>
          ) : (
            <Button disabled={pending} onClick={() => startTransition(() => convertirEnOrden(solicitud.id))}>
              Convertir en orden de trabajo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
