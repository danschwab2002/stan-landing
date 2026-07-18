import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:stan.db";
const client = createClient({ url });

export const db = drizzle(client, { schema });

/**
 * Init perezoso: crea la tabla si no existe y siembra contenido de ejemplo
 * la primera vez. Memoizado para correr una sola vez por proceso.
 * (En producción esto lo reemplazan las migraciones de Drizzle sobre Postgres/Supabase.)
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

  const res = await client.execute(`SELECT COUNT(*) AS c FROM projects`);
  const count = Number(res.rows[0]?.c ?? 0);
  if (count === 0) await seed();
}

async function seed() {
  const now = new Date().toISOString();
  const rows = [
    {
      title: "Le Coq Sportif",
      client: "Le Coq Sportif",
      year: 2024,
      category: "Content",
      location: "Buenos Aires",
      short_desc: "Campaña de marca con sistema de contenido de alto impacto.",
      long_desc:
        "Desarrollamos un sistema de contenido para el lanzamiento de temporada, pensado para generar impacto y consistencia en todas las plataformas.",
      credits: "Dirección: STAN · Producción: STAN",
      cover_url: "/seed/lecoq.jpg",
      video_url: "https://vimeo.com/76979871",
      slug: "le-coq-sportif",
      published: 1,
      featured: 1,
      sort_order: 1,
    },
    {
      title: "Chandon",
      client: "Chandon",
      year: 2024,
      category: "Experiences",
      location: "Buenos Aires",
      short_desc: "Experiencia inmersiva para un lanzamiento de marca.",
      long_desc:
        "Convertimos un espacio físico en una experiencia memorable: escenografía, luz y producción integral para una noche de marca.",
      credits: "Dirección creativa: STAN",
      cover_url: "/seed/chandon.jpg",
      video_url: "https://vimeo.com/76979871",
      slug: "chandon",
      published: 1,
      featured: 1,
      sort_order: 2,
    },
    {
      title: "Cocos Capital",
      client: "Cocos Capital",
      year: 2023,
      category: "Streaming",
      location: "Buenos Aires",
      short_desc: "Programa en vivo y cobertura de eventos financieros.",
      long_desc:
        "Diseñamos experiencias en vivo para conectar con la audiencia en tiempo real: estudio, dirección y distribución multiplataforma.",
      credits: "Producción: STAN",
      cover_url: "/seed/cocos.jpg",
      video_url: "https://vimeo.com/76979871",
      slug: "cocos-capital",
      published: 1,
      featured: 1,
      sort_order: 3,
    },
    {
      title: "Faro",
      client: "Faro",
      year: 2023,
      category: "Production",
      location: "Buenos Aires",
      short_desc: "Desde la idea hasta la entrega final.",
      long_desc:
        "Producción integral de la pieza: filmación, postproducción y dirección creativa de punta a punta.",
      credits: "Dirección: STAN",
      cover_url: "/seed/faro.jpg",
      video_url: "https://vimeo.com/76979871",
      slug: "faro",
      published: 1,
      featured: 0,
      sort_order: 4,
    },
  ];

  for (const r of rows) {
    await client.execute({
      sql: `INSERT INTO projects
        (title, client, year, category, location, short_desc, long_desc, credits,
         cover_url, video_url, slug, published, featured, sort_order, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        r.title, r.client, r.year, r.category, r.location, r.short_desc,
        r.long_desc, r.credits, r.cover_url, r.video_url, r.slug,
        r.published, r.featured, r.sort_order, now, now,
      ],
    });
  }
}
