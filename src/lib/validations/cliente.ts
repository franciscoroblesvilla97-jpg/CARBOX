import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  telefono: z.string().regex(/^\+569\d{8}$/, "Teléfono inválido, debe tener 8 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  rut: z.string().optional().or(z.literal("")),
});

export const vehiculoSchema = z.object({
  patente: z.string().min(4, "Patente inválida").toUpperCase(),
  marca: z.string().optional().or(z.literal("")),
  modelo: z.string().optional().or(z.literal("")),
  anio: z.coerce.number().int().min(1950).max(2100).optional(),
});
