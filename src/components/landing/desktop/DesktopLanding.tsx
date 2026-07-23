"use client";

import { useEffect, useState } from "react";
import { relatedCaso, type Caso, type Discipline } from "@/lib/landing-data";
import type { SiteSettings } from "@/lib/data/settings";
import { Hero } from "./Hero";
import { QueHacemos } from "./QueHacemos";
import { Marquee } from "./Marquee";
import { Casos } from "./Casos";
import { Manifesto } from "./Manifesto";
import { Contacto } from "./Contacto";
import { CasoOverlay } from "./CasoOverlay";
import { DisciplinaOverlay } from "./DisciplinaOverlay";
import { ReelOverlay } from "./ReelOverlay";

export function DesktopLanding({ casos, disciplines, settings }: { casos: Caso[]; disciplines: Discipline[]; settings: SiteSettings }) {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const onHash = () => setHash(location.hash);
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const slug = hash.replace(/^#\/?/, "");
  const casoKey = slug.startsWith("caso/") ? slug.slice(5) : null;
  const discKey = slug.startsWith("disciplina/") ? slug.slice(11) : null;
  const reelOpen = slug === "reel";
  const activeCaso = casoKey ? casos.find((c) => c.key === casoKey) : undefined;
  const activeDisc = discKey ? disciplines.find((d) => d.key === discKey) : undefined;

  // Casos recomendados al pie (rabbit-hole): resueltos server-side (manual o random),
  // acá solo mapeamos las keys a sus Casos, en orden.
  const recommendedCasos: Caso[] = activeCaso
    ? (activeCaso.recommended ?? [])
        .map((k) => casos.find((c) => c.key === k))
        .filter((c): c is Caso => Boolean(c))
    : [];

  const openCaso = (key: string) => {
    location.hash = "caso/" + key;
  };
  const openDisc = (key: string) => {
    location.hash = "disciplina/" + key;
  };
  const closeCaso = () => {
    location.hash = "casos";
  };
  const closeDisc = () => {
    location.hash = "work";
  };
  const closeReel = () => {
    location.hash = "hero";
  };

  return (
    <div style={{ fontFamily: "var(--font-grotesk)" }}>
      <Hero />
      <QueHacemos disciplines={disciplines} casos={casos} onOpen={openDisc} />
      <Marquee />
      <Casos casos={casos} onOpen={openCaso} />
      <Manifesto />
      <Marquee />
      <Contacto whatsappUrl={settings.whatsappUrl} calendlyEmbed={settings.calendlyEmbed} />

      {activeCaso ? (
        <CasoOverlay caso={activeCaso} related={relatedCaso(activeCaso, casos)} recommended={recommendedCasos} disciplines={disciplines} onOpenCaso={openCaso} onOpenDisc={openDisc} onClose={closeCaso} />
      ) : null}
      {activeDisc ? <DisciplinaOverlay discipline={activeDisc} casos={casos} onOpenCaso={openCaso} onClose={closeDisc} /> : null}
      {reelOpen ? <ReelOverlay onClose={closeReel} /> : null}
    </div>
  );
}
