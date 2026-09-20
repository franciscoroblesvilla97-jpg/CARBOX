"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { crearSolicitudCotizador } from "@/app/(public)/agendar/actions";
import { formatCLP } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { proximosDiasHabiles } from "@/lib/dias-habiles";
import { CornerFrame } from "./corner-frame";

type ServicioLite = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioBase: number;
  duracionMinutos: number;
};

const DIAS_ABREV = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES_ABREV = [
  "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic",
];

function extraerDigitosTelefono(valor: string) {
  return valor.replace(/\D/g, "").slice(0, 8);
}

export function Cotizador({ servicios }: { servicios: ServicioLite[] }) {
  const [state, formAction, pending] = useActionState(crearSolicitudCotizador, undefined);

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(() => {
    const porDefecto = servicios.find((s) => s.nombre === "Cambio de aceite");
    return new Set(porDefecto ? [porDefecto.id] : []);
  });

  const [patente, setPatente] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [nombreContacto, setNombreContacto] = useState("");
  const [email, setEmail] = useState("");
  const [digitosTelefono, setDigitosTelefono] = useState("");
  const telefono = digitosTelefono ? `+569${digitosTelefono}` : "";

  const diasHabiles = useMemo(() => proximosDiasHabiles(7), []);
  const [dia, setDia] = useState(diasHabiles[0]?.iso ?? "");
  const [hora, setHora] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const serviciosSeleccionados = servicios.filter((s) => seleccionados.has(s.id));
  const total = serviciosSeleccionados.reduce((acc, s) => acc + s.precioBase, 0);
  const duracionTotal = Math.max(
    serviciosSeleccionados.reduce((acc, s) => acc + s.duracionMinutos, 0),
    30
  );

  useEffect(() => {
    async function cargarHorarios() {
      if (!dia || seleccionados.size === 0) {
        setHorarios([]);
        setHora(null);
        return;
      }
      setCargandoHorarios(true);
      try {
        const res = await fetch(`/api/disponibilidad?fecha=${dia}&duracion=${duracionTotal}`);
        const data = await res.json();
        setHorarios(data.horarios ?? []);
        setHora((actual) => (actual && data.horarios?.includes(actual) ? actual : null));
      } finally {
        setCargandoHorarios(false);
      }
    }
    cargarHorarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia, duracionTotal]);

  function toggleServicio(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const vehiculoTexto = patente ? [patente, marca, modelo, anio].filter(Boolean).join(" ") : "";

  const resumenPasos = {
    1: seleccionados.size > 0 ? `${seleccionados.size} seleccionado${seleccionados.size > 1 ? "s" : ""}` : "Sin seleccionar",
    2: vehiculoTexto || "Completa los datos del vehículo",
    3: dia && hora ? formatearDiaHora(dia, hora) : "Elige un día y hora",
  };

  const mensajeCotizacion = `Hola Carbox, quiero cotizar: ${serviciosSeleccionados.map((s) => s.nombre).join(", ") || "un servicio"} para ${vehiculoTexto || "mi vehículo"}.`;
  const mensajeConfirmacion = dia && hora
    ? `Hola Carbox, quiero agendar ${serviciosSeleccionados.map((s) => s.nombre).join(", ")} para ${vehiculoTexto} el ${formatearDiaHora(dia, hora)}. ${nombreContacto} ${telefono}`.trim()
    : mensajeCotizacion;

  if (state?.success) {
    return (
      <section id="cotizar" className="px-4 sm:px-[27.2px] py-[40.8px] bg-paper font-[family-name:var(--font-barlow)]">
        <div className="max-w-xl mx-auto text-center border border-ink/16 p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[28px] uppercase">
            {state.pendiente ? "Quedó pendiente" : "¡Hora confirmada!"}
          </h2>
          <p className="mt-3 text-neutral-600">
            {state.pendiente
              ? "Esa hora se ocupó justo ahora. Recibimos tu solicitud y te contactaremos para coordinar otra."
              : "Te enviamos la confirmación por WhatsApp. Te esperamos en Pedro de Valdivia 525."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="cotizar" className="px-4 sm:px-[27.2px] py-[40.8px] bg-paper font-[family-name:var(--font-barlow)]">
      <form action={formAction} className="max-w-6xl mx-auto">
        {seleccionados.size > 0 &&
          [...seleccionados].map((id) => <input key={id} type="hidden" name="servicioIds" value={id} />)}
        <input type="hidden" name="patente" value={patente} />
        <input type="hidden" name="marca" value={marca} />
        <input type="hidden" name="modelo" value={modelo} />
        <input type="hidden" name="anio" value={anio} />
        <input type="hidden" name="nombreContacto" value={nombreContacto} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="telefono" value={telefono} />
        <input type="hidden" name="fechaPreferida" value={dia && hora ? hora : ""} />

        {/* Barra de pasos */}
        <div className="flex flex-wrap border border-ink/16 mb-[27.2px]">
          {([1, 2, 3] as const).map((n) => {
            const titulos = { 1: "¿Qué necesita tu auto?", 2: "Tu vehículo", 3: "Elige tu hora" };
            const activo = paso === n;
            return (
              <button
                type="button"
                key={n}
                onClick={() => setPaso(n)}
                className={`flex-1 min-w-[200px] flex items-center gap-3 px-4 py-[13.6px] text-left transition-colors ${
                  activo ? "bg-accent-tint shadow-[inset_0_-3px_0_var(--color-accent)]" : "bg-paper"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-8 h-8 shrink-0 font-[family-name:var(--font-barlow-condensed)] font-semibold ${
                    activo ? "bg-accent text-paper" : "border border-ink/20 text-neutral-500"
                  }`}
                >
                  {String(n).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-[family-name:var(--font-barlow-condensed)] font-semibold text-[19px] uppercase">
                    {titulos[n]}
                  </span>
                  <span className="block text-[13px] text-neutral-600">{resumenPasos[n]}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-[27.2px] items-start [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          <div>
            {paso === 1 && (
              <div>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[32px] uppercase">
                  ¿Qué necesita tu auto?
                </h2>
                <p className="text-[15px] text-neutral-600 mb-4">Puedes marcar más de uno. Precios base de taller.</p>
                <div className="grid gap-[10.2px] [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
                  {servicios.map((s) => {
                    const marcado = seleccionados.has(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleServicio(s.id)}
                        className={`text-left p-4 border transition-colors ${
                          marcado ? "bg-accent-tint border-accent" : "bg-paper border-ink/16"
                        }`}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[20px]">
                            {s.nombre}
                          </span>
                          <span
                            className={`shrink-0 w-5 h-5 flex items-center justify-center text-[11px] text-paper ${
                              marcado ? "bg-accent" : "border border-ink/30"
                            }`}
                          >
                            {marcado ? "×" : ""}
                          </span>
                        </span>
                        {s.descripcion && <span className="block text-[13px] text-neutral-600 mt-1">{s.descripcion}</span>}
                        <span className="flex items-baseline gap-2 mt-2">
                          <span className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[18px] text-accent-text">
                            {s.precioBase > 0 ? formatCLP(s.precioBase) : "Consultar"}
                          </span>
                          <span className="text-[12px] uppercase text-neutral-500">{s.duracionMinutos} min</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {paso === 2 && (
              <div>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[32px] uppercase">
                  Tu vehículo
                </h2>
                <p className="text-[15px] text-neutral-600 mb-4">
                  Con la patente completamos marca, modelo y medida de neumático en el taller.
                </p>
                <div className="grid gap-[13.6px] [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                  <CampoTexto
                    label="Patente"
                    value={patente}
                    onChange={(v) => setPatente(v.toUpperCase())}
                    placeholder="AB1234"
                  />
                  <CampoTexto label="Marca" value={marca} onChange={setMarca} placeholder="Chevrolet" />
                  <CampoTexto label="Modelo" value={modelo} onChange={setModelo} placeholder="Sail" />
                  <CampoTexto label="Año" value={anio} onChange={setAnio} placeholder="2018" type="number" />
                </div>
                <div className="grid gap-[13.6px] mt-[13.6px] sm:grid-cols-2">
                  <CampoTexto
                    label="Nombre"
                    value={nombreContacto}
                    onChange={setNombreContacto}
                    placeholder="Nombre"
                  />
                  <div>
                    <span className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-600 mb-1">
                      Teléfono
                    </span>
                    <div className="flex">
                      <span className="flex items-center px-[10.2px] py-[13.6px] bg-paper border border-r-0 border-ink/24 text-[16px] text-neutral-500">
                        +569
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={8}
                        placeholder="12345678"
                        value={digitosTelefono}
                        onChange={(e) => setDigitosTelefono(extraerDigitosTelefono(e.target.value))}
                        className="w-full px-[10.2px] py-[13.6px] border border-ink/24 bg-paper text-[16px] font-medium focus:outline-2 focus:outline-accent focus:outline-offset-2"
                      />
                    </div>
                  </div>
                  <CampoTexto
                    label="Email (opcional)"
                    value={email}
                    onChange={setEmail}
                    placeholder="tucorreo@ejemplo.com"
                    type="email"
                  />
                </div>
              </div>
            )}

            {paso === 3 && (
              <div>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[32px] uppercase">
                  Elige tu hora
                </h2>
                <p className="text-[15px] text-neutral-600 mb-4">
                  Bloques de 30 min, lunes a viernes 09:00–18:00 y sábado 09:00–14:00, según puestos libres. Tu
                  servicio ocupa {duracionTotal} min.
                </p>
                <div className="flex flex-wrap gap-[10.2px] mb-[20.4px] overflow-x-auto">
                  {diasHabiles.map((d) => {
                    const activo = dia === d.iso;
                    return (
                      <button
                        type="button"
                        key={d.iso}
                        onClick={() => setDia(d.iso)}
                        className={`min-w-[76px] flex flex-col items-center px-[13.6px] py-[10.2px] ${
                          activo ? "bg-accent text-paper" : "bg-paper border border-ink/20 text-ink"
                        }`}
                      >
                        <span className="text-[11px] uppercase tracking-[0.14em]">
                          {d.esHoy ? "Hoy" : DIAS_ABREV[d.fecha.getDay()]}
                        </span>
                        <span className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[24px]">
                          {d.fecha.getDate()}
                        </span>
                        <span className="text-[11px]">{MESES_ABREV[d.fecha.getMonth()]}</span>
                      </button>
                    );
                  })}
                </div>
                {cargandoHorarios ? (
                  <p className="text-[15px] text-neutral-500">Buscando horarios disponibles…</p>
                ) : horarios.length === 0 ? (
                  <p className="text-[15px] text-neutral-500">No hay horas libres ese día. Prueba otro día.</p>
                ) : (
                  <div className="grid gap-[10.2px] [grid-template-columns:repeat(auto-fill,minmax(100px,1fr))]">
                    {horarios.map((h) => {
                      const activo = hora === h;
                      return (
                        <button
                          type="button"
                          key={h}
                          onClick={() => setHora(h)}
                          className={`py-[11px] px-[6px] text-[15px] tracking-[0.06em] text-center ${
                            activo ? "bg-accent text-paper" : "bg-paper border border-ink/20 text-ink"
                          }`}
                        >
                          {formatearHora(h)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel de resumen */}
          <CornerFrame className="p-6 bg-paper sm:sticky sm:top-24">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-600 mb-3">Resumen</p>
            {serviciosSeleccionados.length === 0 ? (
              <p className="text-[15px] text-neutral-500">Sin servicios seleccionados.</p>
            ) : (
              <ul className="space-y-1">
                {serviciosSeleccionados.map((s) => (
                  <li key={s.id} className="flex justify-between text-[15px]">
                    <span>{s.nombre}</span>
                    <span className="text-neutral-600">{s.precioBase > 0 ? formatCLP(s.precioBase) : "Consultar"}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[13px] text-neutral-500 mt-3">
              {vehiculoTexto || "Vehículo por completar en el paso 2"}
            </p>
            <div className="border-t border-ink/16 mt-4 pt-4">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-600">Total estimado</p>
              <p className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[38px]">
                {serviciosSeleccionados.length === 0 ? "—" : formatCLP(total)}
              </p>
            </div>
            {dia && hora && (
              <p className="text-accent-text text-[14px] mt-2">
                {formatearDiaHora(dia, hora)} · {duracionTotal} min en taller
              </p>
            )}

            {state?.fieldErrors && (
              <ul className="mt-3 text-[13px] text-red-600">
                {Object.values(state.fieldErrors).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}

            <div className="mt-5 space-y-[10.2px]">
              {paso < 3 ? (
                <button
                  type="button"
                  onClick={() => setPaso((p) => (p === 1 ? 2 : 3))}
                  disabled={paso === 1 ? seleccionados.size === 0 : !patente}
                  className="w-full bg-accent hover:bg-accent-hover disabled:opacity-45 disabled:cursor-not-allowed text-paper font-[family-name:var(--font-barlow-condensed)] font-semibold text-[16px] tracking-[0.06em] uppercase py-[14px] transition-colors"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={pending || !hora || !patente || !nombreContacto || !telefono}
                  className="w-full bg-accent hover:bg-accent-hover disabled:opacity-45 disabled:cursor-not-allowed text-paper font-[family-name:var(--font-barlow-condensed)] font-semibold text-[16px] tracking-[0.06em] uppercase py-[14px] transition-colors"
                >
                  {pending ? "Confirmando…" : "Confirmar hora"}
                </button>
              )}
              <a
                href={whatsappUrl(mensajeConfirmacion)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center border border-ink/28 hover:border-ink font-[family-name:var(--font-barlow-condensed)] font-semibold text-[16px] tracking-[0.06em] uppercase py-[14px] transition-colors"
              >
                Prefiero WhatsApp
              </a>
            </div>
            <p className="text-[12px] text-neutral-500 mt-3">
              Valor referencial sobre precio base. Repuestos se confirman según vehículo.
            </p>
          </CornerFrame>
        </div>
      </form>
    </section>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <span className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-600 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-[10.2px] py-[13.6px] border border-ink/24 bg-paper text-[16px] font-medium focus:outline-2 focus:outline-accent focus:outline-offset-2"
      />
    </div>
  );
}

function formatearHora(iso: string) {
  return new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function formatearDiaHora(diaISO: string, horaISO: string) {
  const fecha = new Date(`${diaISO}T00:00:00`);
  const dia = DIAS_ABREV[fecha.getDay()];
  return `${dia} ${fecha.getDate()} ${MESES_ABREV[fecha.getMonth()]} · ${formatearHora(horaISO)}`;
}
