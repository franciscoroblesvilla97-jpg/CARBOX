import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCLP } from "@/lib/format";
import { requireSession } from "@/lib/permissions";
import { CATEGORIAS_PRODUCTO, CATEGORIA_LABEL } from "@/lib/validations/inventario";
import type { CategoriaProducto } from "@prisma/client";

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const user = await requireSession();
  const { categoria } = await searchParams;
  const categoriaValida = CATEGORIAS_PRODUCTO.find((c) => c === categoria);

  const productos = await prisma.producto.findMany({
    where: categoriaValida ? { categoria: categoriaValida } : undefined,
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
        {user.rol === "ADMIN" && (
          <div className="flex gap-2">
            <Link href="/panel/inventario/importar">
              <Button variant="secondary">Importar desde foto</Button>
            </Link>
            <Link href="/panel/inventario/nuevo">
              <Button>Nuevo producto</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/panel/inventario"
          className={`text-sm px-3 py-1 rounded-full border ${
            !categoriaValida ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Todas
        </Link>
        {CATEGORIAS_PRODUCTO.map((c) => (
          <Link
            key={c}
            href={`/panel/inventario?categoria=${c}`}
            className={`text-sm px-3 py-1 rounded-full border ${
              categoriaValida === c ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {CATEGORIA_LABEL[c]}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Precio venta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productos.map((producto) => {
              const bajoStock = producto.stockActual <= producto.stockMinimo;
              return (
                <tr key={producto.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/panel/inventario/${producto.id}`} className="text-green-700 font-medium hover:underline">
                      {producto.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {CATEGORIA_LABEL[producto.categoria as CategoriaProducto]}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{producto.sku ?? "—"}</td>
                  <td className="px-4 py-3">
                    {producto.stockActual} {producto.unidad}
                    {bajoStock && (
                      <span className="ml-2">
                        <Badge color="red">Bajo stock</Badge>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatCLP(producto.precioVenta.toString())}</td>
                </tr>
              );
            })}
            {productos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Aún no hay productos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
