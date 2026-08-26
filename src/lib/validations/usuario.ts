import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Email inválido"),
  rol: z.enum(["ADMIN", "EMPLEADO"]),
  activo: z.coerce.boolean().optional(),
});

export const usuarioNuevoSchema = usuarioSchema.extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const usuarioPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
