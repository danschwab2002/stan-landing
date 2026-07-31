"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProject,
  deleteProject,
  getProject,
  setProjectDisciplines,
  setProjectRecommendations,
  updateProject,
} from "@/lib/data/projects";
import {
  createDiscipline,
  deleteDiscipline,
  getDisciplineRow,
  updateDiscipline,
} from "@/lib/data/disciplines";
import { setSiteSettings } from "@/lib/data/settings";
import { normalizeInstagram } from "@/lib/instagram";
import { requireAuth } from "@/lib/auth-server";
import { isInternalAssetPath } from "@/lib/uploads";

function str(v: FormDataEntryValue | null): string {
  return (v ?? "").toString().trim();
}
/** Solo deja pasar URLs http(s) o vacío; descarta javascript:/data:/etc. (anti-XSS en href). */
function httpUrl(v: string): string {
  if (!v) return "";
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? v : "";
  } catch {
    return "";
  }
}

/**
 * Igual que `httpUrl` pero para campos de imagen, que además aceptan rutas internas
 * (`/uploads/…` de una subida, `/assets/…` del repo). `httpUrl` solo las rechazaría:
 * `new URL("/uploads/x.webp")` tira porque no es absoluta — sin esto, toda imagen
 * subida se guardaría como cadena vacía.
 */
function assetUrl(v: string): string {
  if (!v) return "";
  return isInternalAssetPath(v) ? v : httpUrl(v);
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
/**
 * Tarjetas del detalle de un área. El editor (`DetailCardsEditor`) emite tres
 * campos repetidos con el mismo nombre, uno por tarjeta; acá se cruzan por índice.
 * Los arrays llegan alineados porque `getAll()` respeta el orden del DOM y una
 * tarjeta sin imagen igual emite su campo vacío.
 *
 * Se descartan las tarjetas sin título: son las filas que el usuario agregó y
 * dejó en blanco. La imagen pasa por `assetUrl` — mismo saneamiento que el resto
 * de los campos de imagen (acepta `/uploads/…` y `/assets/…`, descarta el resto
 * que no sea http(s)).
 */
function parseDetail(formData: FormData): { title: string; desc: string; image: string }[] {
  const titles = formData.getAll("detailTitle");
  const descs = formData.getAll("detailDesc");
  const images = formData.getAll("detailImage");

  return titles
    .map((t, i) => ({
      title: str(t),
      desc: str(descs[i] ?? ""),
      image: assetUrl(str(images[i] ?? "")),
    }))
    .filter((c) => c.title !== "");
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
  await requireAuth();
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
    coverUrl: assetUrl(str(formData.get("coverUrl"))),
    videoUrl: httpUrl(str(formData.get("videoUrl"))),
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
  // Casos recomendados (rabbit-hole): lo tildado; vacío = random en la landing.
  await setProjectRecommendations(projectId, ids(formData, "recommendedIds"));

  revalidateAll();
  redirect("/admin/proyectos");
}

export async function removeProject(formData: FormData) {
  await requireAuth();
  const id = Number(str(formData.get("id")));
  await deleteProject(id);
  revalidateAll();
  redirect("/admin/proyectos");
}

/** Toggle inline de publicado/destacado desde la lista. */
export async function setFlag(formData: FormData) {
  await requireAuth();
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
  await requireAuth();
  const id = str(formData.get("id"));
  const title = str(formData.get("title"));

  const data = {
    key: str(formData.get("key")) || slugify(title),
    title,
    icon: assetUrl(str(formData.get("icon"))),
    image: assetUrl(str(formData.get("image"))),
    description: str(formData.get("description")),
    items: JSON.stringify(lines(formData.get("items"))),
    detail: JSON.stringify(parseDetail(formData)),
    published: bool(formData.get("published")),
    sortOrder: Number(str(formData.get("sortOrder")) || "0"),
  };

  if (id) await updateDiscipline(Number(id), data);
  else await createDiscipline(data);

  revalidateAll();
  redirect("/admin/disciplinas");
}

export async function removeDiscipline(formData: FormData) {
  await requireAuth();
  const id = Number(str(formData.get("id")));
  await deleteDiscipline(id);
  revalidateAll();
  redirect("/admin/disciplinas");
}

/** Toggle inline de publicado desde la lista de disciplinas. */
export async function setDisciplinePublished(formData: FormData) {
  await requireAuth();
  const id = Number(str(formData.get("id")));
  const current = await getDisciplineRow(id);
  if (!current) return;
  await updateDiscipline(id, { published: !current.published });
  revalidateAll();
}

// ─── Contacto (ajustes globales del sitio) ───────────────────────────────────

/** Guarda los dos puntos de contacto (WhatsApp + Calendly) desde su formulario. */
export async function saveContact(formData: FormData) {
  await requireAuth();
  await setSiteSettings({
    whatsappUrl: httpUrl(str(formData.get("whatsappUrl"))),
    calendlyUrl: httpUrl(str(formData.get("calendlyUrl"))),
    // No pasa por httpUrl: el campo acepta tambien "@cuenta" o "instagram.com/cuenta",
    // y normalizeInstagram reconstruye la URL desde el usuario extraido.
    instagramUrl: normalizeInstagram(str(formData.get("instagram"))).url,
  });
  revalidatePath("/");
  revalidatePath("/admin/contacto");
  redirect("/admin/contacto?ok=1");
}
