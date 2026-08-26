"use client";

import { useActionState } from "react";
import { crearCotizacion } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatCLP } from "@/lib/format";
import type { Servicio, Producto } from "@prisma/client";

const FILAS_PERSONALIZADAS = 3;

export function CotizacionForm({ servicios, productos }: { servicios: Servicio[]; productos: Producto[] }) {
  const [error, formAction, pending] = useActionState(crearCotizacion, undefined);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-3 gap-4">
        <Field label="Nombre del cliente">
          <Input name="nombreCliente" required />
        </Field>
        <Field label="Teléfono (opcional)">
          <PhoneInput name="telefono" />
        </Field>
        <Field label="Email (opcional)">
          <Input name="email" type="email" />
        </Field>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Field label="Patente (opcional)">
          <Input name="patente" placeholder="AB1234" />
        </Field>
        <Field label="Marca (opcional)">
          <Input name="marca" />
        </Field>
        <Field label="Modelo (opcional)">
          <Input name="modelo" />
        </Field>
        <Field label="Año (opcional)">
          <Input name="anio" type="number" min={1950} max={2100} />
        </Field>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Servicios del catálogo</h2>
        <div className="bg-white rounded-md border border-slate-200 divide-y divide-slate-100">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <input type="hidden" name="servicioId" value={servicio.id} />
                <p className="text-sm font-medium text-slate-800">{servicio.nombre}</p>
                <p className="text-xs text-slate-500">{formatCLP(servicio.precioBase.toString())}</p>
              </div>
              <input
                type="number"
                name="servicioCantidad"
                min={0}
                defaultValue={0}
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Servicios personalizados (opcional)</h2>
        <div className="space-y-2">
          {Array.from({ length: FILAS_PERSONALIZADAS }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 items-center">
              <input
                name="servicioNombrePersonalizado"
                placeholder="Nombre del servicio"
                className="col-span-3 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
              <input
                name="servicioPrecioPersonalizado"
                type="number"
                min={0}
                placeholder="Precio"
                className="col-span-2 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
              <input
                name="servicioCantidadPersonalizada"
                type="number"
                min={1}
                defaultValue={1}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Productos / materiales de inventario</h2>
        <div className="bg-white rounded-md border border-slate-200 divide-y divide-slate-100">
          {productos.map((producto) => (
            <div key={producto.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <input type="hidden" name="productoId" value={producto.id} />
                <p className="text-sm font-medium text-slate-800">{producto.nombre}</p>
                <p className="text-xs text-slate-500">{formatCLP(producto.precioVenta.toString())}</p>
              </div>
              <input
                type="number"
                name="productoCantidad"
                min={0}
                defaultValue={0}
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Materiales externos (opcional)</h2>
        <div className="space-y-2">
          {Array.from({ length: FILAS_PERSONALIZADAS }).map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-2 items-center">
              <input
                name="materialNombrePersonalizado"
                placeholder="Nombre del material"
                className="col-span-3 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
              <input
                name="materialCostoPersonalizado"
                type="number"
                min={0}
                placeholder="Costo"
                className="col-span-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
              <input
                name="materialPrecioPersonalizado"
                type="number"
                min={0}
                placeholder="Precio a cobrar"
                className="col-span-2 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
              <input
                name="materialCantidadPersonalizada"
                type="number"
                min={1}
                defaultValue={1}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <Field label="Observaciones (opcional)">
        <Textarea name="observaciones" rows={3} />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creando cotización..." : "Crear cotización"}
      </Button>
    </form>
  );
}
