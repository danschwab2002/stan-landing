import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "STAN — Panel de contenido",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#eceae1] text-[#16170f]">
      {/* En pantallas chicas el menu se apila arriba: con el aside de 224px fijo al
          costado, al contenido le quedaban ~78px y toda pagina del panel desbordaba
          horizontalmente en el celular. */}
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-8 sm:flex-row sm:gap-10 sm:px-6 sm:py-10">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
