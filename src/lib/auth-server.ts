// Helpers de sesión que tocan cookies — Node runtime únicamente (usan next/headers).
// El middleware NO importa este archivo; verifica el token directo con auth.ts sobre
// req.cookies. Acá vive todo lo que lee/escribe la cookie de sesión desde Server
// Components y Server Actions.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  SESSION_TTL_S,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";

/** ¿La request actual trae una sesión válida? (solo lee la cookie). */
export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE_NAME)?.value);
}

/**
 * Corta con redirect a /admin/login si no hay sesión.
 * Se llama al tope de CADA Server Action: las actions son endpoints POST invocables
 * directo, así que el gate del middleware no alcanza — esta es la defensa real.
 */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

/** Inicia sesión: setea la cookie firmada. Se llama desde el Server Action de login. */
export async function startSession(): Promise<void> {
  const token = await createSessionToken();
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
}

/** Cierra sesión: borra la cookie. */
export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
