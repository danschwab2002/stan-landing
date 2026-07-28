import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";
import { MAX_UPLOAD_BYTES, saveImage } from "@/lib/uploads";

// Necesita Node: escribe en disco y usa sharp (binario nativo).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Subida de imágenes del CMS. Recibe un `file` por multipart y devuelve la URL
 * pública ya optimizada, que el formulario guarda en el campo correspondiente.
 *
 * Es un Route Handler y no un Server Action a propósito: las actions tienen un
 * tope de body de 1 MB, que cualquier foto de celular supera.
 *
 * El gate de /admin (proxy.ts) cubre las navegaciones, pero este endpoint se puede
 * invocar directo con un POST — por eso valida la sesión acá adentro, igual que
 * hacen las Server Actions con requireAuth().
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const formData = await request.formData();
    const entry = formData.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No llegó ningún archivo." }, { status: 400 });
  }
  // Chequeo barato antes de cargar el buffer entero en memoria.
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `La imagen supera los ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.` },
      { status: 413 }
    );
  }

  try {
    const saved = await saveImage(file);
    return NextResponse.json(saved);
  } catch (err) {
    // Los mensajes de saveImage están escritos para que los lea Adriano, no un dev.
    const error = err instanceof Error ? err.message : "No se pudo procesar la imagen.";
    return NextResponse.json({ error }, { status: 400 });
  }
}
