import { s } from "../style";
import { ArrowRight, ChevronDown } from "../icons";
import { SITE } from "@/lib/landing-data";

export function Hero() {
  return (
    <section id="hero" style={s("position:relative;min-height:100svh;overflow:hidden;background:#0d0d0d;color:#f5f3ec")}>
      {/* Fondo */}
      <div style={s("position:absolute;inset:0;z-index:0")}>
        <img src="/assets/imagery/hero-home.png" alt="" style={s("width:100%;height:100%;object-fit:cover;object-position:center;display:block")} />
      </div>
      {/* Scrim */}
      <div style={s("position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg, rgba(13,13,13,0.66) 0%, rgba(13,13,13,0.28) 22%, rgba(13,13,13,0.2) 55%, rgba(13,13,13,0.8) 88%, rgba(13,13,13,0.95) 100%)")} />

      {/* Header */}
      <header style={s("position:absolute;top:0;left:0;right:0;z-index:20;display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:clamp(22px,3vw,40px) clamp(24px,5vw,72px);padding-right:clamp(56px,6vw,96px)")}>
        <nav style={s("display:flex;align-items:center;gap:clamp(22px,3vw,52px);flex-wrap:wrap")}>
          {SITE.nav.map((n) => (
            <a key={n.label} className="stan-navlink" href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="stan-buildlink" href="#contact">
          Let’s build something
        </a>
      </header>

      {/* Tag colgante */}
      <div style={s("position:absolute;top:-12px;left:50%;transform:translateX(-50%);z-index:7;pointer-events:none")}>
        <img
          src="/assets/imagery/hero-tag.png"
          alt="We STAN for the vision"
          style={s("display:block;width:clamp(360px,39vw,630px);height:auto;transform-origin:50% 0;animation:stan-sway 7s var(--ease-inout) infinite;filter:drop-shadow(0 22px 30px rgba(0,0,0,0.55))")}
        />
      </div>

      {/* Copy inferior */}
      <div style={s("position:absolute;left:0;right:0;bottom:0;z-index:8;padding:0 clamp(24px,5vw,72px) clamp(30px,3.4vw,46px);padding-right:clamp(56px,6vw,96px)")}>
        <div style={s("display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:clamp(28px,5vw,80px)")}>
          <h1 style={s("font-family:var(--font-grotesk);font-weight:500;font-size:clamp(15px,1.5vw,21px);line-height:1.16;letter-spacing:-0.01em;margin:0")}>
            Ideas grandes.
            <br />
            <span style={{ fontStyle: "italic" }}>Ideas complejas.</span>
            <br />
            <span style={s("font-style:italic;text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1.5px")}>
              Ideas imposibles.
            </span>
          </h1>
          <div style={s("max-width:320px;min-width:220px;display:flex;flex-direction:column;gap:clamp(16px,2vw,26px)")}>
            <p style={s("font-size:clamp(12px,1vw,14px);line-height:1.5;font-weight:400;color:rgba(245,243,236,0.94);margin:0")}>
              Las transformamos en{" "}
              <span style={s("text-decoration:underline;text-underline-offset:3px")}>experiencias, contenidos</span> y{" "}
              <span style={s("text-decoration:underline;text-underline-offset:3px")}>producciones</span> que{" "}
              <span style={{ fontWeight: 700 }}>generan impacto.</span>
            </p>
            <a className="stan-textlink" href="#work" style={s("font-size:clamp(12px,1.1vw,15px)")}>
              Ver proyectos
              <ArrowRight width={52} height={10} />
            </a>
          </div>
        </div>
        <div style={s("display:flex;align-items:center;gap:10px;margin-top:clamp(18px,2.2vw,30px)")}>
          <img src="/assets/logos/iso-acid.png" alt="STAN iso" style={s("display:block;width:26px;height:auto;flex:none")} />
          <div style={s("font-weight:700;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;line-height:1.7;color:rgba(245,243,236,0.66)")}>
            {SITE.tagline[0]}
            <br />
            {SITE.tagline[1]}
          </div>
        </div>
      </div>

      {/* Chevron scroll */}
      <a href="#work" style={s("position:absolute;bottom:clamp(16px,2vw,26px);left:50%;transform:translateX(-50%);z-index:9;color:rgba(245,243,236,0.7);animation:stan-bob 2.6s var(--ease-inout) infinite")}>
        <ChevronDown />
      </a>
    </section>
  );
}
