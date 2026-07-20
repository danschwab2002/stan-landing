"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProject,
  deleteProject,
  getProject,
  setProjectDisciplines,
  updateProject,
} from "@/lib/data/projects";
import {
  createDiscipline,
  deleteDiscipline,
  getDisciplineRow,
  updateDiscipline,
} from "@/lib/data/disciplines";

function str(v: FormDataEntryValue | null): string {
  return (v ?? "").toString().trim();
}
function bool(v: FormDataEntryValue | null): boolean {
  const s = str(v).toLowerCase();
  return s === "on" || s === "true" || s === "1";
}
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
/** Un textarea → array de líneas no vacías. */
function lines(v: FormDataEntryValue | null): string[] {
  return str(v)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
/** Textarea "Título :: descripción" por línea → [{ title, desc }]. */
function parseDetail(v: FormDataEntryValue | null): { title: string; desc: string }[] {
  return lines(v).map((l) => {
    const [title, ...rest] = l.split("::");
    return { title: title.trim(), desc: rest.join("::").trim() };
  });
}
/** IDs de disciplinas tildadas en el multi-select. */
function ids(formData: FormData, name: string): number[] {
  return formData
    .getAll(name)
    .map((v) => Number(str(v)))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Revalida las superficies que dependen del contenido (la landing + el CMS). */
function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/proyectos");
  revalidatePath("/admin/disciplinas");
}

/** Crea o actualiza un proyecto desde el formulario del molde. */
export async function saveProject(formData: FormData) {
  const id = str(formData.get("id"));
  const title = str(formData.get("title"));
  const yearRaw = str(formData.get("year"));

  const data = {
    title,
    client: str(formData.get("client")),
    year: yearRaw ? Number(yearRaw) : null,
    category: str(formData.get("category")),
    location: str(formData.get("location")),
    shortDesc: str(formData.get("shortDesc")),
    longDesc: str(formData.get("longDesc")),
    credits: str(formData.get("credits")),
    coverUrl: str(formData.get("coverUrl")),
    videoUrl: str(formData.get("videoUrl")),
    slug: str(formData.get("slug")) || slugify(title),
    published: bool(formData.get("published")),
    featured: bool(formData.get("featured")),
    sortOrder: Number(str(formData.get("sortOrder")) || "0"),
  };

  let projectId: number;
  if (id) {
    await updateProject(Number(id), data);
    projectId = Number(id);
  } else {
    const created = await createProject(data);
    projectId = created.id;
  }

  // Áreas (relación M2M): reemplaza el set con lo tildado en el form.
  await setProjectDisciplines(projectId, ids(formData, "disciplineIds"));

  revalidateAll();
  redirect("/admin/proyectos");
}

export async function removeProject(formData: FormData) {
  const id = Number(str(formData.get("id")));
  await deleteProject(id);
  revalidateAll();
  redirect("/admin/proyectos");
}

/** Toggle inline de publicado/destacado desde la lista. */
export async function setFlag(formData: FormData) {
  const id = Number(str(formData.get("id")));
  const field = str(formData.get("field")); // "published" | "featured"
  const current = await getProject(id);
  if (!current) return;

  if (field === "published") await updateProject(id, { published: !current.published });
  else if (field === "featured") await updateProject(id, { featured: !current.featured });

  revalidateAll();
}

// ─── Disciplinas (áreas de "Qué hacemos") ────────────────────────────────────

/** Crea o actualiza una disciplina desde su formulario. */
export async function saveDiscipline(formData: FormData) {
  const id = str(formData.get("id"));
  const title = str(formData.get("title"));

  const data = {
    key: str(formData.get("key")) || slugify(title),
    title,
    icon: str(formData.get("icon")),
    description: str(formData.get("description")),
    items: JSON.stringify(lines(formData.get("items"))),
    detail: JSON.stringify(parseDetail(formData.get("detail"))),
    published: bool(formData.get("published")),
    sortOrder: Number(str(formData.get("sortOrder")) || "0"),
  };

  if (id) await updateDiscipline(Number(id), data);
  else await createDiscipline(data);

  revalidateAll();
  redirect("/admin/disciplinas");
}

export async function removeDiscipline(formData: FormData) {
  const id = Number(str(formData.get("id")));
  await deleteDiscipline(id);
  revalidateAll();
  redirect("/admin/disciplinas");
}

/** Toggle inline de publicado desde la lista de disciplinas. */
export async function setDisciplinePublished(formData: FormData) {
  const id = Number(str(formData.get("id")));
  const current = await getDisciplineRow(id);
  if (!current) return;
  await updateDiscipline(id, { published: !current.published });
  revalidateAll();
}
