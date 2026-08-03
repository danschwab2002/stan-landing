import Link from "next/link";
import { notFound } from "next/navigation";
import { getService } from "@/lib/data/services";
import { ServiceForm } from "@/components/admin/ServiceForm";

// Lee la DB (runtime-only): no prerenderizar en build, donde /data aún no existe.
export const dynamic = "force-dynamic";

export default async function EditarServicio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(Number(id));
  if (!service) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/servicios"
        className="text-xs font-semibold text-black/45 hover:text-[#16170f]"
      >
        ← Servicios
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-black tracking-[0.07em]">
        Editar: {service.label}
      </h1>
      <ServiceForm service={service} />
    </div>
  );
}
