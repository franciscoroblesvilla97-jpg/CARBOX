"use client";

import { useActionState } from "react";
import { crearUsuario, actualizarUsuario } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import type { Usuario } from "@prisma/client";

export function UsuarioForm({ usuario, esUsuarioActual }: { usuario?: Usuario; esUsuarioActual?: boolean }) {
  const action = usuario ? actualizarUsuario.bind(null, usuario.id) : crearUsuario;
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <Field label="Nombre">
        <Input name="nombre" defaultValue={usuario?.nombre} required />
      </Field>
      <Field label="Email">
        <Input type="email" name="email" defaultValue={usuario?.email} required />
      </Field>
      {!usuario && (
        <Field label="Contraseña">
          <Input type="password" name="password" minLength={6} required />
        </Field>
      )}
      <Field label="Rol">
        <Select name="rol" defaultValue={usuario?.rol ?? "EMPLEADO"}>
          <option value="EMPLEADO">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </Select>
      </Field>
      <label className="flex items-center gap-2 text-sm text-slate-700 mb-4">
        <input type="checkbox" name="activo" defaultChecked={usuario?.activo ?? true} />
        Usuario activo (puede iniciar sesión)
      </label>
      {esUsuarioActual && (
        <p className="text-xs text-slate-400 -mt-2 mb-4">
          No puedes cambiar tu propio rol ni desactivar tu propia cuenta.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : usuario ? "Guardar cambios" : "Crear usuario"}
      </Button>
    </form>
  );
}
