import { prisma } from "@/lib/prisma";
import { AgendarForm } from "./agendar-form";

export default async function AgendarPage() {
  const servicios = await prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Agenda tu hora</h1>
      <p className="text-slate-500 mb-8">
        Completa el formulario y te contactaremos para confirmar tu hora.
      </p>
      <AgendarForm servicios={servicios} />
    </div>
  );
}
