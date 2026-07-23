import { and, asc, eq } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import {
  projects,
  projectDisciplines,
  projectRecommendations,
  type NewProject,
  type Project,
} from "@/lib/db/schema";

/** Todos los proyectos, ordenados (vista del CMS). */
export async function getAllProjects(): Promise<Project[]> {
  await ensureDb();
  return db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.id));
}

/** Destacados y publicados — la grilla "Casos destacados" de la landing. */
export async function getFeaturedProjects(): Promise<Project[]> {
  await ensureDb();
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.published, true), eq(projects.featured, true)))
    .orderBy(asc(projects.sortOrder), asc(projects.id));
}

/** Todos los publicados — la vista /work completa. */
export async function getPublishedProjects(): Promise<Project[]> {
  await ensureDb();
  return db
    .select()
    .from(projects)
    .where(eq(projects.published, true))
    .orderBy(asc(projects.sortOrder), asc(projects.id));
}

export async function getProject(id: number): Promise<Project | undefined> {
  await ensureDb();
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0];
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  await ensureDb();
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return rows[0];
}

export async function createProject(data: NewProject): Promise<Project> {
  await ensureDb();
  const now = new Date().toISOString();
  const [row] = await db
    .insert(projects)
    .values({ ...data, createdAt: now, updatedAt: now })
    .returning();
  return row;
}

export async function updateProject(id: number, data: Partial<NewProject>): Promise<void> {
  await ensureDb();
  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(projects.id, id));
}

export async function deleteProject(id: number): Promise<void> {
  await ensureDb();
  // Limpiamos los vínculos M2M a mano (no dependemos del PRAGMA foreign_keys).
  await db.delete(projectDisciplines).where(eq(projectDisciplines.projectId, id));
  // Recomendaciones en ambos sentidos: este caso como origen y como recomendado.
  await db.delete(projectRecommendations).where(eq(projectRecommendations.projectId, id));
  await db.delete(projectRecommendations).where(eq(projectRecommendations.recommendedId, id));
  await db.delete(projects).where(eq(projects.id, id));
}

/** IDs de las disciplinas vinculadas a un proyecto (para pre-cargar el multi-select). */
export async function getProjectDisciplineIds(projectId: number): Promise<number[]> {
  await ensureDb();
  const rows = await db
    .select({ disciplineId: projectDisciplines.disciplineId })
    .from(projectDisciplines)
    .where(eq(projectDisciplines.projectId, projectId));
  return rows.map((r) => r.disciplineId);
}

/** Reemplaza el set de disciplinas de un proyecto (borra todo e inserta el nuevo set). */
export async function setProjectDisciplines(
  projectId: number,
  disciplineIds: number[]
): Promise<void> {
  await ensureDb();
  await db.delete(projectDisciplines).where(eq(projectDisciplines.projectId, projectId));
  const clean = [...new Set(disciplineIds)].filter((n) => Number.isFinite(n));
  if (clean.length === 0) return;
  await db
    .insert(projectDisciplines)
    .values(clean.map((disciplineId) => ({ projectId, disciplineId })));
}

/** IDs de los casos recomendados manualmente para un proyecto, en su orden (CMS). */
export async function getProjectRecommendationIds(projectId: number): Promise<number[]> {
  await ensureDb();
  const rows = await db
    .select({ recommendedId: projectRecommendations.recommendedId })
    .from(projectRecommendations)
    .where(eq(projectRecommendations.projectId, projectId))
    .orderBy(asc(projectRecommendations.sortOrder));
  return rows.map((r) => r.recommendedId);
}

/** Reemplaza el set de casos recomendados de un proyecto, respetando el orden dado.
 *  Un caso nunca se recomienda a sí mismo. Set vacío = sin recomendaciones manuales
 *  (la landing cae a random). */
export async function setProjectRecommendations(
  projectId: number,
  recommendedIds: number[]
): Promise<void> {
  await ensureDb();
  await db.delete(projectRecommendations).where(eq(projectRecommendations.projectId, projectId));
  const clean = [...new Set(recommendedIds)].filter(
    (n) => Number.isFinite(n) && n > 0 && n !== projectId
  );
  if (clean.length === 0) return;
  await db
    .insert(projectRecommendations)
    .values(clean.map((recommendedId, i) => ({ projectId, recommendedId, sortOrder: i })));
}
