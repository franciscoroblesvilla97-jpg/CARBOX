"use client";

import { useActionState } from "react";
import { crearTrabajador, actualizarTrabajador } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { Trabajador } from "@prisma/client";

export function TrabajadorForm({ trabajador }: { trabajador?: Trabajador }) {
  const action = trabajador ? actualizarTrabajador.bind(null, trabajador.id) : crearTrabajador;
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <Field label="Nombre">
        <Input name="nombre" defaultValue={trabajador?.nombre} required />
      </Field>
      <label className="flex items-center gap-2 text-sm text-slate-700 mb-4">
        <input type="checkbox" name="activo" defaultChecked={trabajador?.activo ?? true} />
        Trabajador activo (disponible para asignar en órdenes)
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : trabajador ? "Guardar cambios" : "Crear trabajador"}
      </Button>
    </form>
  );
}
