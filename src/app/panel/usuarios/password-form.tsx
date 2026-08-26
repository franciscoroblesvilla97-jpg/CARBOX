"use client";

import { useActionState } from "react";
import { cambiarPasswordUsuario } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function PasswordForm({ usuarioId }: { usuarioId: string }) {
  const action = cambiarPasswordUsuario.bind(null, usuarioId);
  const [mensaje, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <Field label="Nueva contraseña">
        <Input type="password" name="password" minLength={6} required />
      </Field>
      {mensaje && (
        <p className={`text-sm ${mensaje === "Contraseña actualizada" ? "text-green-700" : "text-red-600"}`}>
          {mensaje}
        </p>
      )}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Actualizando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
