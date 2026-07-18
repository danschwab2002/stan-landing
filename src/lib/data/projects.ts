import { and, asc, eq } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { projects, type NewProject, type Project } from "@/lib/db/schema";

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
  await db.delete(projects).where(eq(projects.id, id));
}
