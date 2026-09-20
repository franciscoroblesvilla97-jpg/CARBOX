import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { ImportarForm } from "./importar-form";

export default async function ImportarInventarioPage() {
  const user = await requireSession();
  if (user.rol !== "ADMIN") redirect("/panel/inventario");

  const productos = await prisma.producto.findMany({
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, sku: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-2">Importar desde foto</h1>
      <p className="text-neutral-500 mb-6">
        Toma o sube una foto de la guía de despacho o factura. La IA lee los productos y los deja listos para
        revisar antes de guardarlos.
      </p>
      <ImportarForm productos={productos} />
    </div>
  );
}
