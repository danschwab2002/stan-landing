"use client";

import { useEffect, useState } from "react";
import { CASOS, DISCIPLINES } from "@/lib/landing-data";
import { Hero } from "./Hero";
import { QueHacemos } from "./QueHacemos";
import { Marquee } from "./Marquee";
import { Casos } from "./Casos";
import { Manifesto } from "./Manifesto";
import { Contacto } from "./Contacto";
import { CasoOverlay } from "./CasoOverlay";
import { DisciplinaOverlay } from "./DisciplinaOverlay";

export function DesktopLanding() {
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
  const activeCaso = casoKey ? CASOS.find((c) => c.key === casoKey) : undefined;
  const activeDisc = discKey ? DISCIPLINES.find((d) => d.key === discKey) : undefined;

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

  return (
    <div style={{ fontFamily: "var(--font-grotesk)" }}>
      <Hero />
      <QueHacemos onOpen={openDisc} />
      <Marquee />
      <Casos onOpen={openCaso} />
      <Manifesto />
      <Marquee />
      <Contacto />

      {activeCaso ? <CasoOverlay caso={activeCaso} onClose={closeCaso} /> : null}
      {activeDisc ? <DisciplinaOverlay discipline={activeDisc} onClose={closeDisc} /> : null}
    </div>
  );
}
