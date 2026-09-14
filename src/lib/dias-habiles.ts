import { inicioDelDia } from "@/lib/format";

export type DiaHabil = { fecha: Date; iso: string; esHoy: boolean };

// Próximos `n` días hábiles (se saltan los domingos), empezando hoy.
// Construye la lista iterando día por día y solo empujando los no-domingo, en vez de
// indexar por "días desde hoy" — así el primer elemento es siempre el primer día
// realmente visible, y el seleccionado por defecto no cae en un domingo salteado.
export function proximosDiasHabiles(n: number): DiaHabil[] {
  const dias: DiaHabil[] = [];
  const hoy = inicioDelDia(0);
  let cursor = new Date(hoy);
  let offset = 0;

  while (dias.length < n) {
    if (cursor.getDay() !== 0) {
      dias.push({ fecha: new Date(cursor), iso: toISODate(cursor), esHoy: offset === 0 });
    }
    cursor = inicioDelDia(++offset);
  }

  return dias;
}

export function toISODate(fecha: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}
