"use client";

import { useActionState, useMemo, useState } from "react";
import { analizarFactura, confirmarImportacion } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { CATEGORIAS_PRODUCTO, CATEGORIA_LABEL } from "@/lib/validations/inventario";
import type { LineaFacturaExtraida } from "@/lib/facturaOcr";

type ProductoExistente = { id: string; nombre: string; sku: string | null };

type Fila = {
  productoId: string | null;
  nombre: string;
  sku: string;
  categoria: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
};

function coincidenciaAutomatica(linea: LineaFacturaExtraida, productos: ProductoExistente[]) {
  if (linea.sku) {
    const porSku = productos.find((p) => p.sku && p.sku.toLowerCase() === linea.sku!.toLowerCase());
    if (porSku) return porSku.id;
  }
  const porNombre = productos.find((p) => p.nombre.toLowerCase() === linea.nombre.toLowerCase());
  return porNombre?.id ?? null;
}

export function ImportarForm({ productos }: { productos: ProductoExistente[] }) {
  const [analisis, analizarAction, analizando] = useActionState(analizarFactura, undefined);
  const [confirmError, confirmarAction, confirmando] = useActionState(confirmarImportacion, undefined);
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [fotosUrl, setFotosUrl] = useState<string[]>([]);

  const filasListas = useMemo(() => {
    if (filas) return filas;
    if (analisis && "lineas" in analisis) {
      return analisis.lineas.map((l) => ({
        productoId: coincidenciaAutomatica(l, productos),
        nombre: l.nombre,
        sku: l.sku ?? "",
        categoria: l.categoriaSugerida,
        unidad: "unidad",
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario ?? 0,
      }));
    }
    return null;
  }, [filas, analisis, productos]);

  if (analisis && "lineas" in analisis && !filas) {
    setFilas(filasListas);
    setFotosUrl(analisis.fotosUrl);
  }

  function actualizarFila(index: number, cambios: Partial<Fila>) {
    setFilas((prev) => prev!.map((f, i) => (i === index ? { ...f, ...cambios } : f)));
  }

  if (!filasListas) {
    return (
      <form action={analizarAction} className="max-w-md space-y-2">
        <Field label="Foto(s) de la guía o factura">
          <Input type="file" name="fotos" accept="image/*" capture="environment" multiple required />
        </Field>
        {analisis && "error" in analisis && <p className="text-sm text-[#a63327]">{analisis.error}</p>}
        <Button type="submit" disabled={analizando}>
          {analizando ? "Leyendo foto..." : "Analizar factura"}
        </Button>
      </form>
    );
  }

  return (
    <form action={confirmarAction} className="space-y-4">
      <input type="hidden" name="lineas" value={JSON.stringify(filasListas)} />
      <input type="hidden" name="fotosUrl" value={fotosUrl.join(",")} />

      <p className="text-sm text-neutral-500">
        Revisa y corrige antes de guardar. Los productos nuevos quedan con precio de venta en $0 — recuerda
        editarlo después.
      </p>

      <div className="bg-paper border border-ink/16 divide-y divide-ink/10">
        {filasListas.map((fila, i) => (
          <div key={i} className="p-3 grid grid-cols-6 gap-2 items-end">
            <div className="col-span-2">
              <Field label="Vincular a">
                <Select
                  value={fila.productoId ?? ""}
                  onChange={(e) => actualizarFila(i, { productoId: e.target.value || null })}
                >
                  <option value="">Crear producto nuevo</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Nombre">
                <Input value={fila.nombre} onChange={(e) => actualizarFila(i, { nombre: e.target.value })} />
              </Field>
            </div>
            <Field label="Categoría">
              <Select value={fila.categoria} onChange={(e) => actualizarFila(i, { categoria: e.target.value })}>
                {CATEGORIAS_PRODUCTO.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_LABEL[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="SKU">
              <Input value={fila.sku} onChange={(e) => actualizarFila(i, { sku: e.target.value })} />
            </Field>
            <Field label="Cantidad">
              <Input
                type="number"
                min={1}
                value={fila.cantidad}
                onChange={(e) => actualizarFila(i, { cantidad: Number(e.target.value) || 1 })}
              />
            </Field>
            <Field label="Costo unitario">
              <Input
                type="number"
                min={0}
                value={fila.precioUnitario}
                onChange={(e) => actualizarFila(i, { precioUnitario: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>
        ))}
      </div>

      {confirmError && <p className="text-sm text-[#a63327]">{confirmError}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setFilas(null);
            setFotosUrl([]);
          }}
        >
          Volver a analizar
        </Button>
        <Button type="submit" disabled={confirmando}>
          {confirmando ? "Guardando..." : "Confirmar importación"}
        </Button>
      </div>
    </form>
  );
}
