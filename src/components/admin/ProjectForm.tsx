import Link from "next/link";
import { saveProject } from "@/app/admin/actions";
import type { DisciplineRow, Project } from "@/lib/db/schema";

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
        <span className="font-display text-lg font-black">{title}</span>
      </legend>
      {hint && <p className="mb-4 text-xs text-black/45">{hint}</p>}
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

export function ProjectForm({
  project: p,
  disciplines = [],
  selectedDisciplineIds = [],
}: {
  project?: Project;
  disciplines?: DisciplineRow[];
  selectedDisciplineIds?: number[];
}) {
  const selected = new Set(selectedDisciplineIds);
  return (
    <form action={saveProject} className="grid gap-6">
      {p && <input type="hidden" name="id" value={p.id} />}

      {/* 1 · Identidad & contenido */}
      <Family n="1" title="Identidad & contenido">
        <div>
          <label className={labelCls}>Título *</label>
          <input name="title" required defaultValue={p?.title ?? ""} className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Cliente</label>
            <input name="client" defaultValue={p?.client ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Año</label>
            <input
              name="year"
              type="number"
              defaultValue={p?.year ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Categoría</label>
            <input name="category" defaultValue={p?.category ?? ""} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Locación</label>
          <input name="location" defaultValue={p?.location ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Descripción corta (tarjeta)</label>
          <textarea
            name="shortDesc"
            rows={2}
            defaultValue={p?.shortDesc ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Descripción larga (detalle)</label>
          <textarea
            name="longDesc"
            rows={4}
            defaultValue={p?.longDesc ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Créditos</label>
          <input name="credits" defaultValue={p?.credits ?? ""} className={inputCls} />
        </div>
      </Family>

      {/* 2 · Media */}
      <Family
        n="2"
        title="Recursos / media"
        hint="Por ahora se cargan por URL (imagen /seed/… o link externo). El upload de archivos a Storage se suma en producción."
      >
        <div>
          <label className={labelCls}>Portada (URL)</label>
          <input name="coverUrl" defaultValue={p?.coverUrl ?? ""} className={inputCls} />
          {p?.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.coverUrl}
              alt="Portada actual"
              className="mt-2 h-28 w-20 rounded-lg object-cover"
            />
          )}
        </div>
        <div>
          <label className={labelCls}>Video (Vimeo / YouTube / Storage)</label>
          <input name="videoUrl" defaultValue={p?.videoUrl ?? ""} className={inputCls} />
        </div>
      </Family>

      {/* 3 · Navegación */}
      <Family
        n="3"
        title="Navegación & vínculos"
        hint="El slug es la URL propia del proyecto (/work/slug). Si lo dejás vacío, se genera del título."
      >
        <div>
          <label className={labelCls}>Slug</label>
          <input name="slug" defaultValue={p?.slug ?? ""} className={inputCls} placeholder="le-coq-sportif" />
        </div>
      </Family>

      {/* 4 · Áreas (relación M2M con "Qué hacemos") */}
      <Family
        n="4"
        title="Áreas"
        hint="Las disciplinas de “Qué hacemos” con las que se vincula el proyecto. Habilitan la navegación cruzada: el caso lista sus áreas y cada área lista sus casos."
      >
        {disciplines.length === 0 ? (
          <p className="text-sm text-black/45">
            No hay áreas cargadas todavía.{" "}
            <Link href="/admin/disciplinas/nuevo" className="font-semibold underline">
              Creá la primera
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {disciplines.map((d) => (
              <label
                key={d.id}
                className="flex items-center gap-2.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium"
              >
                <input
                  type="checkbox"
                  name="disciplineIds"
                  value={d.id}
                  defaultChecked={selected.has(d.id)}
                  className="h-4 w-4 accent-[#16170f]"
                />
                {d.title}
                {!d.published && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-black/35">
                    borrador
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
      </Family>

      {/* 5 · Publicación & orden */}
      <Family n="5" title="Publicación & orden">
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="published"
              defaultChecked={Boolean(p?.published)}
              className="h-4 w-4 accent-[#16170f]"
            />
            Publicado
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={Boolean(p?.featured)}
              className="h-4 w-4 accent-[#16170f]"
            />
            Destacado (aparece en la home)
          </label>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-black/55">
              Orden
            </label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={p?.sortOrder ?? 0}
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
          href="/admin/proyectos"
          className="text-sm font-semibold text-black/50 hover:text-[#16170f]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
