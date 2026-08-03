import { and, asc, eq, inArray } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { projects, disciplines, projectDisciplines, projectRecommendations } from "@/lib/db/schema";
import { servicesFromKeys, type Caso } from "@/lib/landing-data";
import { getServiceCatalog } from "@/lib/data/services";

/** Cuántos casos mostrar al pie cuando la recomendación cae a random. */
const MAX_RANDOM_RECS = 4;

/** `gallery` y `services` viajan como JSON en texto (mismo criterio que
 *  `items`/`detail` de disciplinas). Ante un valor corrupto se cae a lista vacía:
 *  el caso se muestra sin stills —o con los servicios por defecto— antes que
 *  romper la landing entera. */
function parseStrList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === "string" && u !== "") : [];
  } catch {
    return [];
  }
}

/** Hasta `n` elementos al azar (Fisher-Yates parcial). */
function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

/**
 * Casos de la landing = proyectos publicados + destacados, mapeados al shape
 * `Caso` que consumen los componentes, con sus disciplinas resueltas vía el
 * join M2M (G11) y sus casos recomendados (rabbit-hole: manual desde el CMS o,
 * si no hay asignados, un set al azar — decisión Adriano 22/07). Reemplaza al
 * `CASOS` estático de landing-data.
 *
 * Es la grilla "Casos destacados" del Home: la vidriera curada de Stan.
 */
export async function getLandingCasos(): Promise<Caso[]> {
  return loadCasos(true);
}

/**
 * Casos que alimentan las subpáginas de área: **todos los publicados**, no solo
 * los destacados.
 *
 * "Destacado del Home" y "caso del área" son dos cosas distintas. El Home
 * muestra una selección corta y curada; la subpágina del área es el catálogo de
 * ese área. Con un único set —los 4 destacados repartidos entre 4 áreas— cada
 * área mostraba ~1 caso, contra los "dos o tres" que definió Bianca (BB Factor,
 * 29/07) y que el mockup ilustra. Separar las dos consultas evita el efecto
 * colateral de la alternativa (marcar más proyectos como destacados infla
 * también la vidriera del Home).
 */
export async function getAreaCasos(): Promise<Caso[]> {
  return loadCasos(false);
}

async function loadCasos(onlyFeatured: boolean): Promise<Caso[]> {
  await ensureDb();

  const rows = await db
    .select()
    .from(projects)
    .where(
      onlyFeatured
        ? and(eq(projects.published, true), eq(projects.featured, true))
        : eq(projects.published, true)
    )
    .orderBy(asc(projects.sortOrder), asc(projects.id));
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const links = await db
    .select({
      projectId: projectDisciplines.projectId,
      key: disciplines.key,
      sortOrder: disciplines.sortOrder,
    })
    .from(projectDisciplines)
    .innerJoin(disciplines, eq(projectDisciplines.disciplineId, disciplines.id))
    .where(inArray(projectDisciplines.projectId, ids));

  const keysByProject = new Map<number, string[]>();
  for (const l of links) {
    const arr = keysByProject.get(l.projectId) ?? [];
    arr.push(l.key);
    keysByProject.set(l.projectId, arr);
  }
  // (los links ya vienen ordenados por sortOrder de disciplina vía el orden de inserción;
  //  el orden fino no es crítico para la vista)

  // Recomendaciones manuales (dirigidas), solo entre proyectos visibles en la landing.
  const slugById = new Map<number, string>();
  for (const r of rows) slugById.set(r.id, r.slug);

  const recLinks = await db
    .select({
      projectId: projectRecommendations.projectId,
      recommendedId: projectRecommendations.recommendedId,
    })
    .from(projectRecommendations)
    .where(inArray(projectRecommendations.projectId, ids))
    .orderBy(asc(projectRecommendations.sortOrder));

  const manualRecsByProject = new Map<number, string[]>();
  for (const l of recLinks) {
    const recSlug = slugById.get(l.recommendedId);
    if (!recSlug) continue; // el recomendado no está publicado/destacado → se omite
    const arr = manualRecsByProject.get(l.projectId) ?? [];
    arr.push(recSlug);
    manualRecsByProject.set(l.projectId, arr);
  }

  const allSlugs = rows.map((r) => r.slug);
  // Una sola lectura del catálogo para todos los casos del lote.
  const serviceCatalog = await getServiceCatalog();

  return rows.map((r) => {
    const title = r.title ?? "";
    const manual = manualRecsByProject.get(r.id) ?? [];
    const recommended =
      manual.length > 0
        ? manual
        : pickRandom(
            allSlugs.filter((k) => k !== r.slug),
            MAX_RANDOM_RECS
          );
    return {
      key: r.slug,
      tag: r.category ?? "",
      title: title.toUpperCase(),
      titleLines: [title],
      cover: r.coverUrl || undefined,
      client: r.client || undefined,
      year: r.year ?? undefined,
      disciplines: keysByProject.get(r.id) ?? [],
      lead: r.shortDesc ?? "",
      body: r.longDesc ?? "",
      // Vacío → todo el catálogo (ver servicesFromKeys): un caso que nadie tocó
      // se sigue viendo igual que antes de que existiera la columna.
      services: servicesFromKeys(parseStrList(r.services), serviceCatalog),
      recommended,
      video: r.videoUrl || undefined,
      gallery: parseStrList(r.gallery),
    } satisfies Caso;
  });
}
