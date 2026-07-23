import { and, asc, eq, inArray } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { projects, disciplines, projectDisciplines, projectRecommendations } from "@/lib/db/schema";
import { DEFAULT_SERVICES, type Caso } from "@/lib/landing-data";

/** Cuántos casos mostrar al pie cuando la recomendación cae a random. */
const MAX_RANDOM_RECS = 4;

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
 */
export async function getLandingCasos(): Promise<Caso[]> {
  await ensureDb();

  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.published, true), eq(projects.featured, true)))
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
      services: DEFAULT_SERVICES,
      recommended,
    } satisfies Caso;
  });
}
