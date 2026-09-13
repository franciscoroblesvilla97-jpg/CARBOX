-- AlterTable
ALTER TABLE "CotizacionServicio" ADD COLUMN     "descuento" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CotizacionProducto" ADD COLUMN     "descuento" DECIMAL(65,30) NOT NULL DEFAULT 0;
