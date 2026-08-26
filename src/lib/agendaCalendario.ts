// Empaqueta bloques que se superponen en el tiempo en "carriles" (lanes), como hace
// Google Calendar: si dos órdenes chocan en el mismo puesto, se dividen el ancho de la
// columna en vez de dibujarse una encima de la otra.
export function empaquetarBloques<T extends { inicioMin: number; duracionMin: number }>(
  bloques: T[]
): (T & { lane: number; lanesTotal: number })[] {
  const ordenados = [...bloques].sort((a, b) => a.inicioMin - b.inicioMin);
  const resultado: (T & { lane: number; lanesTotal: number })[] = [];

  let cluster: (T & { lane: number })[] = [];
  let finPorLane: number[] = [];
  let clusterMaxFin = -Infinity;

  function cerrarCluster() {
    if (cluster.length === 0) return;
    const lanesTotal = Math.max(...cluster.map((c) => c.lane)) + 1;
    for (const c of cluster) resultado.push({ ...c, lanesTotal });
    cluster = [];
  }

  for (const bloque of ordenados) {
    const inicio = bloque.inicioMin;
    if (inicio >= clusterMaxFin) {
      cerrarCluster();
      finPorLane = [];
      clusterMaxFin = -Infinity;
    }
    let lane = finPorLane.findIndex((fin) => fin <= inicio);
    if (lane === -1) lane = finPorLane.length;
    finPorLane[lane] = inicio + bloque.duracionMin;
    clusterMaxFin = Math.max(clusterMaxFin, finPorLane[lane]);
    cluster.push({ ...bloque, lane });
  }
  cerrarCluster();

  return resultado;
}
