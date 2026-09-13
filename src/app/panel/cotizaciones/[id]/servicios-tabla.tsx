"use client";

import { useActionState, useTransition } from "react";
import { actualizarDescuentoServicio, eliminarServicioDeCotizacion } from "../actions";
import { Badge } from "@/components/ui/badge";
import { formatCLP } from "@/lib/format";
import { DESCUENTO_MAXIMO } from "@/lib/validations/cotizacion";
import type { CotizacionServicio, Servicio } from "@prisma/client";

type Linea = CotizacionServicio & { servicio: Servicio | null };

function FilaServicio({
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
  const accionDescuento = actualizarDescuentoServicio.bind(null, cotizacionId, linea.id);
  const [error, formAction, pending] = useActionState(accionDescuento, undefined);
  const [eliminando, startTransition] = useTransition();

  const subtotal = Number(linea.precioCobrado) * linea.cantidad;
  const descuentoActual = Number(linea.descuento);
  const total = subtotal * (1 - descuentoActual / 100);

  return (
    <>
      <tr>
        <td className="py-2">
          {linea.servicio?.nombre ?? linea.nombrePersonalizado}
          {!linea.servicioId && <Badge color="blue">Personalizado</Badge>}
        </td>
        <td className="py-2 text-right text-slate-500">x{linea.cantidad}</td>
        <td className="py-2 text-right text-slate-500">{formatCLP(subtotal)}</td>
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
                className="w-16 rounded-md border border-slate-300 px-1.5 py-0.5 text-xs text-right"
              />
              <span className="text-xs text-slate-400">%</span>
              <button
                type="submit"
                disabled={pending}
                className="text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
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
              onClick={() => startTransition(() => eliminarServicioDeCotizacion(cotizacionId, linea.id))}
              className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-50"
            >
              Quitar
            </button>
          </td>
        )}
      </tr>
      {error && (
        <tr>
          <td colSpan={columnas} className="pb-2 text-xs text-red-600">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}

export function ServiciosTabla({
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
        <tr className="text-left text-xs text-slate-400">
          <th className="py-1 font-normal">Servicio</th>
          <th className="py-1 font-normal text-right">Cant.</th>
          <th className="py-1 font-normal text-right">Subtotal</th>
          <th className="py-1 font-normal text-right">Descuento</th>
          <th className="py-1 font-normal text-right">Total</th>
          {editable && <th className="py-1"></th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {lineas.map((linea) => (
          <FilaServicio key={linea.id} linea={linea} cotizacionId={cotizacionId} editable={editable} columnas={columnas} />
        ))}
        {lineas.length === 0 && (
          <tr>
            <td colSpan={columnas} className="py-2 text-slate-400">
              Sin servicios.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
