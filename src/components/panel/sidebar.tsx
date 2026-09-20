"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Rol } from "@prisma/client";
import { signOutAction } from "@/app/panel/actions";

type NavItem = { href: string; label: string; roles: Rol[] };

const navItems: NavItem[] = [
  { href: "/panel/dashboard", label: "Dashboard", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/clientes", label: "Clientes", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/inventario", label: "Inventario", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/servicios", label: "Servicios", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/trabajadores", label: "Trabajadores", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/puestos", label: "Puestos", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/especificaciones", label: "Ficha técnica", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/ordenes", label: "Órdenes de trabajo", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/ordenes", label: "Mis órdenes", roles: ["TECNICO"] },
  { href: "/panel/cotizaciones", label: "Cotizaciones", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/agendamientos", label: "Agendamientos", roles: ["ADMIN", "EMPLEADO"] },
  { href: "/panel/reportes", label: "Reportes", roles: ["ADMIN"] },
  { href: "/panel/usuarios", label: "Usuarios", roles: ["ADMIN"] },
];

const etiquetaRol: Record<Rol, string> = {
  ADMIN: "Administrador",
  EMPLEADO: "Empleado",
  TECNICO: "Técnico",
};

export function Sidebar({ rol, nombre }: { rol: Rol; nombre: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-slate-100 min-h-screen flex flex-col print:hidden">
      <div className="px-5 py-5 border-b border-slate-800">
        <p className="text-lg font-bold">Carbox</p>
        <p className="text-xs text-slate-400">
          {nombre} · {etiquetaRol[rol]}
        </p>
      </div>
      <nav className="flex-1 py-4">
        {navItems
          .filter((item) => item.roles.includes(rol))
          .map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-5 py-2.5 text-sm ${
                  active ? "bg-green-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
      <form action={signOutAction} className="p-4 border-t border-slate-800">
        <button type="submit" className="text-sm text-slate-400 hover:text-white">
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
