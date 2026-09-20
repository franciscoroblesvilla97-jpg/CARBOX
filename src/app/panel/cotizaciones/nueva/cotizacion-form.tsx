"use client";

import { useActionState, useRef, useState } from "react";
import { crearCotizacion } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatCLP } from "@/lib/format";
import type { Servicio, Producto } from "@prisma/client";

const FILAS_INICIALES = 3;

type ServicioPlano = Omit<Servicio, "precioBase"> & { precioBase: number };
type ProductoPlano = Omit<Producto, "precioVenta" | "costoUnitario"> & { precioVenta: number; costoUnitario: number };

export function CotizacionForm({
  servicios,
  productos,
}: {
  servicios: ServicioPlano[];
  productos: ProductoPlano[];
}) {
  const [error, formAction, pending] = useActionState(crearCotizacion, undefined);

  const [filasServicio, setFilasServicio] = useState<number[]>(() =>
    Array.from({ length: FILAS_INICIALES }, (_, i) => i)
  );
  const siguienteIdServicio = useRef(FILAS_INICIALES);

  const [filasMaterial, setFilasMaterial] = useState<number[]>(() =>
    Array.from({ length: FILAS_INICIALES }, (_, i) => i)
  );
  const siguienteIdMaterial = useRef(FILAS_INICIALES);

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
        <h2 className="text-sm font-semibold text-ink mb-2">Servicios del catálogo</h2>
        <p className="text-xs text-neutral-400 mb-2">El precio viene precargado desde el catálogo, pero puedes ajustarlo para esta cotización.</p>
        <div className="bg-paper border border-ink/16 divide-y divide-ink/10">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <input type="hidden" name="servicioId" value={servicio.id} />
                <p className="text-sm font-medium text-ink truncate">{servicio.nombre}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-neutral-400">$</span>
                <input
                  type="number"
                  name="servicioPrecio"
                  min={0}
                  step="1"
                  defaultValue={Number(servicio.precioBase)}
                  title="Precio a cobrar (editable)"
                  className="w-28 border border-ink/24 px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  name="servicioCantidad"
                  min={0}
                  defaultValue={0}
                  title="Cantidad"
                  className="w-16 border border-ink/24 px-2 py-1 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink mb-2">Servicios personalizados (opcional)</h2>
        <div className="space-y-2">
          {filasServicio.map((id) => (
            <div key={id} className="grid grid-cols-7 gap-2 items-center">
              <input
                name="servicioNombrePersonalizado"
                placeholder="Nombre del servicio"
                className="col-span-3 border border-ink/24 px-2 py-1 text-sm"
              />
              <input
                name="servicioPrecioPersonalizado"
                type="number"
                min={0}
                placeholder="Precio"
                className="col-span-2 border border-ink/24 px-2 py-1 text-sm"
              />
              <input
                name="servicioCantidadPersonalizada"
                type="number"
                min={1}
                defaultValue={1}
                className=" border border-ink/24 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => setFilasServicio((filas) => filas.filter((f) => f !== id))}
                className="text-neutral-400 hover:text-[#a63327] text-sm justify-self-end"
                aria-label="Quitar fila"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setFilasServicio((filas) => [...filas, siguienteIdServicio.current++])
          }
          className="mt-2 text-sm font-medium text-accent-text hover:text-accent-text"
        >
          + Agregar otro servicio
        </button>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink mb-2">Productos / materiales de inventario</h2>
        <div className="bg-paper border border-ink/16 divide-y divide-ink/10">
          {productos.map((producto) => (
            <div key={producto.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <input type="hidden" name="productoId" value={producto.id} />
                <p className="text-sm font-medium text-ink">{producto.nombre}</p>
                <p className="text-xs text-neutral-500">{formatCLP(producto.precioVenta.toString())}</p>
              </div>
              <input
                type="number"
                name="productoCantidad"
                min={0}
                defaultValue={0}
                className="w-20 border border-ink/24 px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink mb-2">Materiales externos (opcional)</h2>
        <div className="space-y-2">
          {filasMaterial.map((id) => (
            <div key={id} className="grid grid-cols-8 gap-2 items-center">
              <input
                name="materialNombrePersonalizado"
                placeholder="Nombre del material"
                className="col-span-3 border border-ink/24 px-2 py-1 text-sm"
              />
              <input
                name="materialCostoPersonalizado"
                type="number"
                min={0}
                placeholder="Costo"
                className="col-span-1 border border-ink/24 px-2 py-1 text-sm"
              />
              <input
                name="materialPrecioPersonalizado"
                type="number"
                min={0}
                placeholder="Precio a cobrar"
                className="col-span-2 border border-ink/24 px-2 py-1 text-sm"
              />
              <input
                name="materialCantidadPersonalizada"
                type="number"
                min={1}
                defaultValue={1}
                className=" border border-ink/24 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => setFilasMaterial((filas) => filas.filter((f) => f !== id))}
                className="text-neutral-400 hover:text-[#a63327] text-sm justify-self-end"
                aria-label="Quitar fila"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setFilasMaterial((filas) => [...filas, siguienteIdMaterial.current++])
          }
          className="mt-2 text-sm font-medium text-accent-text hover:text-accent-text"
        >
          + Agregar otro material
        </button>
      </div>

      <Field label="Observaciones (opcional)">
        <Textarea name="observaciones" rows={3} />
      </Field>

      {error && <p className="text-sm text-[#a63327]">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creando cotización..." : "Crear cotización"}
      </Button>
    </form>
  );
}
