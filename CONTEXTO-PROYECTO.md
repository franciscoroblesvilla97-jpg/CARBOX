# Contexto del proyecto Carbox — para retomar en otra conversación

Este documento resume todo lo relevante del proyecto para que una nueva sesión de Claude
pueda seguir trabajando sin tener que redescubrirlo. Está escrito a fecha **20 de septiembre
de 2026**. Si algo de esto ya no calza con el código real, confía en el código, no en este
documento — es un resumen, no la fuente de verdad.

## Quién es el usuario

Francisco Robles Villa (`franciscoroblesvilla97@gmail.com`), dueño de **Carbox**, un
lubricentro/taller mecánico en Pedro de Valdivia 525, Concepción, Chile. No es programador —
dirige el negocio y da instrucciones en lenguaje natural, a veces con capturas de pantalla o
fotos. Prefiere que las cosas se prueben de verdad (en producción, con datos reales limpiados
después) antes de darlas por buenas, y corrige agregando contexto de negocio, no jerga técnica.

## Qué es el proyecto

Sitio web de Carbox: página pública (cotizador, buscador de neumáticos, agendamiento) +
panel administrativo interno (inventario, órdenes de trabajo, cotizaciones, usuarios, etc.).
Repo de GitHub: `franciscoroblesvilla97-jpg/CARBOX`, rama `main`. Deploy automático en
**Vercel** en cada push a `main`. Dominio real: **carboxconce.cl** (el dominio propio de
Vercel `carbox-iota.vercel.app` también existe pero no debe usarse como referencia — ya hubo
bugs por variables de entorno apuntando ahí en vez del dominio real).

## Stack técnico

- **Next.js 16.3.1** (App Router, Turbopack), **React 19**, **TypeScript**.
- **Prisma 6.19.3** sobre **PostgreSQL** (Neon, con endpoint pooled y uno directo).
- **NextAuth v5 (beta)** para el login del panel, con `Credentials` provider (email + hash bcrypt).
- **Tailwind CSS v4**, tokens de color definidos en `src/app/globals.css` bajo `@theme inline`.
- **Resend** para emails, **Twilio** para WhatsApp (ver limitaciones abajo).
- **Vercel Blob** para archivos adjuntos de las órdenes.
- Fuentes: **Barlow** (cuerpo) y **Barlow Condensed** (títulos), cargadas en `src/app/layout.tsx`.

### Advertencia importante sobre "Next.js"

`AGENTS.md` (importado desde `CLAUDE.md`) advierte que esta versión de Next.js puede tener
APIs distintas a las que un modelo conoce de su entrenamiento — conviene revisar
`node_modules/next/dist/docs/` antes de asumir comportamiento. Ese archivo es autogenerado
por `next dev`, no lo edites a mano.

## Sistema de diseño: "Industry"

