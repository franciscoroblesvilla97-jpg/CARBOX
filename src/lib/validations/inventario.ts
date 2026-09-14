import { z } from "zod";

export const CATEGORIAS_PRODUCTO = ["ACEITES_LUBRICANTES", "NEUMATICOS", "FRENOS", "FILTROS", "LUCES", "OTRO"] as const;

export const CATEGORIA_LABEL: Record<(typeof CATEGORIAS_PRODUCTO)[number], string> = {
  ACEITES_LUBRICANTES: "Aceites y lubricantes",
  NEUMATICOS: "Neumáticos",
  FRENOS: "Frenos",
  FILTROS: "Filtros",
  LUCES: "Luces",
  OTRO: "Otro",
};

export const productoSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto"),
  sku: z.string().optional().or(z.literal("")),
  categoria: z.enum(CATEGORIAS_PRODUCTO),
  unidad: z.string().min(1, "Unidad requerida"),
  precioVenta: z.coerce.number().min(0, "Precio inválido"),
  costoUnitario: z.coerce.number().min(0, "Costo inválido"),
  stockActual: z.coerce.number().int().min(0, "Stock inválido"),
  stockMinimo: z.coerce.number().int().min(0, "Stock mínimo inválido"),
  marca: z.string().optional().or(z.literal("")),
  medida: z.string().optional().or(z.literal("")),
  indice: z.string().optional().or(z.literal("")),
  imagenUrl: z.string().optional().or(z.literal("")),
});

export const movimientoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SALIDA", "AJUSTE"]),
  cantidad: z.coerce.number().int().positive("Cantidad debe ser mayor a 0"),
  costoUnitario: z.coerce.number().min(0, "Costo inválido").optional(),
  motivo: z.string().optional().or(z.literal("")),
});
