-- CreateTable
CREATE TABLE "Trabajador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Puesto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_PuestoServicios" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PuestoServicios_A_fkey" FOREIGN KEY ("A") REFERENCES "Puesto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PuestoServicios_B_fkey" FOREIGN KEY ("B") REFERENCES "Servicio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "fechaIngreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" DATETIME,
    CONSTRAINT "OrdenTrabajo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_solicitudOrigenId_fkey" FOREIGN KEY ("solicitudOrigenId") REFERENCES "SolicitudAgendamiento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrdenTrabajo" ("creadoPorId", "estado", "fechaCierre", "fechaIngreso", "id", "numero", "observaciones", "solicitudOrigenId", "vehiculoId") SELECT "creadoPorId", "estado", "fechaCierre", "fechaIngreso", "id", "numero", "observaciones", "solicitudOrigenId", "vehiculoId" FROM "OrdenTrabajo";
DROP TABLE "OrdenTrabajo";
ALTER TABLE "new_OrdenTrabajo" RENAME TO "OrdenTrabajo";
CREATE UNIQUE INDEX "OrdenTrabajo_numero_key" ON "OrdenTrabajo"("numero");
CREATE UNIQUE INDEX "OrdenTrabajo_solicitudOrigenId_key" ON "OrdenTrabajo"("solicitudOrigenId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_PuestoServicios_AB_unique" ON "_PuestoServicios"("A", "B");

-- CreateIndex
CREATE INDEX "_PuestoServicios_B_index" ON "_PuestoServicios"("B");
