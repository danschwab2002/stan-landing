import { s } from "../style";
import { SITE } from "@/lib/landing-data";

export function Manifesto() {
  return (
    <section id="manifesto" style={s("position:relative;background:#0d0d0d;color:#f5f3ec;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:clamp(36px,5vh,72px) clamp(24px,5vw,72px) clamp(72px,10vh,144px)")}>
      {/* Manifiesto — recurso gráfico oficial de BB Factor, partido en 2 capas:
          el ANILLO de texto (gira, centro hueco) + el lettering "We Manifest" (fijo, encima).
          Mismo aspecto que el asset (1600x1766) → ambas capas llenan el contenedor y alinean. */}
      <div style={s("position:relative;width:min(84vh,800px);max-width:92vw;aspect-ratio:1600/1766")}>
        <img
          src="/assets/imagery/manifiesto-ring.webp"
          alt="We stand for the vision. Creemos que una buena idea merece existir; que el talento sin ejecución es potencial desperdiciado; que las marcas más memorables son las que se animan a construir algo diferente; y que las mejores historias todavía no fueron producidas; que la creatividad no sirve si no genera movimiento."
          style={s("position:absolute;inset:0;width:100%;height:100%;animation:stan-rotate 90s linear infinite")}
        />
        <img
          src="/assets/imagery/manifiesto-letter.webp"
          alt="We Manifest"
          style={s("position:absolute;inset:0;width:100%;height:100%")}
        />
      </div>

      <div style={s("position:absolute;left:clamp(24px,5vw,72px);bottom:clamp(28px,3.4vw,46px);display:flex;align-items:center;gap:10px")}>
        <img src="/assets/logos/iso-acid.png" alt="STAN iso" style={s("display:block;width:26px;height:auto;flex:none")} />
        <div style={s("font-weight:700;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;line-height:1.7;color:rgba(245,243,236,0.66)")}>
          {SITE.tagline[0]}
          <br />
          {SITE.tagline[1]}
        </div>
      </div>
    </section>
  );
}
