"use client";

import { useActionState } from "react";
import { reasignarOrden } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/input";
import type { Trabajador } from "@prisma/client";

type PuestoOpcion = { id: string; nombre: string; puedeRealizarTodos: boolean };

export function AsignacionForm({
  ordenId,
  trabajadorId,
  puestoId,
  trabajadores,
  puestos,
}: {
  ordenId: string;
  trabajadorId: string | null;
  puestoId: string | null;
  trabajadores: Trabajador[];
  puestos: PuestoOpcion[];
}) {
  const action = reasignarOrden.bind(null, ordenId);
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 items-end">
      <Field label="Trabajador asignado">
        <Select name="trabajadorId" defaultValue={trabajadorId ?? ""}>
          <option value="">Sin asignar</option>
          {trabajadores.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Puesto asignado">
        <Select name="puestoId" defaultValue={puestoId ?? ""}>
          <option value="">Sin asignar</option>
          {puestos.map((p) => (
            <option key={p.id} value={p.id} disabled={!p.puedeRealizarTodos}>
              {p.nombre} {!p.puedeRealizarTodos ? "(no soporta todos los servicios)" : ""}
            </option>
          ))}
        </Select>
      </Field>
      {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
      <div className="col-span-2">
        <Button type="submit" disabled={pending} variant="ghost">
          {pending ? "Guardando..." : "Guardar asignación"}
        </Button>
      </div>
    </form>
  );
}
