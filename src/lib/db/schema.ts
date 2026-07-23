import { sqliteTable, integer, text, primaryKey } from "drizzle-orm/sqlite-core";

/**
 * Colección "Proyectos" (Portfolio) — el molde uniforme del CMS.
 * Familias: 1) Identidad & contenido · 2) Media · 3) Navegación · 4) Publicación & orden.
 * La relación con Disciplinas es M2M vía `projectDisciplines` (abajo).
 */
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 1 · Identidad & contenido
  title: text("title").notNull(),
  client: text("client").default(""),
  year: integer("year"),
  category: text("category").default(""), // etiqueta corta de la tarjeta (tag)
  location: text("location").default(""),
  shortDesc: text("short_desc").default(""), // descripción de la tarjeta / lead
  longDesc: text("long_desc").default(""), // descripción del detalle / body
  credits: text("credits").default(""),

  // 2 · Media
  coverUrl: text("cover_url").default(""),
  videoUrl: text("video_url").default(""), // Vimeo / YouTube / Storage

  // 3 · Navegación
  slug: text("slug").notNull(),

  // 4 · Publicación & orden
  published: integer("published", { mode: "boolean" }).default(false),
  featured: integer("featured", { mode: "boolean" }).default(false),
  sortOrder: integer("sort_order").default(0),

  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

/**
 * Colección "Disciplinas" (áreas de "Qué hacemos") — la 2da colección editable.
 * `items` y `detail` se guardan como JSON serializado (texto): la capa de datos
 * los parsea. `detail` es un array de { title, desc }; puede estar vacío.
 */
export const disciplines = sqliteTable("disciplines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(), // slug estable (content, streaming, …)
  title: text("title").notNull(),
  icon: text("icon").default(""),
  description: text("description").default(""), // `desc` es palabra reservada en SQL
  items: text("items").default("[]"), // JSON: string[]
  detail: text("detail").default("[]"), // JSON: { title, desc }[]
  published: integer("published", { mode: "boolean" }).default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

/**
 * Relación muchos-a-muchos Proyectos ↔ Disciplinas (G11): un caso toca varias
 * áreas y un área agrupa varios casos. PK compuesta (projectId, disciplineId).
 */
export const projectDisciplines = sqliteTable(
  "project_disciplines",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    disciplineId: integer("discipline_id")
      .notNull()
      .references(() => disciplines.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.disciplineId] })]
);

/**
 * Recomendación de casos (rabbit-hole, decisión Adriano 22/07): al pie de un caso
 * destacado se muestran "otros proyectos". Auto-relación DIRIGIDA sobre projects —
 * (projectId) recomienda a (recommendedId), con `sortOrder` para el orden manual.
 * Si un proyecto no tiene filas acá, la capa de datos cae a random (manual + fallback).
 */
export const projectRecommendations = sqliteTable(
  "project_recommendations",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    recommendedId: integer("recommended_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.recommendedId] })]
);

/**
 * Ajustes globales del sitio (key-value). Datos que no pertenecen a un proyecto
 * ni a un área: hoy los dos puntos de contacto que Adriano quiere administrar
 * (validación 22/07) — `whatsapp_url` (link directo) y `calendly_embed` (código
 * iframe del widget de agendamiento). Key-value a propósito: sumar un ajuste
 * nuevo es una fila más, sin migrar el esquema.
 */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").default(""),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type DisciplineRow = typeof disciplines.$inferSelect;
export type NewDisciplineRow = typeof disciplines.$inferInsert;
export type SettingRow = typeof settings.$inferSelect;
