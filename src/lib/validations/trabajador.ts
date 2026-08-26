import { z } from "zod";

export const trabajadorSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  activo: z.coerce.boolean().optional(),
});

export const puestoSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  activo: z.coerce.boolean().optional(),
  servicioIds: z.array(z.string()).default([]),
});
