import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/nosotros", label: "Nosotros" },
];

export function Navbar() {
  return (
    <header className="bg-green-600 sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          CARBOX
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-green-50">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/agendar"
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors"
        >
          Agendar hora
        </Link>
      </div>
    </header>
  );
}
