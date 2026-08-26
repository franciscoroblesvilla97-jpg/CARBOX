-- AlterTable
ALTER TABLE "MovimientoInventario" ADD COLUMN "costoUnitario" DECIMAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrdenTrabajoProducto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordenTrabajoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL NOT NULL,
    "costoUnitario" DECIMAL NOT NULL DEFAULT 0,
    CONSTRAINT "OrdenTrabajoProducto_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajoProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrdenTrabajoProducto" ("cantidad", "id", "ordenTrabajoId", "precioUnitario", "productoId") SELECT "cantidad", "id", "ordenTrabajoId", "precioUnitario", "productoId" FROM "OrdenTrabajoProducto";
DROP TABLE "OrdenTrabajoProducto";
ALTER TABLE "new_OrdenTrabajoProducto" RENAME TO "OrdenTrabajoProducto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
