import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { CATEGORIAS_PRODUCTO } from "@/lib/validations/inventario";

export type LineaFacturaExtraida = {
  nombre: string;
  sku: string | null;
  cantidad: number;
  precioUnitario: number | null;
  categoriaSugerida: (typeof CATEGORIAS_PRODUCTO)[number];
};

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "facturas");

// Guarda la foto en disco y devuelve la URL pública con la que se puede mostrar/enlazar después.
export async function guardarFotoFactura(bytes: Buffer, mimeType: string): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const nombreArchivo = `${randomUUID()}.${extension}`;
  await writeFile(path.join(UPLOADS_DIR, nombreArchivo), bytes);
  return `/uploads/facturas/${nombreArchivo}`;
}

const PROMPT = `Eres un asistente que lee fotos de guías de despacho o facturas de un lubricentro chileno y extrae cada línea de producto.

Para cada producto que aparezca, extrae:
- nombre: nombre del producto tal como aparece (o normalizado si es muy críptico)
- sku: el código/SKU del producto si aparece en el documento, o null si no aparece
- cantidad: cantidad numérica comprada
- precioUnitario: precio unitario en pesos chilenos (CLP), sin puntos ni símbolos, o null si no se puede determinar
- categoriaSugerida: una de estas categorías exactas según el tipo de producto: ${CATEGORIAS_PRODUCTO.join(", ")}

Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown, con este formato exacto:
[{"nombre": "...", "sku": "...", "cantidad": 1, "precioUnitario": 1000, "categoriaSugerida": "ACEITES_LUBRICANTES"}]

Si no logras leer ninguna línea de producto, responde con un array vacío: []`;

export async function extraerLineasFactura(
  imagenes: { base64: string; mediaType: string }[]
): Promise<LineaFacturaExtraida[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar ANTHROPIC_API_KEY en el archivo .env para poder leer facturas.");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            ...imagenes.map((img) => ({
              type: "image",
              source: { type: "base64", media_type: img.mediaType, data: img.base64 },
            })),
            { type: "text", text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`Error al leer la factura con IA (${res.status}): ${detalle.slice(0, 300)}`);
  }

  const data = await res.json();
  const texto: string = data.content?.[0]?.text ?? "[]";
  const jsonLimpio = texto.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "");

  let lineas: unknown;
  try {
    lineas = JSON.parse(jsonLimpio);
  } catch {
    throw new Error("La IA no devolvió un resultado legible. Intenta con una foto más nítida.");
  }

  if (!Array.isArray(lineas)) return [];

  const categoriasValidas = new Set<string>(CATEGORIAS_PRODUCTO);
  return lineas
    .filter((l): l is Record<string, unknown> => typeof l === "object" && l !== null)
    .map((l) => ({
      nombre: typeof l.nombre === "string" ? l.nombre : "Producto sin nombre",
      sku: typeof l.sku === "string" && l.sku ? l.sku : null,
      cantidad: typeof l.cantidad === "number" && l.cantidad > 0 ? Math.round(l.cantidad) : 1,
      precioUnitario: typeof l.precioUnitario === "number" ? Math.round(l.precioUnitario) : null,
      categoriaSugerida: categoriasValidas.has(l.categoriaSugerida as string)
        ? (l.categoriaSugerida as LineaFacturaExtraida["categoriaSugerida"])
        : "OTRO",
    }));
}
