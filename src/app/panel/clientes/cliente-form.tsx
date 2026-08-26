"use client";

import { useActionState } from "react";
import { crearCliente, actualizarCliente } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import type { Cliente } from "@prisma/client";

export function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const action = cliente ? actualizarCliente.bind(null, cliente.id) : crearCliente;
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <Field label="Nombre completo">
        <Input name="nombre" defaultValue={cliente?.nombre} required />
      </Field>
      <Field label="Teléfono">
        <PhoneInput name="telefono" defaultValue={cliente?.telefono} required />
      </Field>
      <Field label="Email (opcional)">
        <Input name="email" type="email" defaultValue={cliente?.email ?? ""} />
      </Field>
      <Field label="RUT (opcional)">
        <Input name="rut" defaultValue={cliente?.rut ?? ""} />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : cliente ? "Guardar cambios" : "Crear cliente"}
      </Button>
    </form>
  );
}
