import { redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions";
import { TrabajadorForm } from "../trabajador-form";

export default async function NuevoTrabajadorPage() {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/trabajadores");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nuevo trabajador</h1>
      <TrabajadorForm />
    </div>
  );
}
