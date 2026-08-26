"use client";

import { useTransition } from "react";
import { actualizarEstadoOrden, eliminarOrden } from "../actions";
import { Button } from "@/components/ui/button";
import type { EstadoOrden } from "@prisma/client";

const transiciones: Record<EstadoOrden, EstadoOrden[]> = {
  PENDIENTE: ["EN_PROGRESO", "CANCELADA"],
  EN_PROGRESO: ["COMPLETADA", "CANCELADA"],
  COMPLETADA: [],
  CANCELADA: [],
};

const etiquetas: Record<EstadoOrden, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "Marcar en progreso",
  COMPLETADA: "Marcar completada",
  CANCELADA: "Cancelar orden",
};

export function EstadoActions({ ordenId, estado, esAdmin }: { ordenId: string; estado: EstadoOrden; esAdmin: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {transiciones[estado].map((siguiente) => (
        <Button
          key={siguiente}
          variant={siguiente === "CANCELADA" ? "danger" : "primary"}
          disabled={pending}
          onClick={() => startTransition(() => actualizarEstadoOrden(ordenId, siguiente))}
        >
          {etiquetas[siguiente]}
        </Button>
      ))}
      {esAdmin && (
        <Button variant="ghost" disabled={pending} onClick={() => startTransition(() => eliminarOrden(ordenId))}>
          Eliminar
        </Button>
      )}
    </div>
  );
}
