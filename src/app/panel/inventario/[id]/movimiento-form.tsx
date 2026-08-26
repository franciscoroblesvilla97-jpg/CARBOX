"use client";

import { useActionState, useState } from "react";
import { registrarMovimiento } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";

export function MovimientoForm({ productoId }: { productoId: string }) {
  const action = registrarMovimiento.bind(null, productoId);
  const [error, formAction, pending] = useActionState(action, undefined);
  const [tipo, setTipo] = useState("ENTRADA");

  return (
    <form action={formAction} className="grid grid-cols-4 gap-3 bg-slate-50 rounded-md p-4 items-end">
      <Field label="Tipo">
        <Select name="tipo" defaultValue="ENTRADA" onChange={(e) => setTipo(e.target.value)}>
          <option value="ENTRADA">Entrada</option>
          <option value="SALIDA">Salida</option>
          <option value="AJUSTE">Ajuste</option>
        </Select>
      </Field>
      <Field label="Cantidad">
        <Input name="cantidad" type="number" min={1} required />
      </Field>
      {tipo === "ENTRADA" && (
        <Field label="Costo unitario pagado (opcional)">
          <Input name="costoUnitario" type="number" min={0} step="1" placeholder="Ej: 5000" />
        </Field>
      )}
      <Field label="Motivo (opcional)">
        <Input name="motivo" placeholder="Compra proveedor X" />
      </Field>
      {error && <p className="col-span-4 text-sm text-red-600">{error}</p>}
      <div className="col-span-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Registrando..." : "Registrar movimiento"}
        </Button>
      </div>
    </form>
  );
}
