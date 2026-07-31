/**
 * Normalización del dato de Instagram.
 *
 * En el CMS es **un solo campo**, no dos (link + usuario): el usuario visible se
 * deriva del link, así que es imposible que queden desincronizados — que el texto
 * diga una cuenta y el link lleve a otra.
 *
 * Acepta cualquiera de las formas en que alguien copia su Instagram —la URL del
 * navegador, la del botón "Copiar link del perfil", o el arroba a mano— porque el
 * campo lo llena el cliente, no un dev:
 *
 *   https://www.instagram.com/standforthevision/?hl=es  →  @standforthevision
 *   instagram.com/standforthevision                     →  @standforthevision
 *   @standforthevision                                  →  @standforthevision
 *   standforthevision                                   →  @standforthevision
 *
 * La URL que se guarda se **reconstruye** a partir del usuario extraído, que solo
 * puede tener `[A-Za-z0-9._]`. Eso hace imposible por construcción que se cuele un
 * `javascript:` u otro esquema raro, sin depender de una lista de bloqueo.
 */

export type Instagram = {
  /** URL canónica del perfil, o "" si el valor no era interpretable. */
  url: string;
  /** Usuario con arroba para mostrar (`@cuenta`), o "" si no había. */
  handle: string;
};

/** Reglas de Instagram: letras, números, punto y guion bajo, hasta 30 caracteres. */
const HANDLE = /^[A-Za-z0-9._]{1,30}$/;

/** Rutas de Instagram que no son perfiles: si llega una, no hay usuario que extraer. */
const NOT_A_PROFILE = new Set(["p", "reel", "reels", "stories", "explore", "tv", "s"]);

export function normalizeInstagram(raw: string | null | undefined): Instagram {
  const value = (raw ?? "").trim();
  if (!value) return { url: "", handle: "" };

  let candidate = value;

  // Si trae dominio, quedarse con el primer segmento del path (el usuario).
  const withDomain = value.match(/(?:^|\/\/|\.)instagram\.com\/([^/?#]*)/i);
  if (withDomain) {
    candidate = withDomain[1];
  } else if (/^https?:\/\//i.test(value) || value.includes("/")) {
    // Es una URL o una ruta, pero de otro dominio: no es un Instagram.
    return { url: "", handle: "" };
  }

  const user = candidate.replace(/^@/, "").trim();
  if (!HANDLE.test(user) || NOT_A_PROFILE.has(user.toLowerCase())) {
    return { url: "", handle: "" };
  }

  return { url: `https://www.instagram.com/${user}/`, handle: `@${user}` };
}

/** El usuario a mostrar a partir de la URL ya guardada. */
export function instagramHandle(url: string | null | undefined): string {
  return normalizeInstagram(url).handle;
}
