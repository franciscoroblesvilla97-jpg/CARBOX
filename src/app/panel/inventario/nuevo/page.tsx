import { redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions";
import { ProductoForm } from "../producto-form";

export default async function NuevoProductoPage() {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/inventario");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nuevo producto</h1>
      <ProductoForm />
    </div>
  );
}
