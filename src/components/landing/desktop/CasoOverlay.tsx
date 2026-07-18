import { s } from "../style";
import { ArrowLeft, ArrowRight, PlayCircle } from "../icons";
import type { Caso } from "@/lib/landing-data";

const VTITLE = "writing-mode:vertical-rl;font-family:Bootzy;font-weight:400;font-size:clamp(38px,7vh,80px);letter-spacing:0.04em;text-transform:uppercase;color:#f5f3ec";

function OverlayNav() {
  return (
    <header style={s("display:flex;align-items:center;justify-content:space-between;gap:20px;padding:clamp(20px,2.6vw,36px) clamp(24px,5vw,64px)")}>
      <nav style={s("display:flex;align-items:center;gap:clamp(20px,2.6vw,44px)")}>
        <a className="stan-navlink" href="#casos" style={s("text-decoration:underline;text-underline-offset:4px")}>Work</a>
        <a className="stan-navlink" href="#hero">Vision</a>
        <a className="stan-navlink" href="#manifesto">Manifesto</a>
        <a className="stan-navlink" href="#contact">Contact</a>
      </nav>
      <img src="/assets/logos/logo-slogan-white.png" alt="We STAN for the vision" style={s("height:clamp(26px,2.6vw,38px);width:auto")} />
      <a className="stan-buildlink" href="#contact" style={s("text-decoration:underline;text-underline-offset:4px")}>Let’s build something</a>
    </header>
  );
}

export function CasoOverlay({ caso, onClose }: { caso: Caso; onClose: () => void }) {
  return (
    <div style={s("position:fixed;inset:0;z-index:70;background:#0d0d0d;color:#f5f3ec;overflow:auto;font-family:var(--font-grotesk)")}>
      <OverlayNav />

      <div style={s("padding:clamp(4px,1vw,14px) clamp(24px,5vw,64px) clamp(20px,2.6vw,40px);display:grid;grid-template-columns:auto minmax(0,1.15fr) minmax(0,1fr);gap:clamp(20px,3vw,56px);align-items:stretch")}>
        {/* Columna izquierda: volver + título vertical */}
        <div style={s("display:flex;flex-direction:column;align-items:flex-start;gap:clamp(14px,1.6vw,26px);align-self:stretch")}>
          <div onClick={onClose} style={s("display:flex;align-items:center;gap:10px;cursor:pointer")}>
            <ArrowLeft width={24} height={12} stroke="rgba(245,243,236,0.9)" />
            <span style={s("font-weight:700;font-size:12px;color:var(--stan-acid)")}>03.</span>
          </div>
          <div style={s("display:flex;gap:clamp(6px,0.9vw,16px);align-items:flex-start")}>
            <span style={s(`${VTITLE};line-height:0.9`)}>Destacados</span>
            <span style={s(`${VTITLE};line-height:0.35`)}>Casos</span>
          </div>
        </div>

        {/* Video principal */}
        <div style={s("position:relative;overflow:hidden;background:#1a1a1a;min-height:clamp(240px,42vh,520px)")}>
          {caso.cover ? (
            <div style={s("position:absolute;inset:0")}>
              <img src={caso.cover} alt={caso.title} style={s("width:100%;height:100%;object-fit:cover;object-position:center;display:block")} />
            </div>
          ) : null}
          <span style={s("position:absolute;top:clamp(12px,1.4vw,22px);right:clamp(14px,1.6vw,26px);z-index:2;display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:#f5f3ec")}>
            Ver video <PlayCircle width={17} height={17} stroke="var(--stan-acid)" />
          </span>
        </div>

        {/* Ficha */}
        <div style={s("display:flex;flex-direction:column")}>
          <div style={s("font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.6);margin-bottom:14px")}>{caso.tag}</div>
          <h2 style={s("margin:0 0 20px;font-family:'Bootzy',var(--font-grotesk);font-weight:400;font-size:clamp(34px,4.6vw,64px);line-height:0.96")}>{caso.title}</h2>
          <p style={s("font-size:clamp(13px,1vw,15px);line-height:1.5;color:#f5f3ec;margin:0 0 18px;padding-bottom:18px;border-bottom:1px solid rgba(245,243,236,0.16)")}>{caso.lead}</p>
          <p style={s("font-size:clamp(13px,1vw,15px);line-height:1.5;color:rgba(245,243,236,0.82);margin:0 0 22px")}>{caso.body}</p>
          <div style={s("font-family:var(--font-grotesk);font-weight:900;font-size:clamp(16px,1.5vw,22px);letter-spacing:0.01em;text-transform:uppercase;color:var(--stan-acid);margin-bottom:20px")}>Lo que hicimos</div>
          <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(10px,1.4vw,22px);margin-top:auto;padding-top:20px;border-top:1px solid rgba(245,243,236,0.16)")}>
            {caso.services.map((sv) => (
              <div key={sv.label} style={s("display:flex;flex-direction:column;gap:12px")}>
                <img src={sv.icon} alt="" style={s("height:38px;width:auto;align-self:flex-start;display:block")} />
                <span style={s("font-size:12px;line-height:1.3;color:rgba(245,243,236,0.85)")}>{sv.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stills */}
      <div style={s("padding:0 clamp(24px,5vw,64px) clamp(20px,2.6vw,40px)")}>
        <div style={s("display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(10px,1.4vw,22px)")}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={s("border-radius:0;overflow:hidden;aspect-ratio:16/9;background:#1a1a1a")} />
          ))}
        </div>
      </div>

      {/* Barra inferior */}
      <div style={s("background:#f5f3ec;color:#0d0d0d;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:clamp(16px,1.8vw,26px) clamp(24px,5vw,64px)")}>
        <span onClick={onClose} style={s("display:inline-flex;align-items:center;gap:12px;font-weight:500;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#0d0d0d;cursor:pointer")}>
          <ArrowLeft width={34} height={12} /> Volver a proyectos
        </span>
        <span style={s("display:inline-flex;align-items:center;gap:12px;font-weight:500;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#0d0d0d")}>
          Ver siguiente proyecto <ArrowRight width={34} height={12} />
        </span>
      </div>
    </div>
  );
}
