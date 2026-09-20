"use client";

import { useActionState } from "react";
import { crearPuesto, actualizarPuesto } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { Puesto } from "@prisma/client";

type ServicioResumen = { id: string; nombre: string };
type PuestoConServicios = Puesto & { servicios: ServicioResumen[] };

export function PuestoForm({
  puesto,
  servicios,
}: {
  puesto?: PuestoConServicios;
  servicios: ServicioResumen[];
}) {
  const action = puesto ? actualizarPuesto.bind(null, puesto.id) : crearPuesto;
  const [error, formAction, pending] = useActionState(action, undefined);
  const idsSeleccionados = new Set(puesto?.servicios.map((s) => s.id) ?? []);

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <Field label="Nombre">
        <Input name="nombre" defaultValue={puesto?.nombre} required />
      </Field>

      <div className="mb-4">
        <p className="block text-sm font-medium text-ink mb-1">Servicios que puede realizar</p>
        <div className="bg-surface border border-ink/16 divide-y divide-ink/10">
          {servicios.map((servicio) => (
            <label key={servicio.id} className="flex items-center gap-2 px-3 py-2 text-sm">
              <input
                type="checkbox"
                name="servicioIds"
                value={servicio.id}
                defaultChecked={idsSeleccionados.has(servicio.id)}
              />
              {servicio.nombre}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink mb-4">
        <input type="checkbox" name="activo" defaultChecked={puesto?.activo ?? true} />
        Puesto activo (disponible para asignar en órdenes)
      </label>

      {error && <p className="text-sm text-[#a63327]">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : puesto ? "Guardar cambios" : "Crear puesto"}
      </Button>
    </form>
  );
}
