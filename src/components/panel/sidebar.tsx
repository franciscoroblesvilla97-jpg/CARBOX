"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Rol } from "@prisma/client";
import { signOutAction } from "@/app/panel/actions";

type NavItem = { href: string; label: string; adminOnly?: boolean };

const navItems: NavItem[] = [
  { href: "/panel/dashboard", label: "Dashboard" },
  { href: "/panel/clientes", label: "Clientes" },
  { href: "/panel/inventario", label: "Inventario" },
  { href: "/panel/servicios", label: "Servicios" },
  { href: "/panel/trabajadores", label: "Trabajadores" },
  { href: "/panel/puestos", label: "Puestos" },
  { href: "/panel/especificaciones", label: "Ficha técnica" },
  { href: "/panel/ordenes", label: "Órdenes de trabajo" },
  { href: "/panel/cotizaciones", label: "Cotizaciones" },
  { href: "/panel/agendamientos", label: "Agendamientos" },
  { href: "/panel/reportes", label: "Reportes", adminOnly: true },
  { href: "/panel/usuarios", label: "Usuarios", adminOnly: true },
];

export function Sidebar({ rol, nombre }: { rol: Rol; nombre: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-slate-100 min-h-screen flex flex-col print:hidden">
      <div className="px-5 py-5 border-b border-slate-800">
        <p className="text-lg font-bold">Carbox</p>
        <p className="text-xs text-slate-400">{nombre} · {rol === "ADMIN" ? "Administrador" : "Empleado"}</p>
      </div>
      <nav className="flex-1 py-4">
        {navItems
          .filter((item) => !item.adminOnly || rol === "ADMIN")
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
