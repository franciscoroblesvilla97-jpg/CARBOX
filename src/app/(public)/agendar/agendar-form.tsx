"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { crearSolicitudAgendamiento } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { proximaHoraDisponible, toDatetimeLocalValue } from "@/lib/format";
import type { Servicio } from "@prisma/client";

export function AgendarForm({ servicios }: { servicios: Servicio[] }) {
  const [state, formAction, pending] = useActionState(crearSolicitudAgendamiento, undefined);
  const errors = state?.fieldErrors ?? {};

  // Se calcula una sola vez al montar el formulario: no tiene sentido recalcularla
  // en cada render mientras la persona completa el resto de los datos.
  const [minFecha] = useState(() => toDatetimeLocalValue(proximaHoraDisponible()));

  const [nombreContacto, setNombreContacto] = useState("");
  const [email, setEmail] = useState("");
  const [patente, setPatente] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [servicioTexto, setServicioTexto] = useState("");
  const [fechaPreferida, setFechaPreferida] = useState(minFecha);
  const [comentario, setComentario] = useState("");

  // Tras un envío fallido, React ejecuta un reset nativo del <form>. A diferencia de los
  // <input> controlados, el <select> no queda protegido de ese reset, así que lo
  // resincronizamos manualmente con el estado de React cada vez que la acción responde.
  const servicioRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (servicioRef.current) servicioRef.current.value = servicioTexto;
  }, [state, servicioTexto]);

  if (state?.success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-6 text-center">
        <p className="font-medium">¡Solicitud enviada!</p>
        <p className="text-sm mt-1">Te contactaremos pronto para confirmar tu hora.</p>
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
      <Field label="Fecha y hora preferida" error={errors.fechaPreferida}>
        <Input
          name="fechaPreferida"
          type="datetime-local"
          min={minFecha}
          required
          invalid={!!errors.fechaPreferida}
          value={fechaPreferida}
          onChange={(e) => setFechaPreferida(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-400">Hora más próxima disponible.</p>
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
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Solicitar hora"}
      </Button>
    </form>
  );
}
