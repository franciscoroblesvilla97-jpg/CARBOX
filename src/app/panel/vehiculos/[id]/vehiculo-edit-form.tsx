"use client";

import { useActionState } from "react";
import { actualizarVehiculo } from "../../clientes/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { Vehiculo } from "@prisma/client";

export function VehiculoEditForm({ vehiculo }: { vehiculo: Vehiculo }) {
  const action = actualizarVehiculo.bind(null, vehiculo.id);
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 bg-surface p-4">
      <Field label="Patente">
        <Input name="patente" defaultValue={vehiculo.patente} required />
      </Field>
      <Field label="Año (opcional)">
        <Input name="anio" type="number" min={1950} max={2100} defaultValue={vehiculo.anio ?? ""} />
      </Field>
      <Field label="Marca (opcional)">
        <Input name="marca" defaultValue={vehiculo.marca ?? ""} />
      </Field>
      <Field label="Modelo (opcional)">
        <Input name="modelo" defaultValue={vehiculo.modelo ?? ""} />
      </Field>
      {error && <p className="col-span-2 text-sm text-[#a63327]">{error}</p>}
      <div className="col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar datos del vehículo"}
        </Button>
      </div>
    </form>
  );
}
