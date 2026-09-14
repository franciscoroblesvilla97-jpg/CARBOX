// Cálculos de fecha/hora explícitos en zona horaria de Chile, sin depender de la
// zona horaria del proceso donde corre el servidor (en Vercel corre en UTC por
// defecto, lo que desfasaba en 3-4 horas el horario de atención 09:00-19:00).
const ZONA = "America/Santiago";

// Desfase de Chile respecto a UTC, en minutos a sumar a la hora de pared de Chile
// para obtener el instante UTC equivalente. Usa Intl (respeta el horario de verano).
function desfaseMinutos(instanteRef: Date) {
  const texto = new Intl.DateTimeFormat("en-US", { timeZone: ZONA, timeZoneName: "shortOffset" })
    .formatToParts(instanteRef)
    .find((p) => p.type === "timeZoneName")?.value;
  const horas = texto ? Number(texto.replace("GMT", "")) : -3;
  return -(Number.isFinite(horas) ? horas : -3) * 60;
}

// Medianoche (00:00) en hora de Chile del día calendario de Chile que le corresponde a `instante`.
export function inicioDiaChile(instante: Date): Date {
  const [anio, mes, dia] = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA })
    .format(instante)
    .split("-")
    .map(Number);
  // Ancla al mediodía UTC de esa fecha: cae siempre dentro del mismo día calendario en
  // Chile (que está entre UTC-3 y UTC-4), sirve para calcular el desfase sin ambigüedad.
  const ancla = new Date(Date.UTC(anio, mes - 1, dia, 12));
  return new Date(Date.UTC(anio, mes - 1, dia, 0, 0, 0) + desfaseMinutos(ancla) * 60000);
}

// Minutos transcurridos desde la medianoche de Chile hasta `instante`.
export function minutosDesdeMedianocheChile(instante: Date): number {
  return Math.round((instante.getTime() - inicioDiaChile(instante).getTime()) / 60000);
}

// true si `instante` cae en el día calendario de hoy, en hora de Chile.
export function esHoyChile(instante: Date): boolean {
  const formato = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA });
  return formato.format(instante) === formato.format(new Date());
}

// Día de la semana (0=domingo … 6=sábado) del día calendario de Chile de `instante`.
export function diaSemanaChile(instante: Date): number {
  const [anio, mes, dia] = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA })
    .format(instante)
    .split("-")
    .map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
}
