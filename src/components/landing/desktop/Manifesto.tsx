import { s } from "../style";
import { ArrowRight } from "../icons";
import { SITE } from "@/lib/landing-data";

export function Manifesto() {
  return (
    <section id="manifesto" style={s("position:relative;background:#0d0d0d;color:#f5f3ec;min-height:100svh;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:clamp(40px,6vw,88px)")}>
      <div style={s("position:relative;width:min(80vh,760px);max-width:88vw;aspect-ratio:1;display:flex;align-items:center;justify-content:center")}>
        <svg viewBox="0 0 500 500" style={s("position:absolute;inset:0;width:100%;height:100%;overflow:visible;animation:stan-rotate 100s linear infinite")}>
          <defs>
            <path id="manifesto-ring" d="M250,250 m-205,0 a205,205 0 1,1 410,0 a205,205 0 1,1 -410,0" />
          </defs>
          <text fill="rgba(245,243,236,0.9)" style={s("font-family:var(--font-grotesk);font-weight:500;font-size:19px;letter-spacing:0.01em")}>
            <textPath href="#manifesto-ring" startOffset="0%">
              {SITE.manifesto.ring}
            </textPath>
          </text>
        </svg>
        {/* Lettering central ('We Manifest') — slot del CMS, hoy vacío */}
        <div style={s("width:clamp(160px,26vh,280px);height:clamp(120px,18vh,190px)")} />
      </div>

      <div style={s("position:absolute;left:clamp(24px,5vw,72px);bottom:clamp(28px,3.4vw,46px);display:flex;align-items:center;gap:10px")}>
        <img src="/assets/logos/iso-acid.png" alt="STAN iso" style={s("display:block;width:26px;height:auto;flex:none")} />
        <div style={s("font-weight:700;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;line-height:1.7;color:rgba(245,243,236,0.66)")}>
          {SITE.tagline[0]}
          <br />
          {SITE.tagline[1]}
        </div>
      </div>

      <div style={s("position:absolute;right:clamp(64px,7vw,120px);top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:flex-end;gap:clamp(120px,20vh,220px);pointer-events:none")}>
        <ArrowRight width={70} height={14} stroke="rgba(245,243,236,0.9)" />
        <div style={s("font-family:var(--font-grotesk);font-weight:500;font-size:clamp(15px,1.4vw,20px);line-height:1.15;letter-spacing:0.02em;text-transform:uppercase;color:#f5f3ec;text-align:right")}>
          Nuestro
          <br />
          Manifiesto
        </div>
      </div>
    </section>
  );
}
