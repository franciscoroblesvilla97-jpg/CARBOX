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
    <aside className="w-60 shrink-0 bg-ink text-paper min-h-screen flex flex-col print:hidden font-[family-name:var(--font-barlow)]">
      <div className="px-5 py-5 border-b border-paper/16 flex items-center gap-2">
        <span className="flex items-center justify-center w-[27px] h-[27px] bg-accent font-[family-name:var(--font-barlow-condensed)] font-bold text-[17px] shrink-0">
          C
        </span>
        <div>
          <p className="font-[family-name:var(--font-barlow-condensed)] font-bold text-[16px] tracking-[0.14em] uppercase">
            Carbox
          </p>
          <p className="text-[11px] text-neutral-400">
            {nombre} · {etiquetaRol[rol]}
          </p>
        </div>
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
                className={`block px-5 py-2.5 text-[14px] tracking-[0.02em] ${
                  active ? "bg-accent text-paper" : "text-neutral-300 hover:bg-paper/8"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
      <form action={signOutAction} className="p-4 border-t border-paper/16">
        <button type="submit" className="text-[13px] text-neutral-400 hover:text-paper">
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
