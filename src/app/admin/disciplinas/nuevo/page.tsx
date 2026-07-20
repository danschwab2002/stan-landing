import Link from "next/link";
import { DisciplineForm } from "@/components/admin/DisciplineForm";

export default function NuevaDisciplina() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/disciplinas"
        className="text-xs font-semibold text-black/45 hover:text-[#16170f]"
      >
        ← Áreas
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-black tracking-tight">
        Nueva área
      </h1>
      <DisciplineForm />
    </div>
  );
}
