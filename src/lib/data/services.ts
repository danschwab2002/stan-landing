import { asc, eq } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { projects, services, type NewServiceRow, type ServiceRow } from "@/lib/db/schema";
import type { ServiceTag } from "@/lib/landing-data";

/** Fila DB → shape que consume la landing. */
function toServiceTag(r: ServiceRow): ServiceTag {
  return { key: r.key, label: r.label, icon: r.icon ?? "" };
}

/**
 * El catálogo de "Lo que hicimos", ordenado. Lo consumen tres lugares: la landing
 * (para resolver las keys de cada caso), el form de proyecto (para pintar los
 * checkboxes) y la Server Action (para validar lo que llega del form).
 */
export async function getServiceCatalog(): Promise<ServiceTag[]> {
  await ensureDb();
  const rows = await db
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.id));
  return rows.map(toServiceTag);
}

/** Las filas crudas — vista del CMS (necesita el id para editar/borrar). */
export async function getAllServices(): Promise<ServiceRow[]> {
  await ensureDb();
  return db.select().from(services).orderBy(asc(services.sortOrder), asc(services.id));
}

/**
 * Cuántos proyectos tienen tildado cada servicio (`key` → cantidad), para avisar
 * antes de borrar. Se cuenta en JS y no en SQL porque las keys viven dentro de un
 * JSON en `projects.services`; con 13 proyectos el costo es irrelevante.
 *
 * Un proyecto con la lista vacía cuenta para **todos**: así se ve la landing.
 */
export async function getServiceUsageCounts(): Promise<Map<string, number>> {
  await ensureDb();
  const rows = await db.select({ services: projects.services }).from(projects);
  const catalog = await getServiceCatalog();
  const out = new Map<string, number>();
  for (const sv of catalog) out.set(sv.key, 0);

  for (const r of rows) {
    let keys: string[] = [];
    try {
      const parsed = JSON.parse(r.services || "[]");
      if (Array.isArray(parsed)) keys = parsed.filter((k): k is string => typeof k === "string");
    } catch {
      keys = [];
    }
    const efectivas = keys.length > 0 ? keys : catalog.map((s) => s.key);
    for (const k of efectivas) {
      if (out.has(k)) out.set(k, (out.get(k) ?? 0) + 1);
    }
  }
  return out;
}

export async function getService(id: number): Promise<ServiceRow | undefined> {
  await ensureDb();
  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return rows[0];
}

export async function createService(data: NewServiceRow): Promise<void> {
  await ensureDb();
  const now = new Date().toISOString();
  await db.insert(services).values({ ...data, createdAt: now, updatedAt: now });
}

export async function updateService(id: number, data: Partial<NewServiceRow>): Promise<void> {
  await ensureDb();
  await db
    .update(services)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(services.id, id));
}

/**
 * Borra un servicio del catálogo.
 *
 * **No limpia las keys de `projects.services`** a propósito: `servicesFromKeys`
 * ignora las que no existen, así que un caso que lo tenía tildado simplemente deja
 * de mostrar ese ícono. Barrer los 13 proyectos en cada borrado sería un costo
 * grande para evitar un dato huérfano que ya es inofensivo — y si el borrado fue un
 * error, volver a crear el servicio con la misma `key` lo restituye en todos.
 */
export async function deleteService(id: number): Promise<void> {
  await ensureDb();
  await db.delete(services).where(eq(services.id, id));
}
