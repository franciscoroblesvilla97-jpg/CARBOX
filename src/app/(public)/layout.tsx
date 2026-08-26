import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { ContactBar } from "@/components/public/contact-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ContactBar />
    </div>
  );
}
