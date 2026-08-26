import { z } from "zod";

export const especificacionSchema = z.object({
  marca: z.string().min(1, "Marca requerida"),
  modelo: z.string().min(1, "Modelo requerido"),
  anioDesde: z.coerce.number().int().min(1950).max(2100).optional(),
  anioHasta: z.coerce.number().int().min(1950).max(2100).optional(),
  tipoAceite: z.string().optional().or(z.literal("")),
  capacidadAceite: z.string().optional().or(z.literal("")),
  tipoFiltroAceite: z.string().optional().or(z.literal("")),
  tipoFiltroAire: z.string().optional().or(z.literal("")),
  tipoNeumatico: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
});
