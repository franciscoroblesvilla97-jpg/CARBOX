"use client";

import { useActionState, useState } from "react";
import { fijarPrecioMaterialPendiente } from "../actions";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

type ProductoOpcion = { id: string; nombre: string };

export function FijarPrecioForm({
  ordenId,
  lineaId,
  productos,
}: {
  ordenId: string;
  lineaId: string;
  productos: ProductoOpcion[];
}) {
  const [abierto, setAbierto] = useState(false);
  const action = fijarPrecioMaterialPendiente.bind(null, ordenId, lineaId);
  const [error, formAction, pending] = useActionState(action, undefined);

  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className="text-xs font-medium text-accent-text hover:underline">
        Fijar precio
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <Select name="productoId" defaultValue="" className="text-xs py-1">
        <option value="">Sin vincular al catálogo</option>
        {productos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </Select>
      <div className="flex items-center gap-1">
        <span className="text-xs text-neutral-400">Costo</span>
        <Input name="costoUnitario" type="number" min={0} step="1" defaultValue={0} className="w-24 text-xs py-1" />
        <span className="text-xs text-neutral-400">Precio</span>
        <Input name="precioUnitario" type="number" min={0} step="1" required className="w-24 text-xs py-1" />
        <Button type="submit" variant="secondary" disabled={pending} className="text-[11px] px-2 py-1">
          {pending ? "..." : "Guardar"}
        </Button>
      </div>
      {error && <p className="text-xs text-[#a63327]">{error}</p>}
    </form>
  );
}
