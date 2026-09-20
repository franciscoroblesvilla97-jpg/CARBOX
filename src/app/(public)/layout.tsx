"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { ContactBar } from "@/components/public/contact-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Home + páginas-informe enlazadas por correo/WhatsApp a un cliente puntual: usan
  // su propio encabezado de marca (Industry), no el nav general del sitio.
  const sinChromeAntiguo =
    pathname === "/" ||
    pathname.startsWith("/informe-orden") ||
    pathname.startsWith("/cotizacion") ||
    pathname.startsWith("/reserva");

  if (sinChromeAntiguo) {
    return <div className="flex flex-col min-h-screen">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ContactBar />
    </div>
  );
}
