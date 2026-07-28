import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolveUploadPath } from "@/lib/uploads";

// Lee del volumen persistente → Node runtime, y nunca prerenderizado.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sirve las imágenes subidas desde el CMS.
 *
 * Hace falta un handler (en vez de dejarlas en `public/`) porque los archivos viven
 * en el volumen persistente, que se monta en runtime: nada que esté ahí existe en
 * build time, cuando Next arma el árbol de estáticos.
 *
 * Público a propósito: son las imágenes de la landing. El gate está en la subida.
 */
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[name]">) {
  const { name } = await ctx.params;

  const filePath = resolveUploadPath(name);
  if (!filePath) return new NextResponse("Not found", { status: 404 });

  let data: Buffer;
  try {
    data = await readFile(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      // El nombre lleva el hash del contenido: un archivo dado nunca cambia,
      // así que se puede cachear para siempre. Editar la imagen genera otro nombre.
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(data.length),
    },
  });
}
