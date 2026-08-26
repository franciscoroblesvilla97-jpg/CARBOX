-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "telefono" TEXT,
    "patente" TEXT,
    "clienteId" TEXT,
    "vehiculoId" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cotizacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cotizacion_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cotizacion_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CotizacionServicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cotizacionId" TEXT NOT NULL,
    "servicioId" TEXT,
    "nombrePersonalizado" TEXT,
    "precioCobrado" DECIMAL NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "CotizacionServicio_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CotizacionServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CotizacionProducto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cotizacionId" TEXT NOT NULL,
    "productoId" TEXT,
    "nombrePersonalizado" TEXT,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL NOT NULL,
    "costoUnitario" DECIMAL NOT NULL DEFAULT 0,
    CONSTRAINT "CotizacionProducto_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CotizacionProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "cotizacionOrigenId" TEXT,
    "fechaIngreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" DATETIME,
    CONSTRAINT "OrdenTrabajo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_solicitudOrigenId_fkey" FOREIGN KEY ("solicitudOrigenId") REFERENCES "SolicitudAgendamiento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdenTrabajo_cotizacionOrigenId_fkey" FOREIGN KEY ("cotizacionOrigenId") REFERENCES "Cotizacion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrdenTrabajo" ("creadoPorId", "estado", "fechaCierre", "fechaIngreso", "id", "numero", "observaciones", "puestoId", "solicitudOrigenId", "trabajadorId", "vehiculoId") SELECT "creadoPorId", "estado", "fechaCierre", "fechaIngreso", "id", "numero", "observaciones", "puestoId", "solicitudOrigenId", "trabajadorId", "vehiculoId" FROM "OrdenTrabajo";
DROP TABLE "OrdenTrabajo";
ALTER TABLE "new_OrdenTrabajo" RENAME TO "OrdenTrabajo";
CREATE UNIQUE INDEX "OrdenTrabajo_numero_key" ON "OrdenTrabajo"("numero");
CREATE UNIQUE INDEX "OrdenTrabajo_solicitudOrigenId_key" ON "OrdenTrabajo"("solicitudOrigenId");
CREATE UNIQUE INDEX "OrdenTrabajo_cotizacionOrigenId_key" ON "OrdenTrabajo"("cotizacionOrigenId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Cotizacion_numero_key" ON "Cotizacion"("numero");
