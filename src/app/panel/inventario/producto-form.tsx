"use client";

import { useActionState, useState } from "react";
import { crearProducto, actualizarProducto } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { CATEGORIAS_PRODUCTO, CATEGORIA_LABEL } from "@/lib/validations/inventario";
import type { Producto } from "@prisma/client";

function margenDesdePrecios(costo: number, precioVenta: number) {
  if (costo <= 0) return "";
  return (((precioVenta - costo) / costo) * 100).toFixed(0);
}

export function ProductoForm({ producto }: { producto?: Producto }) {
  const action = producto ? actualizarProducto.bind(null, producto.id) : crearProducto;
  const [error, formAction, pending] = useActionState(action, undefined);

  const costoInicial = producto ? Number(producto.costoUnitario) : 0;
  const precioInicial = producto ? Number(producto.precioVenta) : 0;

  const [costoUnitario, setCostoUnitario] = useState(costoInicial);
  const [margen, setMargen] = useState(producto ? margenDesdePrecios(costoInicial, precioInicial) : "30");
  const [precioVenta, setPrecioVenta] = useState(precioInicial);
  const [categoria, setCategoria] = useState(producto?.categoria ?? "OTRO");

  function recalcularPrecio(costo: number, margenPct: string) {
    const m = parseFloat(margenPct);
    if (!Number.isFinite(m)) return;
    setPrecioVenta(Math.round(costo * (1 + m / 100)));
  }

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <Field label="Nombre">
        <Input name="nombre" defaultValue={producto?.nombre} required />
      </Field>
      <Field label="SKU (opcional)">
        <Input name="sku" defaultValue={producto?.sku ?? ""} />
      </Field>
      <Field label="Categoría">
        <Select name="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as typeof categoria)}>
          {CATEGORIAS_PRODUCTO.map((c) => (
            <option key={c} value={c}>
              {CATEGORIA_LABEL[c]}
            </option>
          ))}
        </Select>
      </Field>
      {categoria === "NEUMATICOS" && (
        <>
          <Field label="Marca (opcional)">
            <Input name="marca" defaultValue={producto?.marca ?? ""} placeholder="Ej: Kumho" />
          </Field>
          <Field label="Medida (opcional)">
            <Input name="medida" defaultValue={producto?.medida ?? ""} placeholder="Ej: 195/65 R15" />
            <p className="text-xs text-slate-400 mt-1">
              Formato exacto ancho/perfil R aro — así lo encuentra el buscador del sitio.
            </p>
          </Field>
          <Field label="Índice de carga/velocidad (opcional)">
            <Input name="indice" defaultValue={producto?.indice ?? ""} placeholder="Ej: 91H" />
          </Field>
          <Field label="URL de foto (opcional)">
            <Input name="imagenUrl" defaultValue={producto?.imagenUrl ?? ""} placeholder="https://..." />
          </Field>
        </>
      )}
      <Field label="Unidad">
        <Input name="unidad" defaultValue={producto?.unidad ?? "unidad"} required />
      </Field>
      <Field label="Costo unitario (CLP, con IVA)">
        <Input
          name="costoUnitario"
          type="number"
          min={0}
          step="1"
          value={costoUnitario}
          onChange={(e) => {
            const nuevoCosto = Number(e.target.value) || 0;
            setCostoUnitario(nuevoCosto);
            recalcularPrecio(nuevoCosto, margen);
          }}
          required
        />
      </Field>
      <Field label="Utilidad (%)">
        <Input
          type="number"
          min={0}
          step="1"
          value={margen}
          onChange={(e) => {
            setMargen(e.target.value);
            recalcularPrecio(costoUnitario, e.target.value);
          }}
          placeholder="Ej: 30"
        />
        <p className="text-xs text-slate-400 mt-1">Calcula el precio de venta automáticamente a partir del costo.</p>
      </Field>
      <Field label="Precio de venta (CLP)">
        <Input
          name="precioVenta"
          type="number"
          min={0}
          step="1"
          value={precioVenta}
          onChange={(e) => setPrecioVenta(Number(e.target.value) || 0)}
          required
        />
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
