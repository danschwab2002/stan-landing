import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Almacenamiento de imágenes del CMS — subida directa desde la compu.
 *
 * DÓNDE VIVEN LOS ARCHIVOS
 * No en `public/`: esa carpeta se resuelve en build time y el volumen persistente
 * de EasyPanel recién se monta en runtime (misma trampa que reventó el build con
 * SQLITE_CANTOPEN). Los archivos van al lado de la base, dentro del volumen.
 *
 * El directorio se DERIVA de `DATABASE_URL` en vez de pedir una env var nueva:
 * si la base vive en `/data/stan.db`, los uploads van a `/data/uploads`. Así no
 * hay forma de deployar con la base persistida y los archivos en el filesystem
 * efímero del contenedor (que se borraría en cada redeploy, en silencio).
 * `UPLOADS_DIR` queda como override explícito por si algún día se separan.
 */
export function uploadsDir(): string {
  const override = process.env.UPLOADS_DIR;
  if (override) return override;

  // file:/data/stan.db → /data · file:stan.db → . (dev, junto al repo)
  const dbUrl = process.env.DATABASE_URL ?? "file:stan.db";
  const dbPath = dbUrl.replace(/^file:/, "");
  const dir = path.dirname(dbPath);
  return path.join(dir === "." ? ".uploads" : path.join(dir, "uploads"));
}

/** Prefijo público de las imágenes subidas. Lo sirve el route handler /uploads/[name]. */
export const UPLOADS_URL_PREFIX = "/uploads";

/** Tope de la subida (antes de optimizar). Una foto de celular ronda los 3-8 MB. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** Ancho máximo que se guarda. Nada en la landing se muestra más grande que esto. */
const MAX_WIDTH = 2400;

/** Calidad del WebP. 82 es el punto donde deja de notarse la pérdida a ojo. */
const WEBP_QUALITY = 82;

/** Nombres generados por `saveImage`: slug + hash + .webp. El GET valida contra esto. */
const SAFE_NAME = /^[a-z0-9][a-z0-9-]*\.webp$/;

export type SavedImage = {
  url: string;
  name: string;
  width: number;
  height: number;
  bytes: number;
  originalBytes: number;
};

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\.[a-z0-9]+$/, "") // saca la extensión original
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "imagen"
  );
}

/**
 * Valida, optimiza y guarda una imagen. Devuelve la URL pública para el CMS.
 *
 * Todo lo que entra sale como WebP con el ancho acotado: es lo que evita que una
 * foto de 8 MB del celular termine sirviéndose tal cual en la home (el problema
 * que ya tuvimos con el hero de 12,3 MB). Lanza si el archivo no es una imagen.
 *
 * La validación real la hace sharp al parsear los bytes, no el content-type que
 * declara el browser — un cliente puede mentir en el header, no en los magic bytes.
 */
export async function saveImage(file: File): Promise<SavedImage> {
  if (file.size === 0) throw new Error("El archivo está vacío.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es ${
        MAX_UPLOAD_BYTES / 1024 / 1024
      } MB.`
    );
  }

  const input = Buffer.from(await file.arrayBuffer());

  let result;
  try {
    result = await sharp(input)
      // Aplica la orientación EXIF: sin esto las fotos verticales de celular
      // se guardan acostadas. También descarta el resto de la metadata (GPS).
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new Error("El archivo no es una imagen válida (probá con JPG, PNG o WebP).");
  }
  const { data: output, info } = result;

  // Hash del contenido original: subir dos veces la misma foto reusa el archivo
  // en vez de duplicarlo, y el nombre queda estable (podemos cachear para siempre).
  const hash = createHash("sha256").update(input).digest("hex").slice(0, 10);
  const name = `${slugify(file.name)}-${hash}.webp`;

  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), output);

  return {
    url: `${UPLOADS_URL_PREFIX}/${name}`,
    name,
    width: info.width,
    height: info.height,
    bytes: output.length,
    originalBytes: input.length,
  };
}

/**
 * Path en disco de un archivo subido, o null si el nombre no es uno de los nuestros.
 *
 * El nombre tiene que matchear exactamente el molde que genera `saveImage`, que no
 * admite barras ni puntos consecutivos — así que no hay traversal posible (`../`
 * ni `..%2f` pasan el regex). Es una allowlist, no un blacklist de patrones feos.
 */
export function resolveUploadPath(name: string): string | null {
  if (!SAFE_NAME.test(name)) return null;
  return path.join(uploadsDir(), name);
}

/**
 * ¿Es una ruta interna servida por esta app? (`/uploads/…` o un asset del repo).
 * Los campos de imagen del CMS aceptan tanto una URL externa como una de estas.
 */
export function isInternalAssetPath(v: string): boolean {
  return v.startsWith(`${UPLOADS_URL_PREFIX}/`) || v.startsWith("/assets/");
}
