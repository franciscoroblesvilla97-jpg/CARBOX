import { z } from "zod";

export const cotizacionCabeceraSchema = z.object({
  nombreCliente: z.string().min(2, "Nombre muy corto"),
  telefono: z
    .string()
    .regex(/^\+569\d{8}$/, "Teléfono inválido, debe tener 8 dígitos")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  patente: z.string().optional().or(z.literal("")),
  marca: z.string().optional().or(z.literal("")),
  modelo: z.string().optional().or(z.literal("")),
  anio: z.coerce.number().int().min(1950).max(2100).optional(),
  observaciones: z.string().optional().or(z.literal("")),
});
