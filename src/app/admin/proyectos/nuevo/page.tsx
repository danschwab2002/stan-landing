import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getAllDisciplines } from "@/lib/data/disciplines";
import { getAllProjects } from "@/lib/data/projects";

// Lee la DB (runtime-only): no prerenderizar en build, donde /data aún no existe.
export const dynamic = "force-dynamic";

export default async function NuevoProyecto() {
  const [disciplines, allProjects] = await Promise.all([
    getAllDisciplines(),
    getAllProjects(),
  ]);
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/proyectos"
        className="text-xs font-semibold text-black/45 hover:text-[#16170f]"
      >
        ← Proyectos
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-black tracking-tight">
        Nuevo proyecto
      </h1>
      <ProjectForm disciplines={disciplines} allProjects={allProjects} />
    </div>
  );
}
