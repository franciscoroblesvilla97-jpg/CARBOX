-- AlterTable
ALTER TABLE "Cotizacion" ADD COLUMN "anio" INTEGER;
ALTER TABLE "Cotizacion" ADD COLUMN "marca" TEXT;
ALTER TABLE "Cotizacion" ADD COLUMN "modelo" TEXT;

-- AlterTable
ALTER TABLE "SolicitudAgendamiento" ADD COLUMN "anio" INTEGER;
ALTER TABLE "SolicitudAgendamiento" ADD COLUMN "marca" TEXT;
ALTER TABLE "SolicitudAgendamiento" ADD COLUMN "modelo" TEXT;

-- CreateTable
CREATE TABLE "EspecificacionVehiculo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anioDesde" INTEGER,
    "anioHasta" INTEGER,
    "tipoAceite" TEXT,
    "capacidadAceite" TEXT,
    "tipoFiltroAceite" TEXT,
    "tipoNeumatico" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
