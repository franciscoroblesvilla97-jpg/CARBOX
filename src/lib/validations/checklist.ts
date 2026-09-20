import { z } from "zod";

export const ESTADOS_CHECKLIST = ["OK", "VIDA_UTIL", "CAMBIO"] as const;
export const TIPOS_DANO = ["GOLPE", "RAYON", "OTRO"] as const;

/** Los 14 puntos de la hoja de recepción, en orden. */
export const PUNTOS_CHECKLIST = [
  { nombre: "Motor", ayuda: "fugas / ruidos" },
  { nombre: "Niveles de fluidos", ayuda: "motor, frenos, dirección, etc." },
  { nombre: "Refrigerante", ayuda: "nivel y estado" },
  { nombre: "Frenos", ayuda: "discos / pastillas / fugas" },
  { nombre: "Dirección", ayuda: "juego / fugas" },
  { nombre: "Suspensión", ayuda: "amortiguadores / bujes / ruidos" },
  { nombre: "Transmisión", ayuda: "fugas / cambios" },
  { nombre: "Sistema eléctrico", ayuda: "luces / batería / carga" },
  { nombre: "Embrague", ayuda: "si aplica" },
  { nombre: "Escape", ayuda: "fugas / soportes" },
  { nombre: "Correa de accesorios", ayuda: "tensión y grietas" },
  { nombre: "Filtro de aire / cabina", ayuda: "estado" },
  { nombre: "Limpiaparabrisas", ayuda: "escobillas" },
  { nombre: "Luces", ayuda: "altas / bajas / posición / neblineros" },
] as const;

export const POSICIONES_NEUMATICO = [
  "Delantera izquierda",
  "Delantera derecha",
  "Trasera izquierda",
  "Trasera derecha",
  "Repuesto (si aplica)",
] as const;

export const checklistItemSchema = z.object({
  nombre: z.string().trim().min(1),
  estado: z.enum(ESTADOS_CHECKLIST),
  observacion: z.string().trim().optional(),
  orden: z.number().int().min(0),
});

export const presionSchema = z.object({
  posicion: z.string().trim().min(1),
  recomendada: z.coerce.number().min(0).max(100).optional(),
  medida: z.coerce.number().min(0).max(100).optional(),
  estado: z.enum(ESTADOS_CHECKLIST),
  orden: z.number().int().min(0),
});

export const marcaCarroceriaSchema = z.object({
  tipo: z.enum(TIPOS_DANO),
  x: z.coerce.number().min(0).max(100),
  y: z.coerce.number().min(0).max(100),
  nota: z.string().trim().optional(),
});

export const checklistOrdenSchema = z.object({
  kilometraje: z.coerce.number().int().min(0).optional(),
  observaciones: z.string().trim().optional(),
  items: z.array(checklistItemSchema),
  presiones: z.array(presionSchema),
  danos: z.array(marcaCarroceriaSchema),
});

export type ChecklistOrdenInput = z.infer<typeof checklistOrdenSchema>;

/** Deriva la zona del plano a partir de coordenadas en porcentaje. */
export function zonaDesdeCoordenadas(x: number, y: number) {
  const frenteTrasera = y < 26 ? "Frente" : y > 74 ? "Trasera" : "Costado";
  const ladoIzqDer = x < 34 ? "izquierdo" : x > 66 ? "derecho" : "central";
  return `${frenteTrasera} ${ladoIzqDer}`;
}
