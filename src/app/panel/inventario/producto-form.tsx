"use client";

import { useActionState } from "react";
import { crearProducto, actualizarProducto } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { CATEGORIAS_PRODUCTO, CATEGORIA_LABEL } from "@/lib/validations/inventario";
import type { Producto } from "@prisma/client";

export function ProductoForm({ producto }: { producto?: Producto }) {
  const action = producto ? actualizarProducto.bind(null, producto.id) : crearProducto;
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <Field label="Nombre">
        <Input name="nombre" defaultValue={producto?.nombre} required />
      </Field>
      <Field label="SKU (opcional)">
        <Input name="sku" defaultValue={producto?.sku ?? ""} />
      </Field>
      <Field label="Categoría">
        <Select name="categoria" defaultValue={producto?.categoria ?? "OTRO"}>
          {CATEGORIAS_PRODUCTO.map((c) => (
            <option key={c} value={c}>
              {CATEGORIA_LABEL[c]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Unidad">
        <Input name="unidad" defaultValue={producto?.unidad ?? "unidad"} required />
      </Field>
      <Field label="Precio de venta (CLP)">
        <Input name="precioVenta" type="number" min={0} step="1" defaultValue={producto?.precioVenta.toString()} required />
      </Field>
      <Field label="Costo unitario (CLP)">
        <Input name="costoUnitario" type="number" min={0} step="1" defaultValue={producto?.costoUnitario.toString()} required />
      </Field>
      <Field label="Stock actual">
        <Input name="stockActual" type="number" min={0} defaultValue={producto?.stockActual} required />
      </Field>
      <Field label="Stock mínimo (alerta)">
        <Input name="stockMinimo" type="number" min={0} defaultValue={producto?.stockMinimo} required />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : producto ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
