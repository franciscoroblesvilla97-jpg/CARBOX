import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";
import { ProductoForm } from "../producto-form";
import { MovimientoForm } from "./movimiento-form";
import { Badge } from "@/components/ui/badge";
import { formatCLP, formatFecha } from "@/lib/format";

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSession();

  const producto = await prisma.producto.findUnique({
    where: { id },
    include: { movimientos: { orderBy: { createdAt: "desc" }, take: 20, include: { usuario: true } } },
  });

  if (!producto) notFound();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{producto.nombre}</h1>
          {producto.stockActual <= producto.stockMinimo && <Badge color="red">Bajo stock</Badge>}
        </div>
        {user.rol === "ADMIN" ? (
          <ProductoForm producto={producto} />
        ) : (
          <div className="max-w-md text-sm text-slate-600 space-y-1">
            <p>SKU: {producto.sku ?? "—"}</p>
            <p>
              Stock actual: {producto.stockActual} {producto.unidad}
            </p>
            <p>Stock mínimo: {producto.stockMinimo}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Registrar movimiento</h2>
        <MovimientoForm productoId={producto.id} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Movimientos recientes</h2>
        <div className="bg-white rounded-lg shadow divide-y divide-slate-100">
          {producto.movimientos.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <span className="font-medium">{m.tipo}</span>{" "}
                <span className="text-slate-500">{m.motivo ? `— ${m.motivo}` : ""}</span>
                {user.rol === "ADMIN" && m.costoUnitario !== null && (
                  <span className="text-slate-400"> · costo {formatCLP(m.costoUnitario.toString())}/u</span>
                )}
              </div>
              <div className="text-right text-slate-500">
                <p>{m.cantidad} · {m.usuario.nombre}</p>
                <p className="text-xs">{formatFecha(m.createdAt)}</p>
                {m.fotosUrl && (
                  <p className="text-xs">
                    {m.fotosUrl.split(",").map((url, i) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 hover:underline"
                      >
                        {i > 0 && " · "}Ver comprobante{m.fotosUrl!.split(",").length > 1 ? ` ${i + 1}` : ""}
                      </a>
                    ))}
                  </p>
                )}
              </div>
            </div>
          ))}
          {producto.movimientos.length === 0 && (
            <p className="px-4 py-6 text-center text-slate-400 text-sm">Sin movimientos registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
