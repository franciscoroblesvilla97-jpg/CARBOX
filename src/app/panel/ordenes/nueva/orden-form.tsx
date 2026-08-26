"use client";

import { useActionState, useMemo, useState } from "react";
import { crearOrdenTrabajo } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatCLP, toDatetimeLocalValue } from "@/lib/format";
import type { Vehiculo, Cliente, Servicio, Producto, Trabajador } from "@prisma/client";

type VehiculoConCliente = Vehiculo & { cliente: Cliente };
type PuestoConServicioIds = { id: string; nombre: string; servicioIds: string[] };

export function OrdenForm({
  vehiculos,
  servicios,
  productos,
  trabajadores,
  puestos,
}: {
  vehiculos: VehiculoConCliente[];
  servicios: Servicio[];
  productos: Producto[];
  trabajadores: Trabajador[];
  puestos: PuestoConServicioIds[];
}) {
  const [error, formAction, pending] = useActionState(crearOrdenTrabajo, undefined);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [fechaProgramada] = useState(() => toDatetimeLocalValue(new Date()));

  const servicioIdsSeleccionados = useMemo(
    () => Object.entries(cantidades).filter(([, c]) => c > 0).map(([id]) => id),
    [cantidades]
  );

  const duracionEstimada = useMemo(
    () =>
      servicios.reduce((acc, s) => acc + (cantidades[s.id] ?? 0) * s.duracionMinutos, 0),
    [servicios, cantidades]
  );

  const puestosDisponibles = useMemo(() => {
    if (servicioIdsSeleccionados.length === 0) return puestos;
    return puestos.filter((p) => servicioIdsSeleccionados.every((id) => p.servicioIds.includes(id)));
  }, [puestos, servicioIdsSeleccionados]);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <Field label="Vehículo">
        <Select name="vehiculoId" required defaultValue="">
          <option value="" disabled>
            Selecciona un vehículo
          </option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.patente} — {v.marca || v.modelo ? `${v.marca ?? ""} ${v.modelo ?? ""}`.trim() : "sin marca/modelo"} (
              {v.cliente.nombre})
            </option>
          ))}
        </Select>
      </Field>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Servicios</h2>
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
                onChange={(e) =>
                  setCantidades((prev) => ({ ...prev, [servicio.id]: Number(e.target.value) || 0 }))
                }
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
          ))}
          {servicios.length === 0 && <p className="px-3 py-4 text-sm text-slate-400">No hay servicios activos.</p>}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Productos / materiales</h2>
        <div className="bg-white rounded-md border border-slate-200 divide-y divide-slate-100">
          {productos.map((producto) => (
            <div key={producto.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <input type="hidden" name="productoId" value={producto.id} />
                <p className="text-sm font-medium text-slate-800">{producto.nombre}</p>
                <p className="text-xs text-slate-500">
                  Stock: {producto.stockActual} {producto.unidad} · {formatCLP(producto.precioVenta.toString())}
                </p>
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
          {productos.length === 0 && <p className="px-3 py-4 text-sm text-slate-400">No hay productos registrados.</p>}
        </div>
      </div>

      <Field label="Fecha y hora programada">
        <Input name="fechaProgramada" type="datetime-local" defaultValue={fechaProgramada} required />
        {duracionEstimada > 0 && (
          <p className="mt-1 text-xs text-slate-400">Duración estimada: {duracionEstimada} min.</p>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Trabajador asignado (opcional)">
          <Select name="trabajadorId" defaultValue="">
            <option value="">Sin asignar</option>
            {trabajadores.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Puesto asignado (opcional)">
          <Select name="puestoId" defaultValue="">
            <option value="">Sin asignar</option>
            {puestosDisponibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
          {servicioIdsSeleccionados.length > 0 && puestosDisponibles.length === 0 && (
            <p className="mt-1 text-sm text-red-600">Ningún puesto activo puede realizar todos los servicios elegidos.</p>
          )}
          {servicioIdsSeleccionados.length > 0 && puestosDisponibles.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">Solo se muestran los puestos que pueden hacer todos los servicios seleccionados.</p>
          )}
        </Field>
      </div>

      <Field label="Observaciones (opcional)">
        <Textarea name="observaciones" rows={3} />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creando orden..." : "Crear orden de trabajo"}
      </Button>
    </form>
  );
}
