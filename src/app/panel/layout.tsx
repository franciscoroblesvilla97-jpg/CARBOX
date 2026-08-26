import { requireSession } from "@/lib/permissions";
import { Sidebar } from "@/components/panel/sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();

  return (
    <div className="flex min-h-screen bg-slate-50 print:block print:bg-white">
      <Sidebar rol={user.rol} nombre={user.nombre} />
      <main className="flex-1 p-8 print:p-0">{children}</main>
    </div>
  );
}
