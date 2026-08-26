"use client";

import { useTransition } from "react";
import { aprobarCotizacion, rechazarCotizacion, eliminarCotizacion } from "../actions";
import { Button } from "@/components/ui/button";
import type { EstadoCotizacion } from "@prisma/client";

export function EstadoActions({
  cotizacionId,
  estado,
  esAdmin,
}: {
  cotizacionId: string;
  estado: EstadoCotizacion;
  esAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2 print:hidden">
      {estado === "PENDIENTE" && (
        <>
          <Button disabled={pending} onClick={() => startTransition(() => aprobarCotizacion(cotizacionId))}>
            Aprobar
          </Button>
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => startTransition(() => rechazarCotizacion(cotizacionId))}
          >
            Rechazar
          </Button>
        </>
      )}
      {esAdmin && (
        <Button variant="ghost" disabled={pending} onClick={() => startTransition(() => eliminarCotizacion(cotizacionId))}>
          Eliminar
        </Button>
      )}
    </div>
  );
}
