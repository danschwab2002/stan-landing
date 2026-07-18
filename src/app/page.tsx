import { DesktopLanding } from "@/components/landing/desktop/DesktopLanding";
import { MobileLanding } from "@/components/landing/mobile/MobileLanding";

/**
 * Landing one-page de Stan. Se renderizan los dos árboles (desktop y mobile)
 * y se alterna por media query (`.landing-desktop` / `.landing-mobile` en
 * globals.css). Son dos layouts genuinamente distintos —el mobile tiene
 * bottom-sheet, carrusel y menú hamburguesa— por eso no es un único árbol
 * responsive.
 */
export default function Home() {
  return (
    <>
      <div className="landing-desktop">
        <DesktopLanding />
      </div>
      <div className="landing-mobile">
        <MobileLanding />
      </div>
    </>
  );
}
