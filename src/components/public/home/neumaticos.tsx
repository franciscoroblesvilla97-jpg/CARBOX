"use client";

import { useState } from "react";
import { formatCLP } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";

const ANCHOS = [155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275];
const PERFILES = [35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
const AROS = [13, 14, 15, 16, 17, 18, 19, 20];

type Resultado = {
  id: string;
  marca: string | null;
  nombre: string;
  indice: string | null;
  precioVenta: number;
  stockActual: number;
};

export function Neumaticos() {
  const [ancho, setAncho] = useState(195);
  const [perfil, setPerfil] = useState(65);
  const [aro, setAro] = useState(15);

  const [buscando, setBuscando] = useState(false);
  const [medidaBuscada, setMedidaBuscada] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  async function buscar() {
    setBuscando(true);
    try {
      const res = await fetch(`/api/neumaticos?ancho=${ancho}&perfil=${perfil}&aro=${aro}`);
      const data = await res.json();
      setMedidaBuscada(data.medida);
      setResultados(data.resultados ?? []);
    } finally {
      setBuscando(false);
    }
  }

  return (
    <section
      id="neumaticos"
      className="bg-surface px-4 sm:px-[27.2px] py-[40.8px] font-[family-name:var(--font-barlow)]"
    >
      <div className="grid gap-[27.2px] items-start [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] max-w-6xl mx-auto">
        <div>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] font-semibold uppercase text-[clamp(30px,3.6vw,42px)]">
            Neumáticos por medida
          </h2>
          <p className="text-[15px] text-neutral-600 mb-4">Elige tu medida y te mostramos stock y precio instalado.</p>
          <div className="grid grid-cols-3 gap-[10.2px]">
            <SelectMedida label="Ancho" value={ancho} onChange={setAncho} opciones={ANCHOS} />
            <SelectMedida label="Perfil" value={perfil} onChange={setPerfil} opciones={PERFILES} />
            <SelectMedida label="Aro" value={aro} onChange={setAro} opciones={AROS} prefix="R" />
          </div>
          <button
            type="button"
            onClick={buscar}
            className="mt-[10.2px] w-full bg-ink hover:bg-[#2c455d] text-paper font-[family-name:var(--font-barlow-condensed)] font-semibold text-[16px] tracking-[0.06em] uppercase py-[13.6px] transition-colors"
          >
            Buscar {ancho}/{perfil} R{aro}
          </button>
        </div>

        <div>
          {medidaBuscada && (
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[28px] text-accent-text">
                  {medidaBuscada}
                </p>
                <p className="text-[13px] text-neutral-500">
                  {resultados.length} opciones · precio unitario instalado
                </p>
              </div>
            </div>
          )}

          {buscando ? (
            <p className="text-[15px] text-neutral-500">Buscando…</p>
          ) : medidaBuscada && resultados.length === 0 ? (
            <div className="border border-ink/16 bg-paper p-6 text-center">
              <p className="text-[15px] text-neutral-600 mb-3">
                No tenemos esa medida en stock — consúltanos y la traemos
              </p>
              <a
                href={whatsappUrl(`Hola Carbox, quiero consultar por neumáticos. Mi medida es ${medidaBuscada}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-accent hover:bg-accent-hover text-paper font-[family-name:var(--font-barlow-condensed)] font-semibold text-[15px] tracking-[0.06em] uppercase px-5 py-3 transition-colors"
              >
                Consultar por WhatsApp
              </a>
            </div>
          ) : resultados.length > 0 ? (
            <div className="border border-ink/16 bg-paper divide-y divide-ink/10">
              {resultados.slice(0, 5).map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-[13.6px]">
                  <div>
                    {r.marca && (
                      <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500">
                        {r.marca}
                      </p>
                    )}
                    <p className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[21px]">
                      {r.nombre}
                    </p>
                    <p className="text-[13px] text-neutral-600">
                      {medidaBuscada}
                      {r.indice ? ` ${r.indice}` : ""} · {r.stockActual} en stock
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-[family-name:var(--font-barlow-condensed)] font-semibold text-[22px]">
                      {formatCLP(r.precioVenta)}
                    </p>
                    <a
                      href={whatsappUrl(
                        `Hola Carbox, quiero cotizar neumáticos ${[r.marca, r.nombre, medidaBuscada].filter(Boolean).join(" ")} instalados.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-accent hover:bg-accent-hover text-paper font-[family-name:var(--font-barlow-condensed)] font-semibold text-[15px] tracking-[0.06em] uppercase px-4 py-[10px] transition-colors"
                    >
                      Cotizar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-neutral-500">Elige una medida y presiona buscar.</p>
          )}

          <div className="mt-[13.6px] flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-neutral-500">Precio unitario instalado, con montaje y balanceo.</p>
            <a
              href={whatsappUrl("Hola Carbox, quiero consultar por neumáticos. Mi medida es ")}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-ink/28 hover:border-ink font-[family-name:var(--font-barlow-condensed)] font-semibold text-[14px] tracking-[0.06em] uppercase px-4 py-[10px] transition-colors"
            >
              Consultar cualquier medida
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectMedida({
  label,
  value,
  onChange,
  opciones,
  prefix = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  opciones: number[];
  prefix?: string;
}) {
  return (
    <div>
      <span className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-600 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-[10.2px] py-[13.6px] border border-ink/24 bg-paper text-[16px] font-medium focus:outline-2 focus:outline-accent focus:outline-offset-2"
      >
        {opciones.map((o) => (
          <option key={o} value={o}>
            {prefix}
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
