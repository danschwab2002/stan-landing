import { DesktopLanding } from "@/components/landing/desktop/DesktopLanding";
import { MobileLanding } from "@/components/landing/mobile/MobileLanding";
import { getLandingCasos } from "@/lib/data/landing";
import { getPublishedDisciplines } from "@/lib/data/disciplines";

// El contenido sale de la base (admin) → render dinámico, sin prerender estático.
export const dynamic = "force-dynamic";

/**
 * Landing one-page de Stan. Los casos y las disciplinas se traen de la base
 * (Server Component) y se pasan por props a los dos árboles —desktop y mobile—,
 * que se alternan por media query (`.landing-desktop` / `.landing-mobile`).
 * Son dos layouts genuinamente distintos (el mobile tiene bottom-sheet,
 * carrusel y menú hamburguesa), por eso no es un único árbol responsive.
 * El copy único (hero, manifiesto, contacto) sigue fijo en código (`SITE`).
 */
export default async function Home() {
  const [casos, disciplines] = await Promise.all([
    getLandingCasos(),
    getPublishedDisciplines(),
  ]);

  return (
    <>
      <div className="landing-desktop">
        <DesktopLanding casos={casos} disciplines={disciplines} />
      </div>
      <div className="landing-mobile">
        <MobileLanding casos={casos} disciplines={disciplines} />
      </div>
    </>
  );
}
