"use client";

import { useActionState } from "react";
import { crearServicio, actualizarServicio } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import type { Servicio } from "@prisma/client";

type ServicioPlano = Omit<Servicio, "precioBase"> & { precioBase: number };

export function ServicioForm({ servicio }: { servicio?: ServicioPlano }) {
  const action = servicio ? actualizarServicio.bind(null, servicio.id) : crearServicio;
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <Field label="Nombre">
        <Input name="nombre" defaultValue={servicio?.nombre} required />
      </Field>
      <Field label="Descripción (opcional)">
        <Textarea name="descripcion" defaultValue={servicio?.descripcion ?? ""} rows={3} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio base (CLP)">
          <Input name="precioBase" type="number" min={0} step="1" defaultValue={servicio?.precioBase.toString()} required />
        </Field>
        <Field label="Duración estimada (min)">
          <Input
            name="duracionMinutos"
            type="number"
            min={0}
            step="5"
            defaultValue={servicio?.duracionMinutos ?? 0}
            required
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink mb-4">
        <input type="checkbox" name="activo" defaultChecked={servicio?.activo ?? true} />
        Servicio activo (visible en el sitio y disponible para órdenes)
      </label>
      {error && <p className="text-sm text-[#a63327]">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : servicio ? "Guardar cambios" : "Crear servicio"}
      </Button>
    </form>
  );
}
