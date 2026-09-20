"use client";

import { useActionState, useState } from "react";
import { guardarChecklist } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PUNTOS_CHECKLIST, POSICIONES_NEUMATICO, ESTADOS_CHECKLIST } from "@/lib/validations/checklist";
import { MapaCarroceria, type Dano } from "./mapa-carroceria";

type Estado = (typeof ESTADOS_CHECKLIST)[number];

type ItemState = { nombre: string; ayuda?: string; estado: Estado; observacion: string };
type PresionState = { posicion: string; recomendada: string; medida: string; estado: Estado };

type ChecklistGuardado = {
  kilometraje: number | null;
  observaciones: string | null;
  items: { nombre: string; estado: Estado; observacion: string | null }[];
  presiones: { posicion: string; recomendada: unknown; medida: unknown; estado: Estado }[];
  danos: { tipo: Dano["tipo"]; x: unknown; y: unknown; nota: string | null }[];
} | null;

const ESTADO_LABEL: Record<Estado, string> = { OK: "OK", VIDA_UTIL: "VIDA ÚTIL", CAMBIO: "CAMBIO" };
const ESTADO_COLOR: Record<Estado, string> = { OK: "#15803d", VIDA_UTIL: "#a16207", CAMBIO: "#b91c1c" };

function TriEstado({ valor, onChange }: { valor: Estado; onChange: (v: Estado) => void }) {
  return (
    <div className="flex gap-1">
      {ESTADOS_CHECKLIST.map((estado) => {
        const activo = valor === estado;
        return (
          <button
            key={estado}
            type="button"
            // Pulsar el estado ya activo lo limpia, volviendo a OK (el neutro).
            onClick={() => onChange(activo ? "OK" : estado)}
            className="min-w-[64px] h-7 rounded-sm text-[11px] font-semibold tracking-wide whitespace-nowrap border"
            style={
              activo
                ? { backgroundColor: ESTADO_COLOR[estado], borderColor: ESTADO_COLOR[estado], color: "white" }
                : { color: "#475569", borderColor: "#cbd5e1" }
            }
          >
            {ESTADO_LABEL[estado]}
          </button>
        );
      })}
    </div>
  );
}

