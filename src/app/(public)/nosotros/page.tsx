export default function NosotrosPage() {
  return (
    <div>
      <section className="bg-green-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold">Sobre Carbox</h1>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-slate-600 mb-8">
          En Carbox nos dedicamos a mantener tu vehículo en las mejores condiciones: cambio de aceite y filtros,
          neumáticos, alineación, rectificado de discos y balatas, y sistema de frenos. Trabajamos con repuestos
          de calidad y un equipo con experiencia.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-1">Dirección</h2>
            <p className="text-slate-500">Pedro de Valdivia 525, Concepción</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-1">Horario</h2>
            <p className="text-slate-500">Lunes a sábado, 9:00 a 19:00</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-1">Teléfono / WhatsApp</h2>
            <p className="text-slate-500">+56 9 8210 6659</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-1">Email</h2>
            <p className="text-slate-500">contacto@carboxconce.cl</p>
          </div>
        </div>
      </div>
    </div>
  );
}
