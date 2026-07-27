import Link from "next/link";
import { getAllProjects } from "@/lib/data/projects";
import { setFlag } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Project } from "@/lib/db/schema";

// Lee la DB (runtime-only): no prerenderizar en build, donde /data aún no existe.
export const dynamic = "force-dynamic";

function FlagToggle({
  project,
  field,
  onLabel,
  offLabel,
}: {
  project: Project;
  field: "published" | "featured";
  onLabel: string;
  offLabel: string;
}) {
  const on = Boolean(project[field]);
  return (
    <form action={setFlag}>
      <input type="hidden" name="id" value={project.id} />
      <input type="hidden" name="field" value={field} />
      <button
        type="submit"
        className={
          on
            ? "rounded-full bg-[#16170f] px-3 py-1 text-xs font-semibold text-[#f5f3ec]"
            : "rounded-full border border-black/20 px-3 py-1 text-xs font-medium text-black/45 hover:border-black/40"
        }
      >
        {on ? onLabel : offLabel}
      </button>
    </form>
  );
}

export default async function ProyectosPage() {
  const projects = await getAllProjects();

  return (
    <div>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-black tracking-[0.07em]">Proyectos</h1>
          <p className="mt-1 text-sm text-black/50">
            {projects.length} {projects.length === 1 ? "elemento" : "elementos"} · lo que
            marques como <strong>destacado + publicado</strong> aparece en la home.
          </p>
        </div>
        <Link
          href="/admin/proyectos/nuevo"
          className="rounded-lg bg-[#16170f] px-4 py-2.5 text-sm font-semibold text-[#f5f3ec] transition-opacity hover:opacity-80"
        >
          + Nuevo proyecto
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-black/10 bg-[#faf9f5]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-black/40">
              <th className="px-4 py-3 font-medium">Portada</th>
              <th className="px-4 py-3 font-medium">Proyecto</th>
              <th className="px-4 py-3 font-medium">Publicado</th>
              <th className="px-4 py-3 font-medium">Destacado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="h-13 w-10 overflow-hidden rounded bg-black/10">
                    {p.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-black/45">
                    {p.client || "—"} {p.year ? `· ${p.year}` : ""}{" "}
                    {p.category ? `· ${p.category}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <FlagToggle project={p} field="published" onLabel="Publicado" offLabel="Borrador" />
                </td>
                <td className="px-4 py-3">
                  <FlagToggle project={p} field="featured" onLabel="Destacado" offLabel="No" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/proyectos/${p.id}`}
                      className="text-xs font-semibold text-[#16170f] hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-black/45">
                  No hay proyectos todavía.{" "}
                  <Link href="/admin/proyectos/nuevo" className="font-semibold underline">
                    Creá el primero
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
