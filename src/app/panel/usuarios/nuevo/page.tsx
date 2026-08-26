import { redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions";
import { UsuarioForm } from "../usuario-form";

export default async function NuevoUsuarioPage() {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/dashboard");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nuevo usuario</h1>
      <UsuarioForm />
    </div>
  );
}
