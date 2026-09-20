"use client";

import { useActionState, useState } from "react";
import { agregarMaterialAOrden } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";

type ProductoOpcion = { id: string; nombre: string; stockActual: number };

export function AgregarMaterialTecnicoForm({
  ordenId,
  productos,
}: {
  ordenId: string;
  productos: ProductoOpcion[];
}) {
  const action = agregarMaterialAOrden.bind(null, ordenId);
  const [error, formAction, pending] = useActionState(action, undefined);
  const [modo, setModo] = useState<"inventario" | "pendiente">("inventario");

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 items-end">
      <input type="hidden" name="modo" value={modo} />
      <div className="col-span-2 flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input type="radio" checked={modo === "inventario"} onChange={() => setModo("inventario")} />
          Del inventario
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" checked={modo === "pendiente"} onChange={() => setModo("pendiente")} />
          Repuesto nuevo (avisar al admin)
        </label>
      </div>

      {modo === "inventario" ? (
        <Field label="Producto">
          <Select name="productoId" required defaultValue="">
            <option value="" disabled>
              Selecciona un producto
            </option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} (stock: {p.stockActual})
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <Field label="Nombre del repuesto">
          <Input name="nombrePersonalizado" placeholder="Ej: Manguera especial" required />
        </Field>
      )}

      <Field label="Cantidad">
        <Input name="cantidad" type="number" min={1} defaultValue={1} required />
      </Field>

      {modo === "pendiente" && (
        <p className="col-span-2 text-xs text-neutral-500 -mt-2">
          Este repuesto quedará marcado como pendiente hasta que el admin le fije un precio.
        </p>
      )}

      {error && <p className="col-span-2 text-sm text-[#a63327]">{error}</p>}
      <div className="col-span-2">
        <Button type="submit" variant="ghost" disabled={pending}>
          {pending ? "Agregando..." : "Agregar repuesto"}
        </Button>
      </div>
    </form>
  );
}
