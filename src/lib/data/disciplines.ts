import { asc, eq, sql } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import {
  disciplines,
  projectDisciplines,
  type DisciplineRow,
  type NewDisciplineRow,
} from "@/lib/db/schema";
import type { Discipline, DisciplineDetailItem } from "@/lib/landing-data";

function parseArr<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Fila DB → shape de la vista (`Discipline`). `detail` vacío se normaliza a undefined
 *  para conservar la semántica del frontend estático (undefined = sin detalle). */
function toDiscipline(r: DisciplineRow): Discipline {
  const detail = parseArr<DisciplineDetailItem[]>(r.detail, []);
  return {
    key: r.key,
    title: r.title,
    icon: r.icon ?? "",
    desc: r.description ?? "",
    items: parseArr<string[]>(r.items, []),
    detail: detail.length > 0 ? detail : undefined,
  };
}

/** Disciplinas publicadas, ordenadas — alimenta "Qué hacemos" y los overlays de área. */
export async function getPublishedDisciplines(): Promise<Discipline[]> {
  await ensureDb();
  const rows = await db
    .select()
    .from(disciplines)
    .where(eq(disciplines.published, true))
    .orderBy(asc(disciplines.sortOrder), asc(disciplines.id));
  return rows.map(toDiscipline);
}

/** Todas las disciplinas (vista del CMS, incluye no publicadas). */
export async function getAllDisciplines(): Promise<DisciplineRow[]> {
  await ensureDb();
  return db.select().from(disciplines).orderBy(asc(disciplines.sortOrder), asc(disciplines.id));
}

/** Cuántos casos usa cada disciplina (id → cantidad), para la lista del CMS. */
export async function getDisciplineCasoCounts(): Promise<Map<number, number>> {
  await ensureDb();
  const rows = await db
    .select({
      disciplineId: projectDisciplines.disciplineId,
      n: sql<number>`count(*)`,
    })
    .from(projectDisciplines)
    .groupBy(projectDisciplines.disciplineId);
  const m = new Map<number, number>();
  for (const r of rows) m.set(r.disciplineId, Number(r.n));
  return m;
}

export async function getDisciplineRow(id: number): Promise<DisciplineRow | undefined> {
  await ensureDb();
  const rows = await db.select().from(disciplines).where(eq(disciplines.id, id)).limit(1);
  return rows[0];
}

export async function createDiscipline(data: NewDisciplineRow): Promise<DisciplineRow> {
  await ensureDb();
  const now = new Date().toISOString();
  const [row] = await db
    .insert(disciplines)
    .values({ ...data, createdAt: now, updatedAt: now })
    .returning();
  return row;
}

export async function updateDiscipline(
  id: number,
  data: Partial<NewDisciplineRow>
): Promise<void> {
  await ensureDb();
  await db
    .update(disciplines)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(disciplines.id, id));
}

export async function deleteDiscipline(id: number): Promise<void> {
  await ensureDb();
  // Limpiamos los vínculos a mano (no dependemos de que el PRAGMA foreign_keys
  // esté ON en libsql) y después borramos la disciplina.
  await db.delete(projectDisciplines).where(eq(projectDisciplines.disciplineId, id));
  await db.delete(disciplines).where(eq(disciplines.id, id));
}
