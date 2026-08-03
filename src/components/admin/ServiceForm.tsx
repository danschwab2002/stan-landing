import Link from "next/link";
import { saveService } from "@/app/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import type { ServiceRow } from "@/lib/db/schema";

const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#16170f]";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/55";

/**
 * Alta/edición de un servicio del catálogo de "Lo que hicimos".
 *
 * La `key` **solo se muestra al editar, y como dato de lectura**: es lo que guardan
 * los proyectos que tienen el servicio tildado, así que cambiarla los desataría a
 * todos de golpe. Al crear se deriva del nombre.
 */
export function ServiceForm({ service: s }: { service?: ServiceRow }) {
  return (
    <form action={saveService} className="grid gap-6">
      {s && <input type="hidden" name="id" value={s.id} />}

      <fieldset className="rounded-xl border border-black/10 bg-[#faf9f5] p-5">
        <legend className="flex items-baseline gap-2 px-1">
          <span className="font-mono text-xs text-black/40">1</span>
          <span className="font-display text-lg font-black tracking-[0.07em]">El servicio</span>
        </legend>
        <p className="mb-4 text-xs text-black/45">
          Aparece como ícono + nombre al pie de cada caso que lo tenga tildado, en el bloque
          “Lo que hicimos”.
        </p>

        <div className="grid gap-4">
          <div>
            <label className={labelCls}>Nombre</label>
            <input
              name="label"
              defaultValue={s?.label ?? ""}
              required
              className={inputCls}
              placeholder="Dirección de arte"
            />
            <p className="mt-1.5 text-xs text-black/45">
              Es lo que se lee debajo del ícono. Podés cambiarlo cuando quieras: se
              actualiza en todos los casos y no desvincula ninguno.
            </p>
          </div>

          <ImageField
            name="icon"
            label="Ícono"
            defaultValue={s?.icon ?? ""}
            hint="PNG con fondo transparente, en el amarillo de marca — pedíselo al equipo de diseño. Se muestra chico (unos 38px de alto)."
            previewClass="mt-2 h-12 w-auto object-contain"
          />

          <div>
            <label className={labelCls}>Orden</label>
            <input
              type="number"
              name="sortOrder"
              defaultValue={s?.sortOrder ?? 0}
              className={inputCls}
            />
            <p className="mt-1.5 text-xs text-black/45">
              De menor a mayor. Define en qué orden salen los íconos dentro del caso.
            </p>
          </div>

          {s && (
            <div>
              <label className={labelCls}>Identificador interno</label>
              <p className="font-mono text-sm text-black/55">{s.key}</p>
              <p className="mt-1.5 text-xs text-black/45">
                No se puede cambiar: es la etiqueta con la que cada proyecto tiene guardado
                este servicio. Para cambiar lo que se ve, editá el nombre de arriba.
              </p>
            </div>
          )}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-[#16170f] px-5 py-2.5 text-sm font-semibold text-[#f5f3ec] transition-opacity hover:opacity-80"
        >
          Guardar
        </button>
        <Link
          href="/admin/servicios"
          className="text-sm font-semibold text-black/45 hover:text-[#16170f]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
