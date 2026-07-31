import { saveContact } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/data/settings";

const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#16170f]";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/55";

function Family({
  n,
  title,
  hint,
  children,
}: {
  n: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-black/10 bg-[#faf9f5] p-5">
      <legend className="flex items-baseline gap-2 px-1">
        <span className="font-mono text-xs text-black/40">{n}</span>
        <span className="font-display text-lg font-black tracking-[0.07em]">{title}</span>
      </legend>
      {hint && <p className="mb-4 text-xs text-black/45">{hint}</p>}
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

export function ContactForm({ settings, saved }: { settings: SiteSettings; saved?: boolean }) {
  return (
    <form action={saveContact} className="grid gap-6">
      {saved && (
        <p className="rounded-lg border border-emerald-600/25 bg-emerald-600/10 px-4 py-2.5 text-sm font-medium text-emerald-800">
          Guardado. Los cambios ya se ven en la landing.
        </p>
      )}

      {/* 1 · WhatsApp */}
      <Family
        n="1"
        title="WhatsApp"
        hint="El link completo al que redirige el botón de WhatsApp. Usá el formato https://wa.me/54911XXXXXXXX (el número con código de país, sin “+” ni espacios). Podés sumarle un mensaje pre-cargado con ?text=Hola%20Stan."
      >
        <div>
          <label className={labelCls}>Link de WhatsApp</label>
          <input
            name="whatsappUrl"
            type="url"
            defaultValue={settings.whatsappUrl}
            className={inputCls}
            placeholder="https://wa.me/5491112345678"
          />
        </div>
      </Family>

      {/* 2 · Calendly */}
      <Family
        n="2"
        title="Calendly"
        hint="Pegá el link de tu calendario de Calendly (ej. https://calendly.com/stan/primera-reunion). En Calendly lo encontrás en Share → Copy link. El botón “Agendá una llamada” de la landing lo abre en una ventana flotante. Si lo dejás vacío, el botón lleva a la sección de contacto."
      >
        <div>
          <label className={labelCls}>Link de Calendly</label>
          <input
            name="calendlyUrl"
            type="url"
            defaultValue={settings.calendlyUrl}
            className={inputCls}
            placeholder="https://calendly.com/stan/primera-reunion"
          />
        </div>
      </Family>

      {/* 3 · Instagram */}
      <Family
        n="3"
        title="Instagram"
        hint="Pegá el link de tu perfil o escribí el usuario con arroba — las dos formas funcionan. El usuario que se muestra en la sección de Contacto sale de acá, así que el texto y el link nunca pueden quedar apuntando a cuentas distintas. Si lo dejás vacío, el dato no se muestra."
      >
        <div>
          <label className={labelCls}>Instagram</label>
          <input
            name="instagram"
            defaultValue={settings.instagramUrl}
            className={inputCls}
            placeholder="@standforthevision"
          />
        </div>
      </Family>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-lg bg-[#16170f] px-5 py-2.5 text-sm font-semibold text-[#f5f3ec] transition-opacity hover:opacity-80"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
