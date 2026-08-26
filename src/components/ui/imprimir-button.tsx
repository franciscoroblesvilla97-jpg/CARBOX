"use client";

import { Button } from "@/components/ui/button";

export function ImprimirButton() {
  return (
    <Button variant="ghost" className="print:hidden" onClick={() => window.print()}>
      Imprimir / Guardar como PDF
    </Button>
  );
}
