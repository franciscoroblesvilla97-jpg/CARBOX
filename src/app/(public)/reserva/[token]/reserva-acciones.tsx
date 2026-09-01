"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatHora } from "@/lib/format";
import { confirmarAsistencia, cambiarHora } from "./actions";

function hoyISO() {
  const hoy = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
}

export function ReservaAcciones({
  token,
  ordenId,
  duracionMin,
  confirmadoCliente,
}: {
  token: string;
  ordenId: string;
  duracionMin: number;
  confirmadoCliente: boolean;
}) {
  const router = useRouter();
  const [modo, setModo] = useState<"inicial" | "cambiando">("inicial");
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado, setConfirmado] = useState(confirmadoCliente);
  const [dia, setDia] = useState(hoyISO());
  const [horarios, setHorarios] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (modo !== "cambiando") return;
    let cancelado = false;

    async function cargarHorarios() {
      setCargando(true);
      try {
        const r = await fetch(`/api/disponibilidad?fecha=${dia}&duracion=${duracionMin}&excluirOrden=${ordenId}`);
        const data = await r.json();
        if (!cancelado) setHorarios(data.horarios ?? []);
      } catch {
        if (!cancelado) setHorarios([]);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarHorarios();
    return () => {
      cancelado = true;
    };
  }, [modo, dia, duracionMin, ordenId]);

  async function handleConfirmar() {
    setConfirmando(true);
    await confirmarAsistencia(token);
    setConfirmado(true);
    setConfirmando(false);
  }

  async function handleElegirHora(horaISO: string) {
    setGuardando(true);
    setError("");
    const res = await cambiarHora(token, horaISO);
    setGuardando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
    setModo("inicial");
  }

  if (modo === "cambiando") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-900">Elige una nueva hora</p>
        <Input type="date" min={hoyISO()} value={dia} onChange={(e) => setDia(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {cargando ? (
          <p className="text-sm text-slate-400">Buscando horarios…</p>
        ) : horarios.length === 0 ? (
          <p className="text-sm text-slate-500">No hay horarios disponibles ese día, prueba otra fecha.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {horarios.map((h) => (
              <button
                key={h}
                type="button"
                disabled={guardando}
                onClick={() => handleElegirHora(h)}
                className="text-sm rounded-md border border-slate-200 py-1.5 text-slate-700 hover:border-orange-400 disabled:opacity-50"
              >
                {formatHora(new Date(h))}
              </button>
            ))}
          </div>
        )}
        <Button variant="secondary" onClick={() => setModo("inicial")}>
          Cancelar
        </Button>
      </div>
    );
  }

  if (confirmado) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 text-center">
        <p className="font-medium">¡Listo, te esperamos!</p>
        <p className="text-sm mt-1">Si necesitas cambiar la hora igual puedes hacerlo abajo.</p>
        <div className="mt-3">
          <Button variant="secondary" onClick={() => setModo("cambiando")}>
            Cambiar hora
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleConfirmar} disabled={confirmando}>
        {confirmando ? "Confirmando..." : "Confirmar asistencia"}
      </Button>
      <Button variant="secondary" onClick={() => setModo("cambiando")}>
        Cambiar hora
      </Button>
    </div>
  );
}
