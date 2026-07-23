import { inArray } from "drizzle-orm";
import { db, ensureDb } from "@/lib/db";
import { settings } from "@/lib/db/schema";

/**
 * Ajustes globales del sitio que Adriano administra desde el CMS. Hoy los dos
 * puntos de contacto que dejó activos (validación 22/07): el link directo de
 * WhatsApp y el iframe del widget de Calendly. Se guardan como filas key-value
 * en `settings`; acá se exponen como un objeto tipado para el frontend.
 */
export type SiteSettings = {
  /** Link completo al que redirige el botón/campo de WhatsApp (ej. https://wa.me/549…). */
  whatsappUrl: string;
  /** Código HTML del iframe de Calendly a embeber en la sección de contacto. */
  calendlyEmbed: string;
};

const KEYS = {
  whatsappUrl: "whatsapp_url",
  calendlyEmbed: "calendly_embed",
} as const;

export async function getSiteSettings(): Promise<SiteSettings> {
  await ensureDb();
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, Object.values(KEYS)));
  const map = new Map(rows.map((r) => [r.key, r.value ?? ""]));
  return {
    whatsappUrl: map.get(KEYS.whatsappUrl) ?? "",
    calendlyEmbed: map.get(KEYS.calendlyEmbed) ?? "",
  };
}

/** Upsert de los dos ajustes (crea la fila si no existía, si no la actualiza). */
export async function setSiteSettings(data: SiteSettings): Promise<void> {
  await ensureDb();
  const pairs: [string, string][] = [
    [KEYS.whatsappUrl, data.whatsappUrl],
    [KEYS.calendlyEmbed, data.calendlyEmbed],
  ];
  for (const [key, value] of pairs) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
}
