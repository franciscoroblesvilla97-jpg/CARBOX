# CARBOX

Sistema de control para lubricentro: sitio público (agendamiento de horas) y panel administrativo interno (clientes, vehículos, inventario, órdenes de trabajo, cotizaciones y dashboard).

## Desarrollo local

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router) + TypeScript, Prisma, Auth.js, Tailwind CSS, Zod.
