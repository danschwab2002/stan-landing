import { getSiteSettings } from "@/lib/data/settings";
import { ContactForm } from "@/components/admin/ContactForm";

// Lee la DB (runtime-only): no prerenderizar en build, donde /data aún no existe.
export const dynamic = "force-dynamic";

export default async function ContactoAdmin({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const [settings, sp] = await Promise.all([getSiteSettings(), searchParams]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 font-display text-3xl font-black tracking-tight">Contacto</h1>
      <p className="mb-6 text-sm text-black/50">
        Los dos puntos de contacto de la landing: WhatsApp y agendamiento por Calendly.
      </p>
      <ContactForm settings={settings} saved={sp.ok === "1"} />
    </div>
  );
}
