import Link from "next/link";
import { notFound } from "next/navigation";
import { getDisciplineRow } from "@/lib/data/disciplines";
import { DisciplineForm } from "@/components/admin/DisciplineForm";

export default async function EditarDisciplina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const discipline = await getDisciplineRow(Number(id));
  if (!discipline) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/disciplinas"
        className="text-xs font-semibold text-black/45 hover:text-[#16170f]"
      >
        ← Áreas
      </Link>
      <h1 className="mb-6 mt-2 font-display text-3xl font-black tracking-tight">
        Editar: {discipline.title}
      </h1>
      <DisciplineForm discipline={discipline} />
    </div>
  );
}
