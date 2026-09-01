-- AlterTable
ALTER TABLE "OrdenTrabajo" ADD COLUMN     "confirmadoCliente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recordatorioEnviado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenPublico" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_tokenPublico_key" ON "OrdenTrabajo"("tokenPublico");
