import { prisma } from "@/lib/prisma";
import { ServiceCard } from "@/components/public/service-card";

export default async function ServiciosPublicoPage() {
  const servicios = await prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });

  return (
    <div>
      <section className="bg-green-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold">Nuestros servicios</h1>
          <p className="text-green-50 mt-1">Todo lo que tu vehículo necesita, en un solo lugar.</p>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicios.map((servicio) => (
            <ServiceCard
              key={servicio.id}
              nombre={servicio.nombre}
              descripcion={servicio.descripcion}
              precioBase={servicio.precioBase.toString()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
