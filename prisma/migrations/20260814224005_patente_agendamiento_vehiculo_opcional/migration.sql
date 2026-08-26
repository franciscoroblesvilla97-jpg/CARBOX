/*
  Warnings:

  - Added the required column `patente` to the `SolicitudAgendamiento` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SolicitudAgendamiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreContacto" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "patente" TEXT NOT NULL,
    "clienteId" TEXT,
    "vehiculoId" TEXT,
    "servicioTexto" TEXT NOT NULL,
    "fechaPreferida" DATETIME NOT NULL,
    "comentario" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SolicitudAgendamiento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SolicitudAgendamiento_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SolicitudAgendamiento" ("clienteId", "comentario", "createdAt", "email", "estado", "fechaPreferida", "id", "nombreContacto", "servicioTexto", "telefono", "vehiculoId") SELECT "clienteId", "comentario", "createdAt", "email", "estado", "fechaPreferida", "id", "nombreContacto", "servicioTexto", "telefono", "vehiculoId" FROM "SolicitudAgendamiento";
DROP TABLE "SolicitudAgendamiento";
ALTER TABLE "new_SolicitudAgendamiento" RENAME TO "SolicitudAgendamiento";
CREATE TABLE "new_Vehiculo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patente" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "anio" INTEGER,
    "clienteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vehiculo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vehiculo" ("anio", "clienteId", "createdAt", "id", "marca", "modelo", "patente") SELECT "anio", "clienteId", "createdAt", "id", "marca", "modelo", "patente" FROM "Vehiculo";
DROP TABLE "Vehiculo";
ALTER TABLE "new_Vehiculo" RENAME TO "Vehiculo";
CREATE UNIQUE INDEX "Vehiculo_patente_key" ON "Vehiculo"("patente");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
