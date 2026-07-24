import { s } from "../style";
import { ArrowRight } from "../icons";
import { casosByDiscipline, SITE, type Caso, type Discipline } from "@/lib/landing-data";

export function QueHacemos({
  disciplines,
  casos,
  onOpen,
}: {
  disciplines: Discipline[];
  casos: Caso[];
  onOpen: (key: string) => void;
}) {
  return (
    <section id="work" style={s("background:#0d0d0d;color:#f5f3ec;padding:clamp(48px,6vw,88px) clamp(24px,5vw,72px) clamp(40px,5vw,72px)")}>
      <div style={s("max-width:1460px;margin:0 auto")}>
        <div style={s("display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:clamp(24px,4vw,56px)")}>
          <div style={s("display:flex;gap:clamp(12px,1.2vw,18px);align-items:baseline")}>
            <span style={s("font-family:var(--font-grotesk);font-weight:700;font-size:12px;letter-spacing:0.04em;color:var(--stan-acid)")}>{SITE.work.n}</span>
            <h2 style={s("font-family:var(--font-grotesk);font-weight:500;font-size:clamp(26px,3.4vw,46px);line-height:1;letter-spacing:0.005em;text-transform:uppercase;margin:0")}>{SITE.work.title}</h2>
          </div>
          <p style={s("max-width:280px;font-size:clamp(12px,1vw,14px);line-height:1.4;font-weight:700;margin:0;color:#f5f3ec")}>{SITE.work.lead}</p>
        </div>

        <div style={s("margin-top:clamp(40px,5vw,72px);display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:clamp(22px,2.6vw,44px)")}>
          {disciplines.map((d) => {
            // Clickeable si tiene detalle propio o si hay casos de esa área (G11).
            const nCasos = casosByDiscipline(d.key, casos).length;
            const clickable = Boolean(d.detail) || nCasos > 0;
            return (
              <div
                key={d.key}
                onClick={clickable ? () => onOpen(d.key) : undefined}
                style={s(`display:flex;flex-direction:column;${clickable ? "cursor:pointer" : ""}`)}
              >
                <img src={d.icon} alt="" style={s("display:block;height:30px;width:auto;align-self:flex-start;margin-bottom:14px")} />
                <h3 style={s("font-family:var(--font-grotesk);font-weight:900;font-size:clamp(19px,1.7vw,25px);letter-spacing:-0.01em;line-height:1;margin:0 0 16px;color:var(--stan-acid)")}>{d.title}</h3>
                <div style={s("aspect-ratio:16/11;border-radius:10px;overflow:hidden;background:#1a1a1a;margin-bottom:18px")}>
                  {d.image ? (
                    <img src={d.image} alt="" style={s("width:100%;height:100%;object-fit:cover;display:block")} />
                  ) : null}
                </div>
                <p style={s("font-size:13px;line-height:1.5;color:rgba(245,243,236,0.8);margin:0")}>{d.desc}</p>
                <ul style={s("list-style:none;margin:20px 0 0;padding:16px 0 0;border-top:1px solid rgba(245,243,236,0.16);display:flex;flex-direction:column;gap:9px")}>
                  {d.items.map((it) => (
                    <li key={it} style={s("font-size:13px;color:rgba(245,243,236,0.72)")}>{it}</li>
                  ))}
                </ul>
                {clickable ? (
                  <span style={s("display:inline-flex;align-items:center;gap:9px;margin-top:18px;font-weight:700;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--stan-acid)")}>
                    Ver área <ArrowRight width={34} height={10} stroke="var(--stan-acid)" />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
