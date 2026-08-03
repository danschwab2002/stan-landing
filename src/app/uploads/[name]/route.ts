import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { contentTypeFor, resolveUploadPath } from "@/lib/uploads";

// Lee del volumen persistente → Node runtime, y nunca prerenderizado.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sirve los archivos subidos desde el CMS: imágenes y videos de los casos.
 *
 * Hace falta un handler (en vez de dejarlos en `public/`) porque los archivos viven
 * en el volumen persistente, que se monta en runtime: nada que esté ahí existe en
 * build time, cuando Next arma el árbol de estáticos.
 *
 * Público a propósito: son las imágenes y videos de la landing. El gate está en la
 * subida.
 *
 * DOS COSAS QUE EL VIDEO EXIGE Y LA IMAGEN NO
 *
 *  1. RANGOS. Un `<video>` no descarga el archivo de arriba a abajo: pide tramos.
 *     Arrastrar la barra de tiempo manda un `Range: bytes=…` y espera un `206`.
 *     Un servidor que contesta siempre `200` con el archivo entero rompe el seek,
 *     y Safari directamente se niega a reproducir.
 *
 *  2. STREAMING. La versión anterior hacía `readFile` y devolvía el buffer. Con una
 *     imagen de 50 KB da igual; con un video de 300 MB son 300 MB de RAM por cada
 *     visitante que le da play. Ahora se abre un stream y los chunks van saliendo.
 *
 * Ambas valen también para las imágenes, así que el camino es uno solo.
 */
export async function GET(req: Request, ctx: RouteContext<"/uploads/[name]">) {
  return serve(req, ctx, true);
}

/** Algunos reproductores sondean con HEAD antes de pedir el primer tramo. */
export async function HEAD(req: Request, ctx: RouteContext<"/uploads/[name]">) {
  return serve(req, ctx, false);
}

async function serve(
  req: Request,
  ctx: RouteContext<"/uploads/[name]">,
  withBody: boolean
) {
  const { name } = await ctx.params;

  const filePath = resolveUploadPath(name);
  if (!filePath) return new NextResponse("Not found", { status: 404 });

  let size: number;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });
    size = info.size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": contentTypeFor(name),
    // El nombre lleva el hash del contenido: un archivo dado nunca cambia, así que
    // se puede cachear para siempre. Editarlo genera otro nombre.
    "Cache-Control": "public, max-age=31536000, immutable",
    // Anunciarlo es lo que hace que el navegador se anime a pedir tramos.
    "Accept-Ranges": "bytes",
  };

  const range = parseRange(req.headers.get("range"), size);

  if (range === "invalid") {
    return new NextResponse("Range Not Satisfiable", {
      status: 416,
      headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" },
    });
  }

  if (range) {
    const length = range.end - range.start + 1;
    const body = withBody
      ? toWeb(createReadStream(filePath, { start: range.start, end: range.end }))
      : null;
    return new NextResponse(body, {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
        "Content-Length": String(length),
      },
    });
  }

  const body = withBody ? toWeb(createReadStream(filePath)) : null;
  return new NextResponse(body, {
    headers: { ...headers, "Content-Length": String(size) },
  });
}

function toWeb(stream: ReturnType<typeof createReadStream>): ReadableStream {
  return Readable.toWeb(stream) as ReadableStream;
}

/**
 * Parsea un header `Range`. Devuelve null si no hay o si no lo entendemos (en cuyo
 * caso corresponde mandar el archivo entero, no un error), y `"invalid"` solo
 * cuando el rango está bien formado pero cae fuera del archivo.
 *
 * Soporta las tres formas del RFC 7233 con un solo tramo, que es lo que mandan los
 * navegadores: `bytes=0-`, `bytes=500-999` y `bytes=-500` (los últimos 500).
 * Los rangos múltiples piden respuesta multipart y ningún `<video>` los usa.
 */
export function parseRange(
  header: string | null,
  size: number
): { start: number; end: number } | null | "invalid" {
  if (!header) return null;

  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null;

  const [, rawStart, rawEnd] = m;
  if (rawStart === "" && rawEnd === "") return null;

  let start: number;
  let end: number;

  if (rawStart === "") {
    // Sufijo: los últimos N bytes. Pedir más de lo que hay devuelve todo.
    const suffix = Number(rawEnd);
    if (suffix === 0) return "invalid";
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? size - 1 : Number(rawEnd);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  // Un archivo vacío no tiene rango válido posible.
  if (size === 0 || start >= size || start > end) return "invalid";

  return { start, end: Math.min(end, size - 1) };
}
