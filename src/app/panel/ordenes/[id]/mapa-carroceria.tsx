"use client";

import { zonaDesdeCoordenadas, type TIPOS_DANO } from "@/lib/validations/checklist";

export type Dano = { tipo: (typeof TIPOS_DANO)[number]; x: number; y: number; nota?: string };

const COLOR_TIPO: Record<Dano["tipo"], string> = {
  GOLPE: "#b91c1c",
  RAYON: "#a16207", // yellow-700
  OTRO: "#334155",
};

const INICIAL_TIPO: Record<Dano["tipo"], string> = { GOLPE: "G", RAYON: "R", OTRO: "O" };

export function MapaCarroceria({
  danos,
  tipoActivo,
  onTipoActivoChange,
  onAgregar,
  onEliminar,
  soloLectura = false,
}: {
  danos: Dano[];
  tipoActivo: Dano["tipo"];
  onTipoActivoChange: (tipo: Dano["tipo"]) => void;
  onAgregar: (x: number, y: number) => void;
  onEliminar: (index: number) => void;
  soloLectura?: boolean;
}) {
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (soloLectura) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAgregar(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  }

  return (
    <div>
      {!soloLectura && (
        <div className="flex gap-2 mb-2">
          {(["GOLPE", "RAYON", "OTRO"] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => onTipoActivoChange(tipo)}
              className={`px-3 py-1.5 text-xs font-semibold rounded border ${
                tipoActivo === tipo
                  ? "text-paper border-transparent"
                  : "text-neutral-600 border-ink/24 bg-paper"
              }`}
              style={tipoActivo === tipo ? { backgroundColor: COLOR_TIPO[tipo] } : undefined}
            >
              {tipo === "GOLPE" ? "Golpe" : tipo === "RAYON" ? "Rayón" : "Otro"}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 mb-1">
        <span>Izquierdo</span>
        <span>Frente ↑</span>
        <span>Derecho</span>
      </div>

      <div
        onClick={handleClick}
        className="relative mx-auto w-full max-w-[220px] aspect-[1/2] border border-ink/24 rounded"
        style={{ cursor: soloLectura ? "default" : "crosshair" }}
      >
        <svg viewBox="0 0 200 400" className="absolute inset-0 w-full h-full text-neutral-400" fill="none">
          {/* Silueta cenital del vehículo: capó, parabrisas, techo, luneta y parachoques trasero. */}
          <path
            d="M100 6
               C 60 6, 38 16, 34 40
               C 30 62, 30 78, 40 92
               C 30 100, 26 116, 26 140
               L 26 260
               C 26 284, 30 300, 40 308
               C 30 322, 30 338, 34 360
               C 38 384, 60 394, 100 394
               C 140 394, 162 384, 166 360
               C 170 338, 170 322, 160 308
               C 170 300, 174 284, 174 260
               L 174 140
               C 174 116, 170 100, 160 92
               C 170 78, 170 62, 166 40
               C 162 16, 140 6, 100 6 Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Parabrisas y luneta */}
          <path d="M52 96 C 60 82, 140 82, 148 96" stroke="currentColor" strokeWidth="1" />
          <path d="M52 304 C 60 318, 140 318, 148 304" stroke="currentColor" strokeWidth="1" />
          {/* Techo */}
          <rect x="58" y="104" width="84" height="192" rx="18" stroke="currentColor" strokeWidth="1" />
          {/* Ruedas */}
          <rect x="16" y="70" width="14" height="46" rx="5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="170" y="70" width="14" height="46" rx="5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="16" y="284" width="14" height="46" rx="5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="170" y="284" width="14" height="46" rx="5" stroke="currentColor" strokeWidth="1.2" />
        </svg>

        {danos.map((d, i) => (
          <button
            key={i}
            type="button"
            title={`${d.tipo} · ${zonaDesdeCoordenadas(d.x, d.y)}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!soloLectura) onEliminar(i);
            }}
            className="absolute flex items-center justify-center w-[22px] h-[22px] bg-paper text-[11px] font-bold"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: "translate(-50%, -50%)",
              border: `1.5px solid ${COLOR_TIPO[d.tipo]}`,
              color: COLOR_TIPO[d.tipo],
            }}
          >
            {INICIAL_TIPO[d.tipo]}
          </button>
        ))}
      </div>

      <p className="text-center text-[11px] text-neutral-400 mt-1">Trasera ↓</p>

      {danos.length > 0 && (
        <ol className="mt-3 space-y-1 text-sm text-neutral-600 list-decimal list-inside">
          {danos.map((d, i) => (
            <li key={i}>
              {d.tipo === "GOLPE" ? "Golpe" : d.tipo === "RAYON" ? "Rayón" : "Otro"} en{" "}
              {zonaDesdeCoordenadas(d.x, d.y).toLowerCase()}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
