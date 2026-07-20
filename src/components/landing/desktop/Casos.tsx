import { s } from "../style";
import { PlayCircle } from "../icons";
import { SITE, type Caso } from "@/lib/landing-data";

const VTITLE = "writing-mode:vertical-rl;font-family:Bootzy;font-weight:400;font-size:clamp(40px,5.4vw,88px);letter-spacing:0.04em;text-transform:uppercase;color:#f5f3ec";

export function Casos({ casos, onOpen }: { casos: Caso[]; onOpen: (key: string) => void }) {
  return (
    <section id="casos" style={s("background:#0d0d0d;color:#f5f3ec;padding:clamp(44px,5.5vw,84px) clamp(24px,5vw,72px) clamp(40px,5vw,72px)")}>
      <div style={s("max-width:1560px;margin:0 auto;display:flex;gap:clamp(22px,3vw,52px);align-items:stretch")}>
        {/* Título vertical Bootzy */}
        <div style={s("flex:none;display:flex;flex-direction:column;gap:clamp(10px,1.4vw,20px)")}>
          <span style={s("font-family:var(--font-grotesk);font-weight:700;font-size:12px;letter-spacing:0.04em;color:var(--stan-acid)")}>{SITE.casos.n}</span>
          <div style={s("display:flex;gap:clamp(6px,0.9vw,16px);align-items:flex-start")}>
            <span style={s(`${VTITLE};line-height:0.9`)}>{SITE.casos.title[1]}</span>
            <div style={s("display:flex;flex-direction:column;align-items:flex-start;gap:clamp(2px,0.4vw,8px)")}>
              <span style={s(`${VTITLE};line-height:0.35`)}>{SITE.casos.title[0]}</span>
              <p style={s("max-width:86px;margin:10px 0;font-size:13px;line-height:1.15;font-weight:700;color:#f5f3ec;font-family:Bootzy;letter-spacing:0.9px")}>{SITE.casos.lead}</p>
            </div>
          </div>
        </div>

        {/* Cards con hover-expand */}
        <div style={s("flex:1;min-width:0;display:flex;gap:clamp(12px,1.4vw,22px);height:clamp(430px,60vh,640px)")}>
          {casos.map((c) => (
            <div
              key={c.key}
              className="caso-card"
              onClick={() => onOpen(c.key)}
              style={s("position:relative;min-width:0;border-radius:clamp(14px,1.4vw,24px);overflow:hidden;background:#1a1a1a;cursor:pointer")}
            >
              <div style={s("position:absolute;inset:0;pointer-events:none")}>
                {c.cover ? (
                  <img src={c.cover} alt={c.title} style={s("width:100%;height:100%;object-fit:cover;object-position:center;display:block")} />
                ) : null}
              </div>
              <div style={s("position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(13,13,13,0) 42%,rgba(13,13,13,0.88) 100%)")} />
              <div style={s("position:absolute;left:0;right:0;bottom:0;padding:clamp(16px,1.4vw,26px)")}>
                <h3 style={s("margin:0 0 9px;font-family:var(--font-grotesk);font-weight:400;font-size:clamp(19px,1.7vw,28px);line-height:1;text-transform:uppercase")}>
                  {c.titleLines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < c.titleLines.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </h3>
                <span style={s("display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:500;letter-spacing:0.03em;color:rgba(245,243,236,0.88);white-space:nowrap")}>
                  Ver video <PlayCircle width={15} height={15} stroke="var(--stan-acid)" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
