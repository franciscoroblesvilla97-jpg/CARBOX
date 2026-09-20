"use client";

import { useActionState, useTransition } from "react";
import { actualizarDescuentoProducto, eliminarProductoDeCotizacion } from "../actions";
import { Badge } from "@/components/ui/badge";
import { formatCLP } from "@/lib/format";
import { DESCUENTO_MAXIMO } from "@/lib/validations/cotizacion";
import type { CotizacionProducto } from "@prisma/client";

type Linea = Omit<CotizacionProducto, "precioUnitario" | "costoUnitario" | "descuento"> & {
  precioUnitario: number;
  costoUnitario: number;
  descuento: number;
  producto: { id: string; nombre: string } | null;
};

function FilaProducto({
  linea,
  cotizacionId,
  editable,
  columnas,
}: {
  linea: Linea;
  cotizacionId: string;
  editable: boolean;
  columnas: number;
}) {
  const accionDescuento = actualizarDescuentoProducto.bind(null, cotizacionId, linea.id);
  const [error, formAction, pending] = useActionState(accionDescuento, undefined);
  const [eliminando, startTransition] = useTransition();

  const subtotal = Number(linea.precioUnitario) * linea.cantidad;
  const descuentoActual = Number(linea.descuento);
  const total = subtotal * (1 - descuentoActual / 100);

  return (
    <>
      <tr>
        <td className="py-2">
          {linea.producto?.nombre ?? linea.nombrePersonalizado}
          {!linea.productoId && <Badge color="blue">Externo</Badge>}
        </td>
        <td className="py-2 text-right text-neutral-500">x{linea.cantidad}</td>
        <td className="py-2 text-right text-neutral-500">{formatCLP(subtotal)}</td>
        <td className="py-2 text-right">
          {editable ? (
            <form action={formAction} className="flex items-center justify-end gap-1">
              <input
                type="number"
                name="descuento"
                min={0}
                max={DESCUENTO_MAXIMO}
                step="1"
                defaultValue={descuentoActual || ""}
                placeholder="0"
                title={`Máximo ${DESCUENTO_MAXIMO}%`}
                className="w-16 border border-ink/24 px-1.5 py-0.5 text-xs text-right"
              />
              <span className="text-xs text-neutral-400">%</span>
              <button
                type="submit"
                disabled={pending}
                className="text-xs font-medium text-accent-text hover:underline disabled:opacity-50"
              >
                {pending ? "..." : "Guardar"}
              </button>
            </form>
          ) : (
            `${descuentoActual}%`
          )}
        </td>
        <td className="py-2 text-right font-medium">{formatCLP(total)}</td>
        {editable && (
          <td className="py-2 text-right">
            <button
              type="button"
              disabled={eliminando}
              onClick={() => startTransition(() => eliminarProductoDeCotizacion(cotizacionId, linea.id))}
              className="text-xs text-neutral-400 hover:text-[#a63327] disabled:opacity-50"
            >
              Quitar
            </button>
          </td>
        )}
      </tr>
      {error && (
        <tr>
          <td colSpan={columnas} className="pb-2 text-xs text-[#a63327]">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}

export function ProductosTabla({
  lineas,
  cotizacionId,
  editable,
}: {
  lineas: Linea[];
  cotizacionId: string;
  editable: boolean;
}) {
  const columnas = editable ? 6 : 5;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-neutral-400">
          <th className="py-1 font-normal">Producto / material</th>
          <th className="py-1 font-normal text-right">Cant.</th>
          <th className="py-1 font-normal text-right">Subtotal</th>
          <th className="py-1 font-normal text-right">Descuento</th>
          <th className="py-1 font-normal text-right">Total</th>
          {editable && <th className="py-1"></th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-ink/10">
        {lineas.map((linea) => (
          <FilaProducto key={linea.id} linea={linea} cotizacionId={cotizacionId} editable={editable} columnas={columnas} />
        ))}
        {lineas.length === 0 && (
          <tr>
            <td colSpan={columnas} className="py-2 text-neutral-400">
              Sin productos.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
