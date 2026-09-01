import { NextRequest, NextResponse } from "next/server";
import { duracionServicio, horariosDisponibles } from "@/lib/disponibilidad";

export async function GET(request: NextRequest) {
  const fechaStr = request.nextUrl.searchParams.get("fecha");
  const servicioTexto = request.nextUrl.searchParams.get("servicio");
  const duracionParam = request.nextUrl.searchParams.get("duracion");
  const excluirOrdenId = request.nextUrl.searchParams.get("excluirOrden") ?? undefined;

  if (!fechaStr || (!servicioTexto && !duracionParam)) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const dia = new Date(`${fechaStr}T00:00:00`);
  if (Number.isNaN(dia.getTime())) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const duracion = duracionParam ? Number(duracionParam) : await duracionServicio(servicioTexto!);
  const horarios = await horariosDisponibles(dia, duracion, excluirOrdenId);

  return NextResponse.json({ horarios: horarios.map((h) => h.toISOString()), duracionMin: duracion });
}
