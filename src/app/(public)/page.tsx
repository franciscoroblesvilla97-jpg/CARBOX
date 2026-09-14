import { prisma } from "@/lib/prisma";
import { HomeHeader } from "@/components/public/home/header";
import { Hero } from "@/components/public/home/hero";
import { Cotizador } from "@/components/public/home/cotizador";
import { Neumaticos } from "@/components/public/home/neumaticos";
import { ServiciosPrecios } from "@/components/public/home/servicios-precios";
import { Contacto } from "@/components/public/home/contacto";
import { HomeFooter } from "@/components/public/home/footer";

export default async function InicioPage() {
  const servicios = await prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });

  const serviciosLite = servicios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion,
    precioBase: Number(s.precioBase),
    duracionMinutos: s.duracionMinutos,
  }));

  return (
    <div>
      <HomeHeader />
      <Hero />
      <Cotizador servicios={serviciosLite} />
      <Neumaticos />
      <ServiciosPrecios servicios={servicios} />
      <Contacto />
      <HomeFooter />
    </div>
  );
}
