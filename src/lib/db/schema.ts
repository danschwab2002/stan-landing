import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/**
 * Colección "Proyectos" (Portfolio) — el molde uniforme del CMS.
 * Familias: 1) Identidad & contenido · 2) Media · 3) Navegación · 4) Publicación & orden.
 * (La relación M2M con Servicios se suma en una iteración posterior.)
 */
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 1 · Identidad & contenido
  title: text("title").notNull(),
  client: text("client").default(""),
  year: integer("year"),
  category: text("category").default(""),
  location: text("location").default(""),
  shortDesc: text("short_desc").default(""), // descripción de la tarjeta
  longDesc: text("long_desc").default(""), // descripción del detalle
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

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
