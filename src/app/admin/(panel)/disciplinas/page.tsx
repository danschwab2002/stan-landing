import Link from "next/link";
import { getAllDisciplines, getDisciplineCasoCounts } from "@/lib/data/disciplines";
import { removeDiscipline, setDisciplinePublished } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { DisciplineRow } from "@/lib/db/schema";

// Lee la DB (runtime-only): no prerenderizar en build, donde /data aún no existe.
export const dynamic = "force-dynamic";

function PublishedToggle({ d }: { d: DisciplineRow }) {
  const on = Boolean(d.published);
  return (
    <form action={setDisciplinePublished}>
      <input type="hidden" name="id" value={d.id} />
      <button
        type="submit"
        className={
          on
            ? "rounded-full bg-[#16170f] px-3 py-1 text-xs font-semibold text-[#f5f3ec]"
            : "rounded-full border border-black/20 px-3 py-1 text-xs font-medium text-black/45 hover:border-black/40"
        }
      >
        {on ? "Publicada" : "Borrador"}
      </button>
    </form>
  );
}

export default async function DisciplinasPage() {
  const [disciplines, counts] = await Promise.all([
    getAllDisciplines(),
    getDisciplineCasoCounts(),
  ]);

  return (
    <div>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-black tracking-[0.07em]">Áreas</h1>
          <p className="mt-1 text-sm text-black/50">
            {disciplines.length} {disciplines.length === 1 ? "área" : "áreas"} · las
            disciplinas de <strong>“Qué hacemos”</strong>. Cada proyecto se asigna a una o
            varias desde su ficha.
          </p>
        </div>
        <Link
          href="/admin/disciplinas/nuevo"
          className="rounded-lg bg-[#16170f] px-4 py-2.5 text-sm font-semibold text-[#f5f3ec] transition-opacity hover:opacity-80"
        >
          + Nueva área
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-black/10 bg-[#faf9f5]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-black/40">
              <th className="px-4 py-3 font-medium">Ícono</th>
              <th className="px-4 py-3 font-medium">Área</th>
              <th className="px-4 py-3 font-medium">Casos</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {disciplines.map((d) => {
              const n = counts.get(d.id) ?? 0;
              return (
                <tr key={d.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-black/5">
                      {d.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.icon} alt="" className="h-6 w-6 object-contain" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{d.title}</p>
                    <p className="font-mono text-xs text-black/40">{d.key}</p>
                  </td>
                  <td className="px-4 py-3 text-black/60">
                    {n} {n === 1 ? "caso" : "casos"}
                  </td>
                  <td className="px-4 py-3">
                    <PublishedToggle d={d} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/disciplinas/${d.id}`}
                        className="text-xs font-semibold text-[#16170f] hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton
                        id={d.id}
                        action={removeDiscipline}
                        confirmMessage={
                          n > 0
                            ? `Esta área está asignada a ${n} ${
                                n === 1 ? "caso" : "casos"
                              }. Si la borrás, se desvincula de todos. ¿Continuar?`
                            : "¿Borrar esta área? No se puede deshacer."
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {disciplines.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-black/45">
                  No hay áreas todavía.{" "}
                  <Link href="/admin/disciplinas/nuevo" className="font-semibold underline">
                    Creá la primera
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
