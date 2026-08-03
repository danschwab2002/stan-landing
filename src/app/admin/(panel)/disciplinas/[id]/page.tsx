import Link from "next/link";
import { notFound } from "next/navigation";
import { getDisciplineRow } from "@/lib/data/disciplines";
import { getPublishedProjects } from "@/lib/data/projects";
import { DisciplineForm } from "@/components/admin/DisciplineForm";

// Lee la DB (runtime-only): no prerenderizar en build, donde /data aún no existe.
export const dynamic = "force-dynamic";

export default async function EditarDisciplina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [discipline, projects] = await Promise.all([
    getDisciplineRow(Number(id)),
    // Solo publicados: mandar a un caso despublicado seria un click a la nada.
    getPublishedProjects(),
  ]);
  if (!discipline) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/disciplinas"
        className="text-xs font-semibold text-black/45 hover:text-[#16170f]"
      >
        ← Áreas
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-black tracking-[0.07em]">
        Editar: {discipline.title}
      </h1>
      <DisciplineForm
        discipline={discipline}
        projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
      />
    </div>
  );
}
