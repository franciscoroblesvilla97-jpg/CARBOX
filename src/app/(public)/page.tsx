import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ServiceCard } from "@/components/public/service-card";

const beneficios = [
  { titulo: "Atención rápida", detalle: "Agenda online y te confirmamos al toque" },
  { titulo: "Repuestos de calidad", detalle: "Trabajamos con marcas confiables" },
  { titulo: "Informe digital", detalle: "Recibe el detalle de tu servicio por WhatsApp" },
];

export default async function InicioPage() {
  const servicios = await prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });

  return (
    <div>
      <section className="relative bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center relative z-10">
          <p className="uppercase tracking-widest text-green-100 text-sm font-semibold mb-3">Lubricentro en Concepción</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Tu vehículo en las mejores manos
          </h1>
          <p className="text-green-50 max-w-xl mx-auto mb-8 text-lg">
            Cambio de aceite, filtros, neumáticos, alineación, rectificado de discos y balatas, y frenos.
            Agenda tu hora y nosotros nos encargamos del resto.
          </p>
          <Link
            href="/agendar"
            className="inline-flex items-center justify-center rounded-full bg-white text-green-600 font-bold px-8 py-3 hover:bg-green-50 transition-colors shadow-lg"
          >
            Agendar hora
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {beneficios.map((b) => (
            <div key={b.titulo} className="bg-white rounded-xl shadow-md p-5 border border-slate-100">
              <p className="font-bold text-slate-900">{b.titulo}</p>
              <p className="text-sm text-slate-500 mt-1">{b.detalle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Nuestros servicios</h2>
        <p className="text-slate-500 mb-6">Elige el servicio que necesitas y agenda en segundos.</p>
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
      </section>

      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl font-bold mb-2">¿Tienes dudas sobre tu vehículo?</h2>
          <p className="text-slate-300 mb-6">Escríbenos por WhatsApp y te ayudamos a elegir el servicio correcto.</p>
          <Link
            href="/nosotros"
            className="inline-flex items-center justify-center rounded-full border-2 border-white px-6 py-2.5 font-semibold hover:bg-white hover:text-slate-900 transition-colors"
          >
            Ver ubicación y horario
          </Link>
        </div>
      </section>
    </div>
  );
}
