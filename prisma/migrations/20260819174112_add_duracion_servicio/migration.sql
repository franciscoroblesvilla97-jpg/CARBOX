-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Servicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioBase" DECIMAL NOT NULL,
    "duracionMinutos" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Servicio" ("activo", "descripcion", "id", "nombre", "precioBase") SELECT "activo", "descripcion", "id", "nombre", "precioBase" FROM "Servicio";
DROP TABLE "Servicio";
ALTER TABLE "new_Servicio" RENAME TO "Servicio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
