import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const ancho = request.nextUrl.searchParams.get("ancho");
  const perfil = request.nextUrl.searchParams.get("perfil");
  const aro = request.nextUrl.searchParams.get("aro");

  if (!ancho || !perfil || !aro) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const medida = `${ancho}/${perfil} R${aro}`;

  const productos = await prisma.producto.findMany({
    where: { categoria: "NEUMATICOS", medida, stockActual: { gt: 0 } },
    orderBy: { precioVenta: "asc" },
  });

  return NextResponse.json({
    medida,
    resultados: productos.map((p) => ({
      id: p.id,
      marca: p.marca,
      nombre: p.nombre,
      indice: p.indice,
      precioVenta: Number(p.precioVenta),
      stockActual: p.stockActual,
      imagenUrl: p.imagenUrl,
    })),
  });
}
