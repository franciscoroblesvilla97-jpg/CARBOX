"use client";

import { useActionState, useState } from "react";
import { agregarMaterialACotizacion } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import type { Producto } from "@prisma/client";

type ProductoPlano = Omit<Producto, "precioVenta" | "costoUnitario"> & { precioVenta: number; costoUnitario: number };

export function AgregarMaterialForm({
  cotizacionId,
  productos,
}: {
  cotizacionId: string;
  productos: ProductoPlano[];
}) {
  const action = agregarMaterialACotizacion.bind(null, cotizacionId);
  const [error, formAction, pending] = useActionState(action, undefined);
  const [modo, setModo] = useState<"inventario" | "externo">("inventario");

  return (
    <form action={formAction} className="grid grid-cols-4 gap-3 items-end">
      <input type="hidden" name="modo" value={modo} />
      <div className="col-span-4 flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input type="radio" checked={modo === "inventario"} onChange={() => setModo("inventario")} />
          De inventario
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" checked={modo === "externo"} onChange={() => setModo("externo")} />
          Externo (comprado puntual, no está en inventario)
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
        <>
          <Field label="Nombre del material">
            <Input name="nombrePersonalizado" placeholder="Ej: Manguera especial" required />
          </Field>
          <Field label="Costo pagado (CLP)">
            <Input name="costoUnitario" type="number" min={0} step="1" required />
          </Field>
          <Field label="Precio a cobrar (CLP)">
            <Input name="precioUnitario" type="number" min={0} step="1" required />
          </Field>
        </>
      )}

      <Field label="Cantidad">
        <Input name="cantidad" type="number" min={1} defaultValue={1} required />
      </Field>

      {error && <p className="col-span-4 text-sm text-[#a63327]">{error}</p>}
      <div className="col-span-4">
        <Button type="submit" variant="ghost" disabled={pending}>
          {pending ? "Agregando..." : "Agregar material"}
        </Button>
      </div>
    </form>
  );
}
