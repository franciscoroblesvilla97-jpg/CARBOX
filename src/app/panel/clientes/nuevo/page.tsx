import { ClienteForm } from "../cliente-form";

export default function NuevoClientePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nuevo cliente</h1>
      <ClienteForm />
    </div>
  );
}
