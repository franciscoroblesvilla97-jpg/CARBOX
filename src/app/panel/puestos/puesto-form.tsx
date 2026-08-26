"use client";

import { useActionState } from "react";
import { crearPuesto, actualizarPuesto } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { Puesto, Servicio } from "@prisma/client";

type PuestoConServicios = Puesto & { servicios: Servicio[] };

export function PuestoForm({ puesto, servicios }: { puesto?: PuestoConServicios; servicios: Servicio[] }) {
  const action = puesto ? actualizarPuesto.bind(null, puesto.id) : crearPuesto;
  const [error, formAction, pending] = useActionState(action, undefined);
  const idsSeleccionados = new Set(puesto?.servicios.map((s) => s.id) ?? []);

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <Field label="Nombre">
        <Input name="nombre" defaultValue={puesto?.nombre} required />
      </Field>

      <div className="mb-4">
        <p className="block text-sm font-medium text-slate-700 mb-1">Servicios que puede realizar</p>
        <div className="bg-slate-50 rounded-md border border-slate-200 divide-y divide-slate-100">
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

      <label className="flex items-center gap-2 text-sm text-slate-700 mb-4">
        <input type="checkbox" name="activo" defaultChecked={puesto?.activo ?? true} />
        Puesto activo (disponible para asignar en órdenes)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : puesto ? "Guardar cambios" : "Crear puesto"}
      </Button>
    </form>
  );
}