export function ChecklistForm({
  ordenId,
  checklist,
  soloLectura = false,
}: {
  ordenId: string;
  checklist: ChecklistGuardado;
  soloLectura?: boolean;
}) {
  const [error, formAction, pending] = useActionState(guardarChecklist.bind(null, ordenId), undefined);

  const [kilometraje, setKilometraje] = useState(checklist?.kilometraje?.toString() ?? "");
  const [observaciones, setObservaciones] = useState(checklist?.observaciones ?? "");

  const [items, setItems] = useState<ItemState[]>(() =>
    PUNTOS_CHECKLIST.map((p) => {
      const existente = checklist?.items.find((i) => i.nombre === p.nombre);
      return {
        nombre: p.nombre,
        ayuda: p.ayuda,
        estado: existente?.estado ?? "OK",
        observacion: existente?.observacion ?? "",
      };
    })
  );

  const [presiones, setPresiones] = useState<PresionState[]>(() =>
    POSICIONES_NEUMATICO.map((pos) => {
      const existente = checklist?.presiones.find((p) => p.posicion === pos);
      return {
        posicion: pos,
        recomendada: existente?.recomendada != null ? String(existente.recomendada) : "",
        medida: existente?.medida != null ? String(existente.medida) : "",
        estado: existente?.estado ?? "OK",
      };
    })
  );

  const [danos, setDanos] = useState<Dano[]>(
    () => checklist?.danos.map((d) => ({ tipo: d.tipo, x: Number(d.x), y: Number(d.y), nota: d.nota ?? undefined })) ?? []
  );
  const [tipoActivo, setTipoActivo] = useState<Dano["tipo"]>("GOLPE");

  const revisados = items.filter((i) => i.estado !== "OK").length + presiones.filter((p) => p.estado !== "OK").length;
  const conCambio = items.filter((i) => i.estado === "CAMBIO").length + presiones.filter((p) => p.estado === "CAMBIO").length;
  const conVidaUtil = revisados - conCambio;

  function submit(formData: FormData) {
    const payload = {
      kilometraje: kilometraje ? Number(kilometraje) : undefined,
      observaciones: observaciones || undefined,
      items: items.map((i, orden) => ({
        nombre: i.nombre,
        estado: i.estado,
        observacion: i.observacion || undefined,
        orden,
      })),
      presiones: presiones.map((p, orden) => ({
        posicion: p.posicion,
        recomendada: p.recomendada ? Number(p.recomendada) : undefined,
        medida: p.medida ? Number(p.medida) : undefined,
        estado: p.estado,
        orden,
      })),
      danos: danos.map((d) => ({ tipo: d.tipo, x: d.x, y: d.y, nota: d.nota })),
    };
    formData.set("payload", JSON.stringify(payload));
    formAction(formData);
  }

  return (
    <form action={submit}>
      <fieldset disabled={soloLectura || pending} className="space-y-6">
        <div>
          <Field label="Kilometraje">
            <Input
              type="number"
              min={0}
              value={kilometraje}
              onChange={(e) => setKilometraje(e.target.value)}
              placeholder="Ej: 85000"
            />
          </Field>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Presiones de neumáticos (psi)</h3>
            <div className="space-y-2">
              {presiones.map((p, idx) => (
                <div key={p.posicion} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="flex-1 min-w-[140px] text-neutral-600">{p.posicion}</span>
                  <Input
                    className="w-[74px] text-center"
                    placeholder="Rec."
                    inputMode="decimal"
                    value={p.recomendada}
                    onChange={(e) =>
                      setPresiones((prev) => prev.map((x, i) => (i === idx ? { ...x, recomendada: e.target.value } : x)))
                    }
                  />
                  <Input
                    className="w-[74px] text-center"
                    placeholder="Med."
                    inputMode="decimal"
                    value={p.medida}
                    onChange={(e) =>
                      setPresiones((prev) => prev.map((x, i) => (i === idx ? { ...x, medida: e.target.value } : x)))
                    }
                  />
                  <TriEstado
                    valor={p.estado}
                    onChange={(v) => setPresiones((prev) => prev.map((x, i) => (i === idx ? { ...x, estado: v } : x)))}
                  />
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-ink mt-6 mb-3">Revisiones generales</h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.nombre} className="border-b border-ink/10 pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-medium text-ink">{item.nombre}</p>
                      {item.ayuda && <p className="text-[11.5px] text-neutral-400">{item.ayuda}</p>}
                    </div>
                    <TriEstado
                      valor={item.estado}
                      onChange={(v) => setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, estado: v } : x)))}
                    />
                  </div>
                  <Input
                    placeholder="Observación (opcional)"
                    value={item.observacion}
                    onChange={(e) =>
                      setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, observacion: e.target.value } : x)))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Mapa de carrocería</h3>
            <MapaCarroceria
              danos={danos}
              tipoActivo={tipoActivo}
              onTipoActivoChange={setTipoActivo}
              onAgregar={(x, y) => setDanos((prev) => [...prev, { tipo: tipoActivo, x, y }])}
              onEliminar={(index) => setDanos((prev) => prev.filter((_, i) => i !== index))}
              soloLectura={soloLectura}
            />

            <h3 className="text-sm font-semibold text-ink mt-6 mb-2">Observaciones generales</h3>
            <Textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={5}
              placeholder="Observaciones generales del ingreso..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink/16 pt-4">
          <p className="text-sm text-neutral-500">
            {revisados} de {items.length + presiones.length} puntos revisados · {conCambio} con cambio recomendado ·{" "}
            {conVidaUtil} con vida útil
          </p>
          {!soloLectura && (
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar checklist"}
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-accent-text">{error}</p>}
      </fieldset>
    </form>
  );
}
