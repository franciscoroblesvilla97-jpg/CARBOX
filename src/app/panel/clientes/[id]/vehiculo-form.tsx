"use client";

import { useActionState } from "react";
import { crearVehiculo } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function VehiculoForm({ clienteId }: { clienteId: string }) {
  const action = crearVehiculo.bind(null, clienteId);
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 bg-surface p-4">
      <Field label="Patente">
        <Input name="patente" required />
      </Field>
      <Field label="Año (opcional)">
        <Input name="anio" type="number" min={1950} max={2100} />
      </Field>
      <Field label="Marca (opcional)">
        <Input name="marca" />
      </Field>
      <Field label="Modelo (opcional)">
        <Input name="modelo" />
      </Field>
      {error && <p className="col-span-2 text-sm text-[#a63327]">{error}</p>}
      <div className="col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Agregando..." : "Agregar vehículo"}
        </Button>
      </div>
    </form>
  );
}
