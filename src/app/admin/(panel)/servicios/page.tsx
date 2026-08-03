import Link from "next/link";
import { getAllServices, getServiceUsageCounts } from "@/lib/data/services";
import { removeService } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

// Lee la DB (runtime-only): no prerenderizar en build, donde /data aún no existe.
export const dynamic = "force-dynamic";

export default async function ServiciosPage() {
  const [servicios, uso] = await Promise.all([getAllServices(), getServiceUsageCounts()]);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-[0.07em]">Servicios</h1>
          <p className="mt-1 text-sm text-black/50">
            {servicios.length} {servicios.length === 1 ? "servicio" : "servicios"} · las
            opciones de <strong>“Lo que hicimos”</strong> que aparecen al pie de cada caso.
            En cada proyecto tildás cuáles se hicieron.
          </p>
        </div>
        <Link
          href="/admin/servicios/nuevo"
          className="rounded-lg bg-[#16170f] px-4 py-2.5 text-sm font-semibold text-[#f5f3ec] transition-opacity hover:opacity-80"
        >
          + Nuevo servicio
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-[#faf9f5]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-black/40">
              <th className="px-4 py-3 font-medium">Ícono</th>
              <th className="px-4 py-3 font-medium">Servicio</th>
              <th className="px-4 py-3 font-medium">Se usa en</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((sv) => {
              const n = uso.get(sv.key) ?? 0;
              return (
                <tr key={sv.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-black/5">
                      {sv.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sv.icon} alt="" className="h-6 w-6 object-contain" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{sv.label}</p>
                    <p className="font-mono text-xs text-black/40">{sv.key}</p>
                  </td>
                  <td className="px-4 py-3 text-black/60">
                    {n} {n === 1 ? "caso" : "casos"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/servicios/${sv.id}`}
                        className="text-xs font-semibold text-[#16170f] hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton
                        id={sv.id}
                        action={removeService}
                        confirmMessage={
                          n > 0
                            ? `“${sv.label}” aparece hoy en ${n} ${
                                n === 1 ? "caso" : "casos"
                              }. Si lo borrás, deja de mostrarse en todos. ¿Continuar?`
                            : `¿Borrar “${sv.label}”? No se puede deshacer.`
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {servicios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-black/45">
                  No hay servicios todavía. Sin ninguno, el bloque “Lo que hicimos” no
                  aparece en los casos.{" "}
                  <Link href="/admin/servicios/nuevo" className="font-semibold underline">
                    Creá el primero
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-black/45">
        Un caso al que no le tildaste nada muestra <strong>todos</strong> los servicios de
        esta lista. Por eso al crear uno nuevo aparece solo, sin tener que editar los casos
        viejos uno por uno.
      </p>
    </div>
  );
}
