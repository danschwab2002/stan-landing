"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProject,
  deleteProject,
  getProject,
  updateProject,
} from "@/lib/data/projects";

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

/** Revalida las superficies que dependen de los proyectos (la landing + el CMS). */
function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/proyectos");
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

  if (id) await updateProject(Number(id), data);
  else await createProject(data);

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
