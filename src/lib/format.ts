export function formatCLP(value: number | string) {
  const numero = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(numero);
}

export function formatFecha(value: Date | string) {
  const fecha = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}

export function formatFechaCorta(value: Date | string) {
  const fecha = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(fecha);
}

// Redondea hacia la próxima hora en punto: si son las 14:30, la hora 14:00 queda
// bloqueada y la próxima disponible es 15:00.
export function proximaHoraDisponible(desde: Date = new Date()) {
  const fecha = new Date(desde);
  fecha.setMinutes(0, 0, 0);
  fecha.setHours(fecha.getHours() + 1);
  return fecha;
}

// Formatea una fecha local (sin conversión UTC) al formato que espera <input type="datetime-local">.
export function toDatetimeLocalValue(fecha: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

// Medianoche local, desplazada por offsetDias (ej. -1 = ayer, 1 = mañana).
export function inicioDelDia(offsetDias = 0) {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  fecha.setDate(fecha.getDate() + offsetDias);
  return fecha;
}

export function formatHora(value: Date | string) {
  const fecha = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(fecha);
}

export function formatDuracion(minutos: number) {
  if (minutos <= 0) return "0 min";
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
}
