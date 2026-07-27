// Núcleo de autenticación del panel /admin.
//
// Edge-safe a propósito: usa SOLO Web Crypto (crypto.subtle) + TextEncoder + btoa/atob,
// y NO importa next/headers ni node:crypto. Así el mismo módulo corre tanto en el
// middleware (Edge runtime) como en los Server Actions (Node runtime). Los helpers que
// tocan cookies viven en auth-server.ts (Node únicamente).
//
// El modelo es de un solo usuario (Adriano): "conocer la contraseña" = una cookie de
// sesión firmada con HMAC-SHA256. Sin tabla de usuarios ni librería de auth.

export const COOKIE_NAME = "stan_admin_session";
export const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 días

const enc = new TextEncoder();

function nowS(): number {
  return Math.floor(Date.now() / 1000);
}

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const norm = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(norm);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "";
}
function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

/** true si el entorno tiene la auth configurada (password + secret presentes). */
export function authConfigured(): boolean {
  return adminPassword().length > 0 && sessionSecret().length > 0;
}

/** Firma un token de sesión con vencimiento. Devuelve "" si falta config (fail-closed). */
export async function createSessionToken(ttlSeconds = SESSION_TTL_S): Promise<string> {
  const secret = sessionSecret();
  if (!secret) return "";
  const payload = b64urlFromBytes(enc.encode(JSON.stringify({ exp: nowS() + ttlSeconds })));
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return `${payload}.${b64urlFromBytes(sig)}`;
}

/** Verifica firma HMAC + vencimiento. Cualquier fallo → false (fail-closed). */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret || !token) return false;

  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sigPart = token.slice(dot + 1);

  let sigBytes: Uint8Array<ArrayBuffer>;
  try {
    sigBytes = b64urlToBytes(sigPart);
  } catch {
    return false;
  }

  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
  if (!valid) return false;

  try {
    const data = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
    return typeof data.exp === "number" && data.exp > nowS();
  } catch {
    return false;
  }
}

/** Compara la contraseña ingresada contra ADMIN_PASSWORD en tiempo constante. */
export async function checkPassword(input: string): Promise<boolean> {
  const secret = sessionSecret();
  const pass = adminPassword();
  if (!secret || !pass || !input) return false;
  // HMAC de ambos + verify: comparación constant-time y sin filtrar longitud
  // (el output HMAC es siempre 32 bytes, cualquiera sea el largo del input).
  const key = await hmacKey(secret);
  const expected = await crypto.subtle.sign("HMAC", key, enc.encode(pass));
  return crypto.subtle.verify("HMAC", key, expected, enc.encode(input));
}
