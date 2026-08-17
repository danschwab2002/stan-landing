import Link from "next/link";
import { saveProject } from "@/app/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import { USO_PORTADA_CASO } from "@/lib/image-usos";
import { VideoField } from "@/components/admin/VideoField";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import type { DisciplineRow, Project } from "@/lib/db/schema";
import type { ServiceTag } from "@/lib/landing-data";

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

export function ProjectForm({
  project: p,
  disciplines = [],
  selectedDisciplineIds = [],
  allProjects = [],
  selectedRecommendedIds = [],
  serviceCatalog = [],
}: {
  project?: Project;
  disciplines?: DisciplineRow[];
  selectedDisciplineIds?: number[];
  allProjects?: Project[];
  selectedRecommendedIds?: number[];
  /** Catálogo vivo de "Lo que hicimos" (tabla `services`, editable en el panel). */
  serviceCatalog?: ServiceTag[];
}) {
  const selected = new Set(selectedDisciplineIds);
  const selectedRecs = new Set(selectedRecommendedIds);
  // `gallery` viaja como JSON en texto; un valor corrupto no debe romper el panel.
  const gallery: string[] = (() => {
    try {
      const parsed = JSON.parse(p?.gallery || "[]");
      return Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === "string") : [];
    } catch {
      return [];
    }
  })();
  // "Lo que hicimos": las keys tildadas. Un proyecto que nunca se editó llega con
  // la lista vacía y la landing le muestra las 4 por defecto — por eso acá también
  // arrancan todas tildadas: lo que se ve en el panel es lo que se ve en la web.
  const savedServices: string[] = (() => {
    try {
      const parsed = JSON.parse(p?.services || "[]");
      return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
    } catch {
      return [];
    }
  })();
  const selectedServices =
    savedServices.length > 0
      ? new Set(savedServices)
      : new Set(serviceCatalog.map((sv) => sv.key));

  const otherProjects = allProjects.filter((op) => op.id !== p?.id);
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
        hint="La portada y el video se suben desde la compu y se optimizan solos. Los dos aceptan también una URL, por si el archivo ya está publicado en otro lado."
      >
        <ImageField
          name="coverUrl"
          label="Portada"
          defaultValue={p?.coverUrl}
          usos={USO_PORTADA_CASO}
          hint="Es la imagen de la tarjeta del caso y del encabezado del detalle. Se muestra en varias formas según dónde aparezca — abajo elegís qué parte se ve en cada una."
          previewClass="mt-2 h-28 w-20 rounded-lg object-cover"
        />
        <VideoField
          name="videoUrl"
          label="Video del caso"
          defaultValue={p?.videoUrl}
          hint="Se reproduce al abrir el caso, cuando el visitante toca el play. Si no cargás ninguno, la portada se muestra sola y sin botón."
        />
        <div>
          <label className={labelCls}>Stills del proyecto</label>
          <p className="mb-3 text-xs text-black/45">
            Las fotos que se muestran al abrir el caso, debajo de la ficha técnica. Van en el
            orden en que las pongas. <strong>Si no cargás ninguna, el bloque no aparece.</strong>
          </p>
          <GalleryEditor initial={gallery} />
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
        <div>
          <label className={labelCls}>Casos recomendados (al pie del caso)</label>
          <p className="mb-2 text-xs text-black/45">
            Los otros casos que se sugieren al final de este, para seguir recorriendo
            (“Otros casos destacados”). <strong>Si no elegís ninguno, se muestran al azar.</strong>
          </p>
          {otherProjects.length === 0 ? (
            <p className="text-sm text-black/45">No hay otros proyectos todavía.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {otherProjects.map((op) => (
                <label
                  key={op.id}
                  className="flex items-center gap-2.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium"
                >
                  <input
                    type="checkbox"
                    name="recommendedIds"
                    value={op.id}
                    defaultChecked={selectedRecs.has(op.id)}
                    className="h-4 w-4 accent-[#16170f]"
                  />
                  {op.title}
                  {!(op.published && op.featured) && (
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-black/35">
                      no visible
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      </Family>

      {/* 3b · "Lo que hicimos" — servicios ejecutados EN ESTE proyecto */}
      <Family
        n="3b"
        title="Lo que hicimos"
        hint="Los íconos que aparecen al pie del caso. Tildá solo lo que se hizo realmente en este proyecto: si fue una cobertura donde filmaron y editaron pero no hubo dirección creativa, destildá esa. Si no tocás nada, se muestran todos."
      >
        {serviceCatalog.length === 0 ? (
          <p className="text-sm text-black/45">
            No hay servicios cargados.{" "}
            <Link href="/admin/servicios/nuevo" className="font-semibold underline">
              Creá el primero
            </Link>
            .
          </p>
        ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {serviceCatalog.map((sv) => (
            <label
              key={sv.key}
              className="flex items-center gap-2.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium"
            >
              <input
                type="checkbox"
                name="services"
                value={sv.key}
                defaultChecked={selectedServices.has(sv.key)}
                className="h-4 w-4 accent-[#16170f]"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {sv.icon ? <img src={sv.icon} alt="" className="h-5 w-auto opacity-70" /> : null}
              {sv.label}
            </label>
          ))}
        </div>
        )}
        <p className="text-xs text-black/45">
          Si los destildás todos, el bloque “Lo que hicimos” no aparece en el caso. Para
          agregar o sacar opciones de esta lista, andá a{" "}
          <Link href="/admin/servicios" className="font-semibold underline">
            Servicios
          </Link>
          .
        </p>
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
