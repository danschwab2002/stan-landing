import { and, asc, eq, inArray } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { projects, disciplines, projectDisciplines } from "@/lib/db/schema";
import { DEFAULT_SERVICES, type Caso } from "@/lib/landing-data";

/**
 * Casos de la landing = proyectos publicados + destacados, mapeados al shape
 * `Caso` que consumen los componentes, con sus disciplinas resueltas vía el
 * join M2M (G11). Reemplaza al `CASOS` estático de landing-data.
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

  return rows.map((r) => {
    const title = r.title ?? "";
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
    } satisfies Caso;
  });
}
