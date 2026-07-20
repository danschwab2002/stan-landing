import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { CASOS, DISCIPLINES } from "@/lib/landing-data";

const url = process.env.DATABASE_URL ?? "file:stan.db";
const client = createClient({ url });

export const db = drizzle(client, { schema });

/**
 * Init perezoso: crea las tablas si no existen y siembra contenido de ejemplo
 * la primera vez. Memoizado para correr una sola vez por proceso.
 *
 * El seed sale de `landing-data.ts` (CASOS + DISCIPLINES) — la MISMA fuente que
 * usaba el frontend estático — para que la landing recableada se vea idéntica.
 * En producción, esto lo reemplazan las migraciones de Drizzle.
 */
let ready: Promise<void> | null = null;
export function ensureDb(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}

async function init() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      client TEXT DEFAULT '',
      year INTEGER,
      category TEXT DEFAULT '',
      location TEXT DEFAULT '',
      short_desc TEXT DEFAULT '',
      long_desc TEXT DEFAULT '',
      credits TEXT DEFAULT '',
      cover_url TEXT DEFAULT '',
      video_url TEXT DEFAULT '',
      slug TEXT NOT NULL,
      published INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS disciplines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      icon TEXT DEFAULT '',
      description TEXT DEFAULT '',
      items TEXT DEFAULT '[]',
      detail TEXT DEFAULT '[]',
      published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS project_disciplines (
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      discipline_id INTEGER NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, discipline_id)
    )
  `);

  const dCount = Number(
    (await client.execute(`SELECT COUNT(*) AS c FROM disciplines`)).rows[0]?.c ?? 0
  );
  if (dCount === 0) await seedDisciplines();

  const pCount = Number(
    (await client.execute(`SELECT COUNT(*) AS c FROM projects`)).rows[0]?.c ?? 0
  );
  if (pCount === 0) await seedProjects();
}

/** Siembra las 5 disciplinas desde DISCIPLINES (landing-data). */
async function seedDisciplines() {
  const now = new Date().toISOString();
  for (let i = 0; i < DISCIPLINES.length; i++) {
    const d = DISCIPLINES[i];
    await client.execute({
      sql: `INSERT INTO disciplines
        (key, title, icon, description, items, detail, published, sort_order, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
      args: [
        d.key,
        d.title,
        d.icon,
        d.desc,
        JSON.stringify(d.items ?? []),
        JSON.stringify(d.detail ?? []),
        1,
        i,
        now,
        now,
      ],
    });
  }
}

/** Siembra los proyectos desde CASOS (landing-data) + su relación M2M con disciplinas. */
async function seedProjects() {
  const now = new Date().toISOString();

  // Mapa key→id de las disciplinas ya sembradas.
  const drows = await client.execute(`SELECT id, key FROM disciplines`);
  const discIdByKey = new Map<string, number>();
  for (const r of drows.rows) discIdByKey.set(String(r.key), Number(r.id));

  for (let i = 0; i < CASOS.length; i++) {
    const c = CASOS[i];
    const ins = await client.execute({
      sql: `INSERT INTO projects
        (title, client, year, category, location, short_desc, long_desc, credits,
         cover_url, video_url, slug, published, featured, sort_order, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        c.titleLines.join(" "), // título en caso normal; la vista lo pasa a mayúsculas
        c.client ?? "",
        c.year ?? null,
        c.tag, // etiqueta corta de la tarjeta
        "",
        c.lead,
        c.body,
        "",
        c.cover ?? "",
        "",
        c.key,
        1,
        1,
        i + 1,
        now,
        now,
      ],
    });
    const projectId = Number(ins.lastInsertRowid);

    for (const dk of c.disciplines ?? []) {
      const did = discIdByKey.get(dk);
      if (!did) continue;
      await client.execute({
        sql: `INSERT OR IGNORE INTO project_disciplines (project_id, discipline_id) VALUES (?,?)`,
        args: [projectId, did],
      });
    }
  }
}
