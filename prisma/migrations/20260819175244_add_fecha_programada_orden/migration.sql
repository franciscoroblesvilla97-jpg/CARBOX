-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrdenTrabajo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "trabajadorId" TEXT,
    "puestoId" TEXT,
    "solicitudOrigenId" TEXT,
    "cotizacionOrigenId" TEXT,
    "fechaIngreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaProgramada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" DATETIME,
    CONSTRAINT "OrdenTrabajo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_solicitudOrigenId_fkey" FOREIGN KEY ("solicitudOrigenId") REFERENCES "SolicitudAgendamiento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_cotizacionOrigenId_fkey" FOREIGN KEY ("cotizacionOrigenId") REFERENCES "Cotizacion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrdenTrabajo" ("cotizacionOrigenId", "creadoPorId", "estado", "fechaCierre", "fechaIngreso", "id", "numero", "observaciones", "puestoId", "solicitudOrigenId", "trabajadorId", "vehiculoId") SELECT "cotizacionOrigenId", "creadoPorId", "estado", "fechaCierre", "fechaIngreso", "id", "numero", "observaciones", "puestoId", "solicitudOrigenId", "trabajadorId", "vehiculoId" FROM "OrdenTrabajo";
DROP TABLE "OrdenTrabajo";
ALTER TABLE "new_OrdenTrabajo" RENAME TO "OrdenTrabajo";
CREATE UNIQUE INDEX "OrdenTrabajo_numero_key" ON "OrdenTrabajo"("numero");
CREATE UNIQUE INDEX "OrdenTrabajo_solicitudOrigenId_key" ON "OrdenTrabajo"("solicitudOrigenId");
CREATE UNIQUE INDEX "OrdenTrabajo_cotizacionOrigenId_key" ON "OrdenTrabajo"("cotizacionOrigenId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