Todo el sitio (público **y** panel administrativo, desde la sesión del 20-09) usa el mismo
sistema visual: fondo claro `--color-paper` (#f2f2f3), acentos azul acero `--color-accent`
(#5980a6), tipografía condensada en mayúsculas para títulos y botones, **sin bordes
redondeados**, tarjetas con borde de 1px en vez de sombra. Colores semánticos del checklist:
OK verde `#3f7d55`, vida útil ámbar `#b8860b`, cambio rojo `#a63327`.

Componentes base ya retematizados (cambiarlos ahí se propaga a todo el sitio):
`src/components/ui/button.tsx`, `input.tsx`, `badge.tsx`, `src/components/panel/sidebar.tsx`.

## Estructura de rutas

```
src/app/
  (public)/                    → home, /agendar, /nosotros, /servicios,
                                  /cotizacion/[id], /reserva/[token], /informe-orden/[id]
  login/                       → login del panel
  panel/                       → todo el panel interno, requiere sesión (NextAuth)
    dashboard, clientes, inventario, servicios, trabajadores, puestos,
    especificaciones, ordenes, cotizaciones, agendamientos, reportes, usuarios
  api/                         → /auth (NextAuth), /disponibilidad, /neumaticos, /cron
```

## Roles (`enum Rol`)

- **ADMIN**: acceso total, único que ve costos/márgenes y gestiona usuarios/reportes.
- **EMPLEADO**: panel completo salvo reportes y usuarios.
- **TECNICO** (agregado el 20-09): login propio, ve **solo sus órdenes asignadas**
  (filtro por `Usuario.trabajadorId` ↔ `OrdenTrabajo.trabajadorId`), **sin precios ni
  valores** en ningún lado. Puede: cambiar estado de su orden, llenar el checklist de
  ingreso, subir archivos, y agregar repuestos (del inventario sin ver precio, o "nuevos"
  que quedan `pendienteRevision` para que ADMIN/EMPLEADO les fije precio después).

## Modelos de datos clave (ver `prisma/schema.prisma` para el detalle completo)

- `Usuario` (login panel) — `trabajadorId` opcional, solo se usa para vincular una cuenta
  TECNICO a su `Trabajador`.
- `Cliente` → `Vehiculo` (patente única) → `OrdenTrabajo` / `Cotizacion` / `SolicitudAgendamiento`.
- `OrdenTrabajo`: `numero` único autoincremental **manual** (¡no usar `count()+1`, usar
  `aggregate({_max:{numero:true}})+1` — hubo bugs de colisión con `count()+1` cuando hay
  huecos en la secuencia; corregido en varios archivos, mantener el patrón!). Tiene
  `tokenPublico`, `trabajadorId`, `puestoId`, y relaciones a `checklist` (1-a-1) y `archivos`.
- `OrdenTrabajoProducto`: tiene `pendienteRevision Boolean` (repuesto agregado por un
  técnico sin catálogo/precio, pendiente que un admin lo fije).
- `ChecklistOrden` + `ChecklistItem` + `PresionNeumatico` + `MarcaCarroceria`: el checklist
  de ingreso (14 puntos de revisión, presiones de neumáticos, mapa de carrocería clickeable),
  1-a-1 con `OrdenTrabajo`. Se llena una sola vez por orden (upsert).
- `ArchivoOrden`: archivos subidos vía Vercel Blob, ligados a una orden.
- `Producto`: incluye `marca`, `medida`, `indice`, `imagenUrl` (usados por el buscador de
  neumáticos de la home).
- Todos los montos son `Decimal` en Prisma — **nunca pasar un campo `Decimal` directo desde
  un Server Component a un Client Component**, React tira un warning en consola (bug real
  que se encontró y corrigió el 20-09 en varios formularios). Siempre convertir con
  `Number(x)` antes de pasarlo como prop.

## Funcionalidades públicas

- **Cotizador de 3 pasos** (`src/components/public/home/cotizador.tsx`): elegir servicios →
  datos del vehículo/contacto → elegir día/hora → confirma (WhatsApp + email si dejó correo).
  Usa `crearSolicitudCotizador` en `src/app/(public)/agendar/actions.ts`.
- **Buscador de neumáticos** (`neumaticos.tsx` + `/api/neumaticos`): busca por
  ancho/perfil/aro contra el inventario real (`Producto.medida`).
- **Informes públicos** (sin login, por id/token): `/informe-orden/[id]`,
  `/cotizacion/[id]`, `/reserva/[token]`. El de orden incluye la revisión de ingreso completa
  (checklist, presiones, carrocería —siempre visible, dice "Sin daños registrados" si no hay
  marcas— y archivos adjuntos) desde el 20-09.

## Notificaciones (`src/lib/notificaciones.ts`)

- Al confirmar hora: WhatsApp + email de confirmación.
- Al completar una orden (`actualizarEstadoOrden` a `COMPLETADA`): WhatsApp + email
  "Tu vehículo está listo" con el detalle de servicios/productos y un link al informe
  completo (que ya incluye el checklist).
- **WhatsApp real (Twilio) no está operativo todavía**: el sandbox de Twilio exige un
  "WhatsApp Sender" aprobado, que requiere upgrade a plan pago + verificación de Meta
  Business — quedó bloqueado ahí explícitamente (no se hacen pagos sin que Francisco lo
  autorice y lo haga él mismo). El código ya está listo (`enviarWhatsApp` en
  `notificaciones.ts`), solo falta la habilitación de la cuenta.
- Emails sí funcionan en producción (Resend, dominio `notificaciones@carboxconce.cl`).

## Migraciones de Prisma — procedimiento obligatorio

`npx prisma migrate dev` **no funciona en este entorno** (no es interactivo). El
procedimiento que sí funciona, usado repetidamente:

```bash
# 1. Generar el SQL del diff sin aplicarlo
npx prisma migrate diff --from-url "$DIRECT_URL" --to-schema-datamodel prisma/schema.prisma --script > /tmp/migracion.sql

# 2. Crear la carpeta de migración a mano
mkdir -p prisma/migrations/$(date -u +%Y%m%d%H%M%S)_nombre_migracion
cp /tmp/migracion.sql prisma/migrations/.../migration.sql

# 3. Aplicarla
npx prisma migrate deploy
```

Si `migrate deploy`/`dev` se queja de que una migración pasada "fue modificada después de
aplicarse" (drift de checksum), **nunca aceptar el reset que ofrece** (borraría producción).
En vez de eso, recalcular el checksum real del archivo y hacer un `UPDATE` puntual en la
tabla `_prisma_migrations` (solo el campo `checksum`, nunca los datos del negocio) — esto ya
pasó una vez y se resolvió así, pidiendo confirmación explícita al usuario antes de tocar esa
tabla.

Después de cualquier migración: `npx prisma generate`. Si falla con `EPERM` en Windows, es
porque el dev server local sigue corriendo y tiene el archivo bloqueado — pararlo primero.

## Patrón de pruebas (muy importante, seguir siempre)

La base de datos local (`.env`) apunta a la **misma base de producción** (Neon). No hay
entorno de staging separado. El patrón establecido para probar cosas es:

1. Crear registros sintéticos reales contra producción (cliente, vehículo, orden, usuario de
   prueba) con nombres/emails claramente marcados como prueba (ej. `[PRUEBA]`,
   `zzz-prueba-claude-...@carboxconce.cl`, patentes tipo `DEMO01`/`FC1234`).
2. Ejercitar el flujo real (UI en el navegador, no solo scripts) contra `carboxconce.cl` en
   producción.
3. Verificar el resultado (consola, base de datos, o pidiéndole a Francisco que revise su
   correo).
4. **Limpiar los datos de prueba al terminar** — salvo que el usuario pida explícitamente
   dejarlos para que él los revise primero.
5. Antes de borrar algo ambiguo (¿es prueba o es real?), **preguntar** en vez de asumir. Ya
   pasó que una orden de prueba con matrícula real (la del propio Francisco) quedó "en
   progreso" y no se borró sin confirmar primero.

Nunca usar `git push --force`, nunca resetear la base sin autorización explícita y puntual.

## Verificación antes de cada deploy

Rutina usada en cada cambio de esta sesión, sin excepciones:

```bash
npx tsc --noEmit
npx eslint src
rm -rf .next && npx next build
```

Luego `git fetch origin && git log HEAD..origin/main --oneline` (por si hay otra sesión de
Claude trabajando en paralelo sobre el mismo repo — ya ha pasado), commit, push, y verificar
en GitHub (`https://github.com/franciscoroblesvilla97-jpg/CARBOX/commits/main`) que el check
de Vercel quede en verde (✓ 1/1) antes de avisar que está listo. El check tarda ~30-60s en
aparecer.

**Ojo con `.next`**: si se corre `next build` y después se levanta `next dev` (o viceversa)
sin borrar `.next` entre medio, el manifiesto de rutas se corrompe y aparecen 404 aleatorios
en rutas que sí existen. Borrar `.next` antes de cambiar entre build y dev.

## Historial de features grandes (más reciente primero)

1. **Foto real del hero** — reemplazado el placeholder rayado por la foto de la fachada.
2. **Sección de carrocería del informe siempre visible** ("Sin daños registrados" si no hay
   marcas) — antes se ocultaba entera si no había golpes/rayones, generaba confusión.
3. **Fix de `AUTH_URL`/`NEXTAUTH_URL` en Vercel**: el login desde `carboxconce.cl` rebotaba
   al dominio crudo `carbox-iota.vercel.app` y la sesión no quedaba activa ahí. Se corrigió
   la variable de entorno en Vercel (Settings → Environment Variables) apuntando a
   `https://carboxconce.cl` + redeploy. Ya verificado que funciona.
4. **Rediseño completo del panel a Industry** + **repuestos pendientes del técnico** (fijar
   precio desde el detalle de la orden, badge "Repuesto pendiente" en el listado).
5. **Checklist de ingreso + rol TECNICO**: la pieza más grande de esta sesión. Ver arriba.
6. **Rediseño de home pública** (sesión anterior): cotizador 3 pasos, buscador de
   neumáticos, sistema Industry — origen de todos los tokens de diseño que hoy usa todo el
   sitio.
7. Antes de eso: fixes de timezone (Chile vs UTC del server de Vercel), numeración con
   huecos, WhatsApp vía Twilio, mapa de Google real en contacto, BCC de emails al correo del
   taller.

## Pendientes conocidos / cosas a las que prestar atención

- **WhatsApp real no funciona** hasta que Francisco pague el upgrade de Twilio y verifique
  el negocio en Meta Business Manager — no iniciar ese pago sin que él lo pida y lo haga.
- El inventario de neumáticos tiene solo ~16 de 55 productos con `medida`/`marca` cargados
  correctamente — el resto no aparecerá en el buscador hasta que se complete esa data.
- No hay ambiente de staging: toda prueba es contra producción real, seguir el patrón de
  limpieza de la sección de arriba.
- `patente/` y `prisma/migrations_sqlite_backup/` en la raíz del repo son carpetas sueltas
  no versionadas, ajenas a este trabajo — no tocarlas ni añadirlas a commits.

## Credenciales y accesos

No hay contraseñas guardadas en este documento a propósito. Las cuentas reales del panel
son: admin (`admin@carboxconce.cl`), empleado/jefe de taller (`Eburgos@carboxconce.cl`), y
el técnico Lorenzo Miralles (`lmiralles@carboxconce.cl`). Las variables de entorno sensibles
(Resend, Twilio, Vercel Blob, `DATABASE_URL`/`DIRECT_URL`) viven en `.env` local (gitignored)
y en Vercel → Settings → Environment Variables — pedirle a Francisco que las comparta o las
edite él mismo cuando haga falta, nunca pedirlas por chat en texto plano si se puede evitar.
