import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/data/projects";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default async function EditarProyecto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(Number(id));
  if (!project) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/proyectos"
        className="text-xs font-semibold text-black/45 hover:text-[#16170f]"
      >
        ← Proyectos
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-black tracking-tight">
        Editar: {project.title}
      </h1>
      <ProjectForm project={project} />
    </div>
  );
}
