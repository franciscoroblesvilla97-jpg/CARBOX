import { redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions";
import { ServicioForm } from "../servicio-form";

export default async function NuevoServicioPage() {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/servicios");

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Nuevo servicio</h1>
      <ServicioForm />
    </div>
  );
}
