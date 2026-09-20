import { redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions";
import { EspecificacionForm } from "../especificacion-form";

export default async function NuevaEspecificacionPage({
  searchParams,
}: {
  searchParams: Promise<{ marca?: string; modelo?: string }>;
}) {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/especificaciones");

  const { marca, modelo } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Nueva ficha técnica</h1>
      <EspecificacionForm defaultMarca={marca} defaultModelo={modelo} />
    </div>
  );
}
