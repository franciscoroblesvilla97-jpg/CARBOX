import Link from "next/link";
import { formatCLP } from "@/lib/format";

export function ServiceCard({
  nombre,
  descripcion,
  precioBase,
}: {
  nombre: string;
  descripcion?: string | null;
  precioBase: number | string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-bold text-slate-900 text-lg">{nombre}</h3>
      {descripcion && <p className="text-sm text-slate-500 mt-1">{descripcion}</p>}
      <p className="text-green-600 font-semibold mt-3">Desde {formatCLP(precioBase)}</p>
      <Link
        href="/agendar"
        className="inline-flex items-center gap-1 mt-4 rounded-full border border-green-600 text-green-600 hover:bg-green-50 px-4 py-1.5 text-sm font-semibold transition-colors"
      >
        Agendar →
      </Link>
    </div>
  );
}
