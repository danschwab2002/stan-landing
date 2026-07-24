import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "./schema";
import { DISCIPLINES, SITE } from "@/lib/landing-data";
import { SEED_PROJECTS } from "./seed-data";

/**
 * Cliente + drizzle PEREZOSOS: no abrir la conexión al importar el módulo.
 *
 * El cliente libsql abre el archivo de forma *eager* dentro de `createClient()`.
 * Si eso corre en build (Next importa el módulo de cada página para leer su
 * config, arrastrando `lib/db`), y `DATABASE_URL` apunta a `/data/stan.db` —el
 * volumen que recién se monta en runtime— el build revienta con SQLITE_CANTOPEN.
 * Difiriendo la creación al primer uso, importar `db` nunca toca la DB en build;
 * solo se conecta en runtime, cuando se ejecuta una query de verdad.
 */
let _client: Client | null = null;
function getClient(): Client {
  if (!_client) {
    const url = process.env.DATABASE_URL ?? "file:stan.db";
    _client = createClient({ url });
  }
  return _client;
}

type DB = LibSQLDatabase<typeof schema>;
let _db: DB | null = null;
function getDb(): DB {
  if (!_db) _db = drizzle(getClient(), { schema });
  return _db;
}

/**
 * Fachada perezosa: conserva la interfaz `db.select()…` de siempre, pero sin que
 * importar el módulo cree la conexión. Los consumidores solo tocan `db` dentro
 * de funciones async (runtime), así que el proxy nunca se dispara en el import.
 */
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(real)
      : value;
  },
});

/**
 * Init perezoso: crea las tablas si no existen y siembra contenido de ejemplo
 * la primera vez. Memoizado para correr una sola vez por proceso.
 *
 * Los proyectos salen de `seed-data.ts` (carga inicial real, export de Wix del
 * 2026-07-24); las disciplinas/áreas de `landing-data.ts` (DISCIPLINES). El seed
 * solo corre con la tabla vacía → en prod, resetear la DB re-siembra los reales.
 * A partir de ahí el CMS es la fuente de verdad.
 */
let ready: Promise<void> | null = null;
export function ensureDb(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}

async function init() {
  await getClient().execute(`
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

  await getClient().execute(`
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

  await getClient().execute(`
    CREATE TABLE IF NOT EXISTS project_disciplines (
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      discipline_id INTEGER NOT NULL REFERENCES disciplines(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, discipline_id)
    )
  `);

  await getClient().execute(`
    CREATE TABLE IF NOT EXISTS project_recommendations (
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      recommended_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      sort_order INTEGER DEFAULT 0,
      PRIMARY KEY (project_id, recommended_id)
    )
  `);

  await getClient().execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    )
  `);
  await seedSettings();

  const dCount = Number(
    (await getClient().execute(`SELECT COUNT(*) AS c FROM disciplines`)).rows[0]?.c ?? 0
  );
  if (dCount === 0) await seedDisciplines();

  const pCount = Number(
    (await getClient().execute(`SELECT COUNT(*) AS c FROM projects`)).rows[0]?.c ?? 0
  );
  if (pCount === 0) await seedProjects();
}

/** Siembra las 5 disciplinas desde DISCIPLINES (landing-data). */
async function seedDisciplines() {
  const now = new Date().toISOString();
  for (let i = 0; i < DISCIPLINES.length; i++) {
    const d = DISCIPLINES[i];
    await getClient().execute({
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

/**
 * Siembra los ajustes globales una sola vez (INSERT OR IGNORE: nunca pisa un
 * valor que Adriano ya haya cargado desde el CMS). `whatsapp_url` arranca con
 * el número placeholder de landing-data para no romper el link existente;
 * `calendly_embed` vacío hasta que Adriano pegue el iframe.
 */
async function seedSettings() {
  const defaults: Record<string, string> = {
    whatsapp_url: `https://wa.me/${SITE.contact.whatsapp}`,
    calendly_embed: SITE.contact.calendly,
  };
  for (const [key, value] of Object.entries(defaults)) {
    await getClient().execute({
      sql: `INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)`,
      args: [key, value],
    });
  }
}

/** Siembra los proyectos reales desde SEED_PROJECTS (seed-data) + su relación M2M con disciplinas. */
async function seedProjects() {
  const now = new Date().toISOString();

  // Mapa key→id de las disciplinas ya sembradas.
  const drows = await getClient().execute(`SELECT id, key FROM disciplines`);
  const discIdByKey = new Map<string, number>();
  for (const r of drows.rows) discIdByKey.set(String(r.key), Number(r.id));

  for (const p of SEED_PROJECTS) {
    const ins = await getClient().execute({
      sql: `INSERT INTO projects
        (title, client, year, category, location, short_desc, long_desc, credits,
         cover_url, video_url, slug, published, featured, sort_order, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        p.title,
        p.client,
        p.year,
        p.category,
        p.location,
        p.shortDesc,
        p.longDesc,
        p.credits,
        p.coverUrl,
        p.videoUrl,
        p.slug,
        p.published ? 1 : 0,
        p.featured ? 1 : 0,
        p.sortOrder,
        now,
        now,
      ],
    });
    const projectId = Number(ins.lastInsertRowid);

    for (const dk of p.disciplines ?? []) {
      const did = discIdByKey.get(dk);
      if (!did) continue;
      await getClient().execute({
        sql: `INSERT OR IGNORE INTO project_disciplines (project_id, discipline_id) VALUES (?,?)`,
        args: [projectId, did],
      });
    }
  }
}
