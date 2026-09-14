-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "imagenUrl" TEXT,
ADD COLUMN     "indice" TEXT,
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "medida" TEXT;

-- CreateIndex
CREATE INDEX "Producto_categoria_medida_idx" ON "Producto"("categoria", "medida");
