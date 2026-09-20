"use client";

import { useActionState } from "react";
import { crearEspecificacion, actualizarEspecificacion } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import type { EspecificacionVehiculo } from "@prisma/client";

export function EspecificacionForm({
  especificacion,
  defaultMarca,
  defaultModelo,
}: {
  especificacion?: EspecificacionVehiculo;
  defaultMarca?: string;
  defaultModelo?: string;
}) {
  const action = especificacion ? actualizarEspecificacion.bind(null, especificacion.id) : crearEspecificacion;
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Marca">
          <Input name="marca" defaultValue={especificacion?.marca ?? defaultMarca} required />
        </Field>
        <Field label="Modelo">
          <Input name="modelo" defaultValue={especificacion?.modelo ?? defaultModelo} required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Año desde (opcional)">
          <Input name="anioDesde" type="number" min={1950} max={2100} defaultValue={especificacion?.anioDesde ?? ""} />
        </Field>
        <Field label="Año hasta (opcional)">
          <Input name="anioHasta" type="number" min={1950} max={2100} defaultValue={especificacion?.anioHasta ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo de aceite">
          <Input name="tipoAceite" placeholder="Ej: 5W-30 sintético" defaultValue={especificacion?.tipoAceite ?? ""} />
        </Field>
        <Field label="Capacidad de aceite">
          <Input name="capacidadAceite" placeholder="Ej: 4.5 L" defaultValue={especificacion?.capacidadAceite ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Filtro de aceite">
          <Input name="tipoFiltroAceite" placeholder="Ej: FIL-ACE-123" defaultValue={especificacion?.tipoFiltroAceite ?? ""} />
        </Field>
        <Field label="Filtro de aire">
          <Input name="tipoFiltroAire" placeholder="Ej: FIL-AIRE-45" defaultValue={especificacion?.tipoFiltroAire ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Medida de neumático">
          <Input name="tipoNeumatico" placeholder="Ej: 195/65 R15" defaultValue={especificacion?.tipoNeumatico ?? ""} />
        </Field>
      </div>
      <Field label="Notas (opcional)">
        <Textarea name="notas" rows={3} defaultValue={especificacion?.notas ?? ""} />
      </Field>
      {error && <p className="text-sm text-[#a63327]">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : especificacion ? "Guardar cambios" : "Crear ficha"}
      </Button>
    </form>
  );
}
