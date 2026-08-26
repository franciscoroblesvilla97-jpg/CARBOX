import type { Rol } from "@prisma/client";
import { auth } from "@/lib/auth";

export function puedeVerReportes(rol: Rol) {
  return rol === "ADMIN";
}

export function puedeEditarPrecios(rol: Rol) {
  return rol === "ADMIN";
}

export function puedeGestionarUsuarios(rol: Rol) {
  return rol === "ADMIN";
}

export function puedeEliminarOrdenes(rol: Rol) {
  return rol === "ADMIN";
}

/** Barrera de seguridad real: usar al inicio de toda Server Action protegida. */
export async function requireRole(rolesPermitidos: Rol[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado");
  }
  if (!rolesPermitidos.includes(session.user.rol)) {
    throw new Error("No autorizado");
  }
  return session.user;
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado");
  }
  return session.user;
}
