"use client";

import { useActionState, useState } from "react";
import { crearUsuario, actualizarUsuario } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import type { Usuario } from "@prisma/client";

type TrabajadorOpcion = { id: string; nombre: string };

export function UsuarioForm({
  usuario,
  esUsuarioActual,
  trabajadores,
}: {
  usuario?: Usuario;
  esUsuarioActual?: boolean;
  trabajadores: TrabajadorOpcion[];
}) {
  const action = usuario ? actualizarUsuario.bind(null, usuario.id) : crearUsuario;
  const [error, formAction, pending] = useActionState(action, undefined);
  const [rol, setRol] = useState(usuario?.rol ?? "EMPLEADO");

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
        <Select name="rol" value={rol} onChange={(e) => setRol(e.target.value as typeof rol)}>
          <option value="EMPLEADO">Empleado</option>
          <option value="TECNICO">Técnico</option>
          <option value="ADMIN">Administrador</option>
        </Select>
      </Field>
      {rol === "TECNICO" && (
        <Field label="Trabajador vinculado">
          <Select name="trabajadorId" defaultValue={usuario?.trabajadorId ?? ""} required>
            <option value="">Selecciona un trabajador</option>
            {trabajadores.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-neutral-400">
            Este técnico verá solo las órdenes asignadas a este trabajador, sin precios ni valores.
          </p>
        </Field>
      )}
      <label className="flex items-center gap-2 text-sm text-ink mb-4">
        <input type="checkbox" name="activo" defaultChecked={usuario?.activo ?? true} />
        Usuario activo (puede iniciar sesión)
      </label>
      {esUsuarioActual && (
        <p className="text-xs text-neutral-400 -mt-2 mb-4">
          No puedes cambiar tu propio rol ni desactivar tu propia cuenta.
        </p>
      )}
      {error && <p className="text-sm text-[#a63327]">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : usuario ? "Guardar cambios" : "Crear usuario"}
      </Button>
    </form>
  );
}
