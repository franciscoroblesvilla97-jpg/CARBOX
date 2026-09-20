import { prisma } from "@/lib/prisma";
import { CotizacionForm } from "./cotizacion-form";

export default async function NuevaCotizacionPage() {
  const [servicios, productos] = await Promise.all([
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Nueva cotización</h1>
      <CotizacionForm
        servicios={servicios.map((s) => ({ ...s, precioBase: Number(s.precioBase) }))}
        productos={productos.map((p) => ({ ...p, precioVenta: Number(p.precioVenta), costoUnitario: Number(p.costoUnitario) }))}
      />
    </div>
  );
}
