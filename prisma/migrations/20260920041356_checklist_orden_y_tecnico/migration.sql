-- CreateEnum
CREATE TYPE "EstadoChecklist" AS ENUM ('OK', 'VIDA_UTIL', 'CAMBIO');

-- CreateEnum
CREATE TYPE "TipoDanoCarroceria" AS ENUM ('GOLPE', 'RAYON', 'OTRO');

-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'TECNICO';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "trabajadorId" TEXT;

-- CreateTable
CREATE TABLE "ChecklistOrden" (
    "id" TEXT NOT NULL,
    "ordenTrabajoId" TEXT NOT NULL,
    "kilometraje" INTEGER,
    "observaciones" TEXT,
    "completadoPorId" TEXT,
    "completadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistOrden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistOrdenId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" "EstadoChecklist" NOT NULL DEFAULT 'OK',
    "observacion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresionNeumatico" (
    "id" TEXT NOT NULL,
    "checklistOrdenId" TEXT NOT NULL,
    "posicion" TEXT NOT NULL,
    "recomendada" DECIMAL(65,30),
    "medida" DECIMAL(65,30),
    "estado" "EstadoChecklist" NOT NULL DEFAULT 'OK',
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PresionNeumatico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarcaCarroceria" (
    "id" TEXT NOT NULL,
    "checklistOrdenId" TEXT NOT NULL,
    "tipo" "TipoDanoCarroceria" NOT NULL DEFAULT 'GOLPE',
    "x" DECIMAL(65,30) NOT NULL,
    "y" DECIMAL(65,30) NOT NULL,
    "zona" TEXT NOT NULL,
    "nota" TEXT,

    CONSTRAINT "MarcaCarroceria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivoOrden" (
    "id" TEXT NOT NULL,
    "ordenTrabajoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT,
    "subidoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivoOrden_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistOrden_ordenTrabajoId_key" ON "ChecklistOrden"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "ChecklistItem_checklistOrdenId_orden_idx" ON "ChecklistItem"("checklistOrdenId", "orden");

-- CreateIndex
CREATE INDEX "PresionNeumatico_checklistOrdenId_orden_idx" ON "PresionNeumatico"("checklistOrdenId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_trabajadorId_key" ON "Usuario"("trabajadorId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistOrden" ADD CONSTRAINT "ChecklistOrden_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistOrden" ADD CONSTRAINT "ChecklistOrden_completadoPorId_fkey" FOREIGN KEY ("completadoPorId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistOrdenId_fkey" FOREIGN KEY ("checklistOrdenId") REFERENCES "ChecklistOrden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresionNeumatico" ADD CONSTRAINT "PresionNeumatico_checklistOrdenId_fkey" FOREIGN KEY ("checklistOrdenId") REFERENCES "ChecklistOrden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarcaCarroceria" ADD CONSTRAINT "MarcaCarroceria_checklistOrdenId_fkey" FOREIGN KEY ("checklistOrdenId") REFERENCES "ChecklistOrden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivoOrden" ADD CONSTRAINT "ArchivoOrden_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivoOrden" ADD CONSTRAINT "ArchivoOrden_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "Trabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

