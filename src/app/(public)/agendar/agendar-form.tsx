"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { crearSolicitudAgendamiento } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatHora, toDatetimeLocalValue } from "@/lib/format";
import type { Servicio } from "@prisma/client";

function hoyISO() {
  const hoy = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
}

export function AgendarForm({ servicios }: { servicios: Servicio[] }) {
  const [state, formAction, pending] = useActionState(crearSolicitudAgendamiento, undefined);
  const errors = state?.fieldErrors ?? {};

  const [nombreContacto, setNombreContacto] = useState("");
  const [email, setEmail] = useState("");
  const [patente, setPatente] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [servicioTexto, setServicioTexto] = useState("");
  const [dia, setDia] = useState(hoyISO());
  const [fechaPreferida, setFechaPreferida] = useState("");
  const [comentario, setComentario] = useState("");

  const [horarios, setHorarios] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const servicioRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (servicioRef.current) servicioRef.current.value = servicioTexto;
  }, [state, servicioTexto]);

  useEffect(() => {
    let cancelado = false;

    async function cargarHorarios() {
      if (!servicioTexto || servicioTexto === "Otro / no estoy seguro" || !dia) {
        setHorarios([]);
        return;
      }
      setCargandoHorarios(true);
      setFechaPreferida("");
      try {
        const r = await fetch(`/api/disponibilidad?fecha=${dia}&servicio=${encodeURIComponent(servicioTexto)}`);
        const data = await r.json();
        if (!cancelado) setHorarios(data.horarios ?? []);
      } catch {
        if (!cancelado) setHorarios([]);
      } finally {
        if (!cancelado) setCargandoHorarios(false);
      }
    }

    cargarHorarios();
    return () => {
      cancelado = true;
    };
  }, [servicioTexto, dia]);

  if (state?.success && state?.pendiente) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-6 text-center">
        <p className="font-medium">¡Solicitud recibida!</p>
        <p className="text-sm mt-1">
          Esa hora se ocupó justo ahora — quedó pendiente de confirmación, te contactaremos pronto.
        </p>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-6 text-center">
        <p className="font-medium">¡Hora confirmada!</p>
        <p className="text-sm mt-1">
          Te enviamos la confirmación por WhatsApp{state?.emailEnviado ? " y correo" : ""}. Te esperamos.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2 max-w-md">
      <Field label="Nombre completo" error={errors.nombreContacto}>
        <Input
          name="nombreContacto"
          required
          invalid={!!errors.nombreContacto}
          value={nombreContacto}
          onChange={(e) => setNombreContacto(e.target.value)}
        />
      </Field>
      <Field label="Teléfono" error={errors.telefono}>
        <PhoneInput name="telefono" required />
      </Field>
      <Field label="Email (opcional)" error={errors.email}>
        <Input
          name="email"
          type="email"
          invalid={!!errors.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Patente del vehículo" error={errors.patente}>
        <Input
          name="patente"
          required
          placeholder="AB1234"
          invalid={!!errors.patente}
          value={patente}
          onChange={(e) => setPatente(e.target.value.toUpperCase())}
        />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Marca (opcional)" error={errors.marca}>
          <Input
            name="marca"
            invalid={!!errors.marca}
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          />
        </Field>
        <Field label="Modelo (opcional)" error={errors.modelo}>
          <Input
            name="modelo"
            invalid={!!errors.modelo}
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />
        </Field>
        <Field label="Año (opcional)" error={errors.anio}>
          <Input
            name="anio"
            type="number"
            min={1950}
            max={2100}
            invalid={!!errors.anio}
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Servicio deseado" error={errors.servicioTexto}>
        <Select
          ref={servicioRef}
          name="servicioTexto"
          required
          invalid={!!errors.servicioTexto}
          value={servicioTexto}
          onChange={(e) => setServicioTexto(e.target.value)}
        >
          <option value="" disabled>
            Selecciona un servicio
          </option>
          {servicios.map((s) => (
            <option key={s.id} value={s.nombre}>
              {s.nombre}
            </option>
          ))}
          <option value="Otro / no estoy seguro">Otro / no estoy seguro</option>
        </Select>
      </Field>
      <Field label="Día">
        <Input
          type="date"
          min={hoyISO()}
          required
          value={dia}
          onChange={(e) => setDia(e.target.value)}
        />
      </Field>
      <Field label="Hora disponible" error={errors.fechaPreferida}>
        {servicioTexto === "Otro / no estoy seguro" ? (
          <p className="text-sm text-slate-500 py-2">
            Para servicios fuera del catálogo, contáctanos directo por WhatsApp para coordinar la hora.
          </p>
        ) : cargandoHorarios ? (
          <p className="text-sm text-slate-400 py-2">Buscando horarios disponibles…</p>
        ) : horarios.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">
            {servicioTexto ? "No hay horarios disponibles ese día, prueba otra fecha." : "Elige un servicio primero."}
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {horarios.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setFechaPreferida(h)}
                className={`text-sm rounded-md border py-1.5 ${
                  fechaPreferida === h
                    ? "bg-orange-600 text-white border-orange-600"
                    : "border-slate-200 text-slate-700 hover:border-orange-400"
                }`}
              >
                {formatHora(new Date(h))}
              </button>
            ))}
          </div>
        )}
        <input type="hidden" name="fechaPreferida" value={fechaPreferida ? toDatetimeLocalValue(new Date(fechaPreferida)) : ""} />
      </Field>
      <Field label="Comentario (opcional)" error={errors.comentario}>
        <Textarea
          name="comentario"
          rows={3}
          invalid={!!errors.comentario}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      </Field>
      {state?.formError && <p className="text-sm text-red-600">{state.formError}</p>}
      <Button type="submit" className="w-full" disabled={pending || !fechaPreferida}>
        {pending ? "Confirmando..." : "Confirmar hora"}
      </Button>
    </form>
  );
}
