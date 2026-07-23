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
        hint="Pegá el código del widget inline de Calendly. En Calendly: Share → Add to website → Inline Embed → copiás el código y lo pegás acá tal cual. Si lo dejás vacío, en la sección de contacto se muestra un placeholder."
      >
        <div>
          <label className={labelCls}>Código iframe (embed)</label>
          <textarea
            name="calendlyEmbed"
            rows={5}
            defaultValue={settings.calendlyEmbed}
            className={`${inputCls} font-mono text-xs`}
            placeholder='<iframe src="https://calendly.com/stan/30min" width="100%" height="100%" frameborder="0"></iframe>'
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
