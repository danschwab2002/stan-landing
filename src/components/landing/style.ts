import type { CSSProperties } from "react";

/**
 * Convierte un string CSS (tal cual aparece inline en los .dc.html del
 * handoff) en un objeto de estilo de React. Permite portar el markup del
 * diseño casi literal, sin reescribir a mano cada declaración.
 *
 * Solo para estilos estáticos del diseño (sin ";" dentro de los valores,
 * que es el caso de todo el markup de Stan).
 */
export function s(css: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":");
    if (i === -1) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) continue;
    const key = prop.startsWith("--")
      ? prop
      : prop.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
    out[key] = val;
  }
  return out as CSSProperties;
}
