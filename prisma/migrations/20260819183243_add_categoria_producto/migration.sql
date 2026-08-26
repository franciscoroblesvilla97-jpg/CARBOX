-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "sku" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'OTRO',
    "unidad" TEXT NOT NULL DEFAULT 'unidad',
    "precioVenta" DECIMAL NOT NULL DEFAULT 0,
    "costoUnitario" DECIMAL NOT NULL DEFAULT 0,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Producto" ("costoUnitario", "createdAt", "id", "nombre", "precioVenta", "sku", "stockActual", "stockMinimo", "unidad") SELECT "costoUnitario", "createdAt", "id", "nombre", "precioVenta", "sku", "stockActual", "stockMinimo", "unidad" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
CREATE UNIQUE INDEX "Producto_sku_key" ON "Producto"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
