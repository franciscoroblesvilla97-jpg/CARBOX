"use client";

import { useActionState, useRef } from "react";
import { subirArchivoOrden, eliminarArchivoOrden } from "../actions";
import { Button } from "@/components/ui/button";
import { formatFecha } from "@/lib/format";

type Archivo = {
  id: string;
  nombre: string;
  url: string;
  createdAt: Date;
  subidoPor: { nombre: string } | null;
};

export function ArchivosOrden({ ordenId, archivos }: { ordenId: string; archivos: Archivo[] }) {
  const [error, formAction, pending] = useActionState(subirArchivoOrden.bind(null, ordenId), undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <ul className="space-y-2 mb-3">
        {archivos.map((archivo) => (
          <li key={archivo.id} className="flex items-center justify-between gap-3 text-sm border-b border-slate-100 pb-2">
            <a href={archivo.url} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
              {archivo.nombre}
            </a>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>
                {formatFecha(archivo.createdAt)}
                {archivo.subidoPor && ` · ${archivo.subidoPor.nombre}`}
              </span>
              <form action={eliminarArchivoOrden.bind(null, archivo.id)}>
                <button type="submit" className="text-red-600 hover:underline">
                  Eliminar
                </button>
              </form>
            </div>
          </li>
        ))}
        {archivos.length === 0 && <p className="text-sm text-slate-400">Sin archivos adjuntos.</p>}
      </ul>

      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          formRef.current?.reset();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="file"
          name="archivo"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          required
          className="text-sm"
        />
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Subiendo..." : "Subir"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      <p className="text-xs text-slate-400 mt-1">PDF o imagen, máx. 10 MB. Ej: informe de alineación.</p>
    </div>
  );
}
