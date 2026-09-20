import { z } from "zod";

const usuarioBaseSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Email inválido"),
  rol: z.enum(["ADMIN", "EMPLEADO", "TECNICO"]),
  activo: z.coerce.boolean().optional(),
  trabajadorId: z.string().optional(),
});

const conTrabajadorSiEsTecnico = (data: { rol: string; trabajadorId?: string }) =>
  data.rol !== "TECNICO" || !!data.trabajadorId;

export const usuarioSchema = usuarioBaseSchema.refine(conTrabajadorSiEsTecnico, {
  message: "Selecciona el trabajador vinculado a este técnico",
  path: ["trabajadorId"],
});

export const usuarioNuevoSchema = usuarioBaseSchema
  .extend({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .refine(conTrabajadorSiEsTecnico, {
    message: "Selecciona el trabajador vinculado a este técnico",
    path: ["trabajadorId"],
  });

export const usuarioPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
