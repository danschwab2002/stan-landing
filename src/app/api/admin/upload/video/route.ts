import { createHash, randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";
import { MAX_VIDEO_BYTES, saveVideoFromTemp, tempDir } from "@/lib/uploads";

// Escribe en disco y lanza ffmpeg: Node runtime, nunca prerenderizado.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 900;

/**
 * Subida del video de un caso. Devuelve la URL pública ya lista para servir.
 *
 * POR QUÉ EL ARCHIVO VIENE COMO BODY CRUDO Y NO COMO MULTIPART
 * El endpoint de imágenes usa `request.formData()`, que junta el archivo entero en
 * memoria. Con una foto de 8 MB no importa; con un video de 400 MB son 400 MB de
 * RAM del contenedor por cada subida en curso. Acá el body ES el archivo y se
 * streamea a disco de a chunks, con el nombre original viajando en un header.
 *
 * El hash se calcula EN EL MISMO PASO, interceptando los chunks entre la red y el
 * disco. Leer el archivo de nuevo para hashearlo sería un segundo pase completo
 * de I/O sobre cientos de MB.
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rawName = request.headers.get("x-file-name") ?? "video";
  let originalName = "video";
  try {
    originalName = decodeURIComponent(rawName);
  } catch {
    // nombre mal codificado: no vale abortar la subida por eso
  }

  // Chequeo barato antes de escribir un solo byte. El de abajo es el que manda:
  // el header lo pone el cliente y puede mentir.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: tooBigMessage(declared) }, { status: 413 });
  }

  if (!request.body) {
    return NextResponse.json({ error: "No llegó ningún archivo." }, { status: 400 });
  }

  const dir = tempDir();
  await mkdir(dir, { recursive: true });
  const tempPath = path.join(dir, `${randomUUID()}.upload`);

  const hash = createHash("sha256");
  let received = 0;
  let overflow = false;

  const meter = new Transform({
    transform(chunk, _enc, cb) {
      received += chunk.length;
      if (received > MAX_VIDEO_BYTES) {
        overflow = true;
        // Corta la escritura sin esperar a que el cliente termine de mandar.
        cb(new Error("overflow"));
        return;
      }
      hash.update(chunk);
      cb(null, chunk);
    },
  });

  try {
    await pipeline(
      Readable.fromWeb(request.body as Parameters<typeof Readable.fromWeb>[0]),
      meter,
      createWriteStream(tempPath)
    );
  } catch {
    await rm(tempPath, { force: true });
    if (overflow) {
      return NextResponse.json({ error: tooBigMessage(received) }, { status: 413 });
    }
    return NextResponse.json(
      { error: "Se cortó la subida. Probá de nuevo." },
      { status: 400 }
    );
  }

  try {
    const saved = await saveVideoFromTemp(tempPath, originalName, hash.digest("hex"));
    return NextResponse.json(saved);
  } catch (err) {
    const error = err instanceof Error ? err.message : "No se pudo procesar el video.";
    return NextResponse.json({ error }, { status: 400 });
  } finally {
    await rm(tempPath, { force: true });
  }
}

function tooBigMessage(bytes: number): string {
  const mb = (bytes / 1024 / 1024).toFixed(0);
  const max = MAX_VIDEO_BYTES / 1024 / 1024;
  return `El video pesa ${mb} MB. El máximo es ${max} MB — exportalo en 1080p y va a entrar sobrado.`;
}
