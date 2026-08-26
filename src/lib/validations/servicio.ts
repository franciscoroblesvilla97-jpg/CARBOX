import { z } from "zod";

export const servicioSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  descripcion: z.string().optional().or(z.literal("")),
  precioBase: z.coerce.number().min(0, "Precio inválido"),
  duracionMinutos: z.coerce.number().int().min(0, "Duración inválida"),
  activo: z.coerce.boolean().optional(),
});
