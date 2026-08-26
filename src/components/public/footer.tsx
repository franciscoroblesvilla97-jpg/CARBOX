export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto pb-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-xl font-bold text-white mb-1">
          CAR<span className="text-green-500">BOX</span>
        </p>
        <p className="text-sm text-slate-400 mb-6">Tu lubricentro de confianza en Concepción.</p>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-slate-400 border-t border-slate-800 pt-6">
          <p>© {new Date().getFullYear()} Carbox — Lubricentro</p>
          <p>Dirección de ejemplo 123, Concepción · +56 9 1234 5678</p>
        </div>
      </div>
    </footer>
  );
}
