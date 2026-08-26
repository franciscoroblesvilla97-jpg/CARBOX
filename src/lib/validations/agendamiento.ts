import { z } from "zod";
import { proximaHoraDisponible } from "@/lib/format";

export const solicitudAgendamientoSchema = z.object({
  nombreContacto: z.string().min(2, "Nombre muy corto"),
  telefono: z.string().regex(/^\+569\d{8}$/, "Teléfono inválido, debe tener 8 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  patente: z.string().min(4, "Patente inválida").toUpperCase(),
  marca: z.string().optional().or(z.literal("")),
  modelo: z.string().optional().or(z.literal("")),
  anio: z.coerce.number().int().min(1950).max(2100).optional(),
  servicioTexto: z.string().min(1, "Selecciona un servicio"),
  fechaPreferida: z
    .string()
    .min(1, "Selecciona fecha y hora")
    .refine((valor) => new Date(valor) >= proximaHoraDisponible(), "Elige una hora futura disponible"),
  comentario: z.string().optional().or(z.literal("")),
});
