import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NuevoProyecto() {
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
      <ProjectForm />
    </div>
  );
}
