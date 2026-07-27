"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";

/**
 * Popup flotante de Calendly (decisión de Dan 24/07: NO embed inline).
 *
 * El script + CSS del widget se cargan **perezosamente al primer click** (no en
 * cada visita) → no penaliza el LCP de la landing. `openCalendly(url)` es la vía
 * imperativa (la usa el mobile, que navega con handlers); `CalendlyButton` es el
 * anchor listo para el desktop, con fallback a la sección de contacto si todavía
 * no hay URL cargada en el CMS.
 */

declare global {
  interface Window {
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
  }
}

const JS_URL = "https://assets.calendly.com/assets/external/widget.js";
const CSS_URL = "https://assets.calendly.com/assets/external/widget.css";

let loader: Promise<void> | null = null;

function ensureCalendly(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve) => {
    if (!document.getElementById("calendly-css")) {
      const link = document.createElement("link");
      link.id = "calendly-css";
      link.rel = "stylesheet";
      link.href = CSS_URL;
      document.head.appendChild(link);
    }
    const existing = document.getElementById("calendly-js") as HTMLScriptElement | null;
    if (existing) {
      if (window.Calendly) resolve();
      else existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "calendly-js";
    script.src = JS_URL;
    script.async = true;
    script.addEventListener("load", () => resolve());
    document.body.appendChild(script);
  });
  return loader;
}

/** Abre el calendario en un modal flotante. Sin URL → no hace nada (el caller decide el fallback). */
export async function openCalendly(url: string): Promise<void> {
  if (!url) return;
  await ensureCalendly();
  window.Calendly?.initPopupWidget({ url });
}

export function CalendlyButton({
  url,
  className,
  style,
  children,
  fallbackHref = "#contact",
}: {
  url: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  fallbackHref?: string;
}) {
  const onClick = (e: MouseEvent) => {
    if (!url) return; // sin URL → seguí el href de fallback (scroll a #contact)
    e.preventDefault();
    void openCalendly(url);
  };
  return (
    <a href={url ? "#" : fallbackHref} onClick={onClick} className={className} style={style}>
      {children}
    </a>
  );
}
