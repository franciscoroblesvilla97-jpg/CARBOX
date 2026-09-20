"use client";

import { useActionState } from "react";
import { convertirCotizacionEnOrden } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function ConvertirForm({ cotizacionId, requierePatente }: { cotizacionId: string; requierePatente: boolean }) {
  const action = convertirCotizacionEnOrden.bind(null, cotizacionId);
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex items-end gap-3">
      {requierePatente && (
        <Field label="Patente del vehículo">
          <Input name="patente" placeholder="AB1234" required />
        </Field>
      )}
      {error && <p className="text-sm text-[#a63327]">{error}</p>}
      <div className={requierePatente ? "mb-4" : ""}>
        <Button type="submit" disabled={pending}>
          {pending ? "Convirtiendo..." : "Convertir en orden de trabajo"}
        </Button>
      </div>
    </form>
  );
}
