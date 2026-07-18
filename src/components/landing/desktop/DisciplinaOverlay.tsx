import { s } from "../style";
import { ArrowLeft } from "../icons";
import { Marquee } from "./Marquee";
import type { Discipline } from "@/lib/landing-data";

export function DisciplinaOverlay({ discipline, onClose }: { discipline: Discipline; onClose: () => void }) {
  const detail = discipline.detail ?? [];
  return (
    <div style={s("position:fixed;inset:0;z-index:70;background:#0d0d0d;color:#f5f3ec;overflow:auto;font-family:var(--font-grotesk);display:flex;flex-direction:column")}>
      <header style={s("display:flex;align-items:center;justify-content:space-between;gap:20px;padding:clamp(20px,2.6vw,36px) clamp(24px,5vw,64px)")}>
        <nav style={s("display:flex;align-items:center;gap:clamp(20px,2.6vw,44px)")}>
          <a className="stan-navlink" href="#work" style={s("text-decoration:underline;text-underline-offset:4px")}>Work</a>
          <a className="stan-navlink" href="#hero">Vision</a>
          <a className="stan-navlink" href="#manifesto">Manifesto</a>
          <a className="stan-navlink" href="#contact">Contact</a>
        </nav>
        <img src="/assets/logos/logo-slogan-white.png" alt="We STAN for the vision" style={s("height:clamp(26px,2.6vw,38px);width:auto")} />
        <a className="stan-buildlink" href="#contact" style={s("text-decoration:underline;text-underline-offset:4px")}>Let’s build something</a>
      </header>

      <div style={s("flex:1;padding:clamp(8px,1.2vw,20px) clamp(24px,5vw,64px) clamp(28px,3.4vw,56px)")}>
        <div onClick={onClose} style={s("display:inline-flex;align-items:center;gap:14px;margin-bottom:clamp(18px,2.2vw,34px);cursor:pointer")}>
          <ArrowLeft width={26} height={12} stroke="#f5f3ec" />
          <span style={s("font-weight:700;font-size:12px;color:var(--stan-acid)")}>02.</span>
          <span style={s("font-weight:700;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#f5f3ec")}>Qué hacemos</span>
        </div>

        <div style={s("display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:clamp(20px,3vw,48px);margin-bottom:clamp(48px,6vw,96px)")}>
          <div style={s("display:flex;align-items:center;gap:0")}>
            <h2 style={s("margin:0;font-family:Bootzy,var(--font-grotesk);font-weight:400;font-size:clamp(52px,7.4vw,140px);line-height:0.82;letter-spacing:0.02em;text-transform:uppercase;color:var(--stan-paper)")}>{discipline.title}</h2>
            <img src="/assets/logos/iso-acid-nomark.png" alt="" style={s("height:clamp(118px,14vw,236px);width:auto;margin-left:clamp(-20px,-1.4vw,-6px);margin-top:clamp(-64px,-6vw,-24px);flex:none")} />
          </div>
          <p style={s("max-width:360px;font-size:clamp(13px,1.05vw,16px);line-height:1.45;font-weight:500;color:#f5f3ec;margin:clamp(8px,1.2vw,24px) 0 0")}>{discipline.desc}</p>
        </div>

        <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(20px,2.6vw,50px)")}>
          {detail.map((item, i) => (
            <div key={item.title} style={s("display:flex;flex-direction:column")}>
              <span style={s("font-weight:700;font-size:12px;letter-spacing:0.02em;color:var(--stan-acid);margin-bottom:12px")}>{`0${i + 1}.`}</span>
              <h3 style={s("margin:0 0 22px;font-family:var(--font-grotesk);font-weight:700;font-size:clamp(16px,1.35vw,21px);letter-spacing:0.005em;text-transform:uppercase;color:#f5f3ec")}>{item.title}</h3>
              <div style={s("border-radius:clamp(9px,1vw,14px);overflow:hidden;aspect-ratio:4/3;background:#1a1a1a;margin-bottom:20px")} />
              <p style={s("font-size:13px;line-height:1.5;color:rgba(245,243,236,0.72);margin:0")}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Marquee />
    </div>
  );
}
