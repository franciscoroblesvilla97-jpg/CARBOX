"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_PRODUCTO, CATEGORIA_LABEL } from "@/lib/validations/inventario";

export function InventarioFiltros({ categoriaInicial, qInicial }: { categoriaInicial: string; qInicial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(qInicial);

  function navegar(categoria: string, texto: string) {
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (texto.trim()) params.set("q", texto.trim());
    router.push(`/panel/inventario${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      className="flex flex-wrap gap-3 mb-6 items-end"
      onSubmit={(e) => {
        e.preventDefault();
        navegar(categoriaInicial, q);
      }}
    >
      <div className="w-56">
        <Select defaultValue={categoriaInicial} onChange={(e) => navegar(e.target.value, q)}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS_PRODUCTO.map((c) => (
            <option key={c} value={c}>
              {CATEGORIA_LABEL[c]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex-1 min-w-[14rem]">
        <Input
          type="search"
          placeholder="Buscar por nombre o SKU..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
    </form>
  );
}
