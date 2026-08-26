"use client";

import { useActionState, useState } from "react";
import { agregarServicioAOrden } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import type { Servicio } from "@prisma/client";

export function AgregarServicioForm({ ordenId, servicios }: { ordenId: string; servicios: Servicio[] }) {
  const action = agregarServicioAOrden.bind(null, ordenId);
  const [error, formAction, pending] = useActionState(action, undefined);
  const [modo, setModo] = useState<"catalogo" | "personalizado">("catalogo");

  return (
    <form action={formAction} className="grid grid-cols-4 gap-3 items-end">
      <input type="hidden" name="modo" value={modo} />
      <div className="col-span-4 flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input type="radio" checked={modo === "catalogo"} onChange={() => setModo("catalogo")} />
          Del catálogo
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" checked={modo === "personalizado"} onChange={() => setModo("personalizado")} />
          Personalizado (no está en el catálogo)
        </label>
      </div>

      {modo === "catalogo" ? (
        <Field label="Servicio">
          <Select name="servicioId" required defaultValue="">
            <option value="" disabled>
              Selecciona un servicio
            </option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <>
          <Field label="Nombre del servicio">
            <Input name="nombrePersonalizado" placeholder="Ej: Soldadura de escape" required />
          </Field>
          <Field label="Precio a cobrar (CLP)">
            <Input name="precioCobrado" type="number" min={0} step="1" required />
          </Field>
        </>
      )}

      <Field label="Cantidad">
        <Input name="cantidad" type="number" min={1} defaultValue={1} required />
      </Field>

      {error && <p className="col-span-4 text-sm text-red-600">{error}</p>}
      <div className="col-span-4">
        <Button type="submit" variant="ghost" disabled={pending}>
          {pending ? "Agregando..." : "Agregar servicio"}
        </Button>
      </div>
    </form>
  );
}
