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

  const [anio, mes, diaNum] = fechaStr.split("-").map(Number);
  if (!anio || !mes || !diaNum) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }
  // Ancla al mediodía UTC: cae siempre dentro del mismo día calendario en Chile,
  // sin depender de la zona horaria en la que corre el proceso del servidor.
  const dia = new Date(Date.UTC(anio, mes - 1, diaNum, 12));

  const duracion = duracionParam ? Number(duracionParam) : await duracionServicio(servicioTexto!);
  const horarios = await horariosDisponibles(dia, duracion, excluirOrdenId);

  return NextResponse.json({ horarios: horarios.map((h) => h.toISOString()), duracionMin: duracion });
}
