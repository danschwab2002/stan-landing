import { createHash } from "node:crypto";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { processVideo, type VideoProcessResult } from "@/lib/video";

/**
 * Almacenamiento de imágenes y videos del CMS — subida directa desde la compu.
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

/**
 * Tope del video ANTES de procesar. Un master de un caso de 2-3 minutos exportado
 * para web ronda los 100-300 MB; 600 deja lugar para un export generoso sin abrir
 * la puerta a que alguien mande el proyecto entero de edición.
 *
 * Es el límite nuestro. El proxy que está delante de la app en el server tiene el
 * suyo, y es el que corta primero — verificarlo ahí antes de prometerle un número
 * al cliente.
 */
export const MAX_VIDEO_BYTES = 600 * 1024 * 1024;

/** Ancho máximo que se guarda. Nada en la landing se muestra más grande que esto. */
const MAX_WIDTH = 2400;

/** Calidad del WebP. 82 es el punto donde deja de notarse la pérdida a ojo. */
const WEBP_QUALITY = 82;

/**
 * Nombres generados por `saveImage`/`saveVideoFromTemp`: slug + hash + extensión.
 * El GET valida contra esto — es una allowlist, no un filtro de patrones feos.
 */
const SAFE_NAME = /^[a-z0-9][a-z0-9-]*\.(webp|mp4)$/;

/** Content-Type de un archivo servido. El nombre ya pasó por `SAFE_NAME`. */
export function contentTypeFor(name: string): string {
  return name.endsWith(".mp4") ? "video/mp4" : "image/webp";
}

/** ¿El nombre es de un video? Lo usa el GET para decidir si soporta rangos. */
export function isVideoName(name: string): boolean {
  return name.endsWith(".mp4");
}

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

export type SavedVideo = {
  url: string;
  name: string;
  bytes: number;
  originalBytes: number;
  /** Qué hizo ffmpeg. `passthrough` viene con `warning` para mostrar en el panel. */
  action: VideoProcessResult["action"];
  warning?: string;
};

/**
 * Carpeta de staging de las subidas en curso, DENTRO del directorio de uploads.
 *
 * Tiene que estar en el mismo filesystem que el destino final: mover el archivo
 * terminado se hace con `rename`, que es atómico e instantáneo dentro de un mount
 * y falla con EXDEV cruzando montajes. Con el volumen de EasyPanel montado en
 * `/data`, un temporal en `/tmp` sería justamente otro mount.
 *
 * Empieza con punto, así que ningún nombre de acá adentro puede pasar `SAFE_NAME`:
 * un archivo a medio subir no es servible ni por accidente.
 */
export function tempDir(): string {
  return path.join(uploadsDir(), ".tmp");
}

/**
 * Toma un video ya volcado a disco, lo deja listo para la web y lo guarda.
 *
 * Recibe un path y no un `File` a propósito: un video de cientos de MB no puede
 * pasar por `file.arrayBuffer()` como hacen las imágenes — eso lo carga entero en
 * la RAM del contenedor. El endpoint lo streamea a `tempDir()` y hashea al vuelo;
 * acá llega el archivo en disco y su hash ya calculado.
 *
 * El hash es del ORIGINAL, igual que en `saveImage`: subir dos veces el mismo
 * archivo reusa el resultado en vez de recodificarlo de nuevo.
 */
export async function saveVideoFromTemp(
  tempPath: string,
  originalName: string,
  hash: string
): Promise<SavedVideo> {
  const originalBytes = (await stat(tempPath)).size;
  if (originalBytes === 0) throw new Error("El archivo está vacío.");

  const name = `${slugify(originalName)}-${hash.slice(0, 10)}.mp4`;
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  const finalPath = path.join(dir, name);

  // Ya subido antes: el nombre lleva el hash del contenido, así que un archivo
  // con este nombre es bit a bit el mismo. Recodificar de nuevo sería tirar CPU.
  try {
    const existing = await stat(finalPath);
    return {
      url: `${UPLOADS_URL_PREFIX}/${name}`,
      name,
      bytes: existing.size,
      originalBytes,
      action: "remux",
    };
  } catch {
    // no existe, seguimos
  }

  const workPath = path.join(tempDir(), `${hash.slice(0, 10)}-out.mp4`);
  await mkdir(tempDir(), { recursive: true });

  let result: VideoProcessResult;
  try {
    result = await processVideo(tempPath, workPath);
  } catch (err) {
    await rm(workPath, { force: true });
    // Los mensajes de acá los lee Adriano, no un dev.
    if (err instanceof Error && err.message.startsWith("El archivo no es")) throw err;
    throw new Error("No se pudo procesar el video. Probá exportándolo como MP4.");
  }

  // Solo ahora el archivo pasa a ser visible por el GET: hasta este rename vivió
  // en `.tmp`, que ningún nombre servible puede alcanzar.
  await rename(workPath, finalPath);
  const bytes = (await stat(finalPath)).size;

  return {
    url: `${UPLOADS_URL_PREFIX}/${name}`,
    name,
    bytes,
    originalBytes,
    action: result.action,
    warning: result.action === "passthrough" ? result.warning : undefined,
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
