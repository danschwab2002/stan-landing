import Link from "next/link";
import { saveDiscipline } from "@/app/admin/actions";
import type { DisciplineRow } from "@/lib/db/schema";

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

function parseArr<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function DisciplineForm({ discipline: d }: { discipline?: DisciplineRow }) {
  const itemsText = parseArr<string[]>(d?.items, []).join("\n");
  const detailText = parseArr<{ title: string; desc: string }[]>(d?.detail, [])
    .map((it) => `${it.title} :: ${it.desc}`)
    .join("\n");

  return (
    <form action={saveDiscipline} className="grid gap-6">
      {d && <input type="hidden" name="id" value={d.id} />}

      {/* 1 · Identidad & contenido */}
      <Family n="1" title="Identidad & contenido">
        <div>
          <label className={labelCls}>Título *</label>
          <input name="title" required defaultValue={d?.title ?? ""} className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Key (slug estable)</label>
            <input
              name="key"
              defaultValue={d?.key ?? ""}
              className={inputCls}
              placeholder="content"
            />
            <p className="mt-1 text-xs text-black/40">
              Identificador interno del vínculo con los casos. Si lo dejás vacío, se genera
              del título. Cambiarlo desvincula los proyectos ya asignados.
            </p>
          </div>
          <div>
            <label className={labelCls}>Ícono (URL)</label>
            <input
              name="icon"
              defaultValue={d?.icon ?? ""}
              className={inputCls}
              placeholder="/assets/imagery/ic-contenido.png"
            />
          </div>
        </div>
        {d?.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.icon} alt="Ícono actual" className="h-9 w-auto" />
        ) : null}
        <div>
          <label className={labelCls}>Descripción</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={d?.description ?? ""}
            className={inputCls}
          />
        </div>
      </Family>

      {/* 2 · Ítems del listado */}
      <Family
        n="2"
        title="Ítems del listado"
        hint="Uno por línea. Es la lista corta que aparece bajo la descripción en la sección “Qué hacemos”."
      >
        <textarea
          name="items"
          rows={5}
          defaultValue={itemsText}
          className={inputCls}
          placeholder={"Estrategia de contenido\nProducción audiovisual\nParrilla mensual"}
        />
      </Family>

      {/* 3 · Detalle del overlay */}
      <Family
        n="3"
        title="Detalle del overlay"
        hint="Opcional. Una tarjeta por línea con el formato «Título :: descripción». Es el bloque ampliado que se ve al abrir el área. Dejalo vacío si el área no tiene detalle."
      >
        <textarea
          name="detail"
          rows={5}
          defaultValue={detailText}
          className={inputCls}
          placeholder={"Estrategia :: Definimos el norte editorial.\nProducción :: Rodamos y editamos las piezas."}
        />
      </Family>

      {/* 4 · Publicación & orden */}
      <Family n="4" title="Publicación & orden">
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="published"
              defaultChecked={d ? Boolean(d.published) : true}
              className="h-4 w-4 accent-[#16170f]"
            />
            Publicado (aparece en la home)
          </label>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-black/55">
              Orden
            </label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={d?.sortOrder ?? 0}
              className="w-20 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </Family>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-lg bg-[#16170f] px-5 py-2.5 text-sm font-semibold text-[#f5f3ec] transition-opacity hover:opacity-80"
        >
          Guardar
        </button>
        <Link
          href="/admin/disciplinas"
          className="text-sm font-semibold text-black/50 hover:text-[#16170f]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
