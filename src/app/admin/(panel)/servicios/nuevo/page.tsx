import Link from "next/link";
import { ServiceForm } from "@/components/admin/ServiceForm";

// Importa la cadena de acceso a la DB (el cliente libsql abre eager): no
// prerenderizar en build, donde /data aún no existe. Panel dinámico.
export const dynamic = "force-dynamic";

export default function NuevoServicio() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/servicios"
        className="text-xs font-semibold text-black/45 hover:text-[#16170f]"
      >
        ← Servicios
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-black tracking-[0.07em]">
        Nuevo servicio
      </h1>
      <ServiceForm />
    </div>
  );
}
