-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrdenTrabajoProducto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordenTrabajoId" TEXT NOT NULL,
    "productoId" TEXT,
    "nombrePersonalizado" TEXT,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL NOT NULL,
    "costoUnitario" DECIMAL NOT NULL DEFAULT 0,
    CONSTRAINT "OrdenTrabajoProducto_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajoProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrdenTrabajoProducto" ("cantidad", "costoUnitario", "id", "ordenTrabajoId", "precioUnitario", "productoId") SELECT "cantidad", "costoUnitario", "id", "ordenTrabajoId", "precioUnitario", "productoId" FROM "OrdenTrabajoProducto";
DROP TABLE "OrdenTrabajoProducto";
ALTER TABLE "new_OrdenTrabajoProducto" RENAME TO "OrdenTrabajoProducto";
CREATE TABLE "new_OrdenTrabajoServicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordenTrabajoId" TEXT NOT NULL,
    "servicioId" TEXT,
    "nombrePersonalizado" TEXT,
    "precioCobrado" DECIMAL NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "OrdenTrabajoServicio_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajoServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrdenTrabajoServicio" ("cantidad", "id", "ordenTrabajoId", "precioCobrado", "servicioId") SELECT "cantidad", "id", "ordenTrabajoId", "precioCobrado", "servicioId" FROM "OrdenTrabajoServicio";
DROP TABLE "OrdenTrabajoServicio";
ALTER TABLE "new_OrdenTrabajoServicio" RENAME TO "OrdenTrabajoServicio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
