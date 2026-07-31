import { s } from "../style";
import { ArrowLeft, ChevronDown, PlayCircle } from "../icons";
import { Marquee } from "./Marquee";
import { casosByDiscipline, MAX_CASOS_AREA, type Caso, type Discipline } from "@/lib/landing-data";

/** Ancla del bloque de casos, destino del botón "Ver casos destacados".
 *  Los árboles desktop y mobile conviven en el DOM (se alternan por media
 *  query), así que cada uno usa su propio id. */
const CASOS_ANCHOR = "area-casos-desktop";

export function DisciplinaOverlay({
  discipline,
  casos: allCasos,
  onOpenCaso,
  onClose,
}: {
  discipline: Discipline;
  casos: Caso[];
  onOpenCaso: (key: string) => void;
  onClose: () => void;
}) {
  const detail = discipline.detail ?? [];
  const casos = casosByDiscipline(discipline.key, allCasos, MAX_CASOS_AREA); // área → sus casos (G11), 2-3 según BB Factor
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
          <div style={s("max-width:360px;margin:clamp(8px,1.2vw,24px) 0 0")}>
            <p style={s("font-size:clamp(13px,1.05vw,16px);line-height:1.45;font-weight:500;color:#f5f3ec;margin:0")}>{discipline.desc}</p>

            {/* Señal de scroll: sin esto la subpágina "termina" visualmente en las
                tarjetas de sub-servicio y nadie baja hasta los casos del área.
                Solo existe si abajo hay algo a donde ir. */}
            {casos.length > 0 ? (
              <button
                type="button"
                onClick={() => document.getElementById(CASOS_ANCHOR)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                style={s("display:inline-flex;align-items:center;gap:12px;margin-top:clamp(18px,1.8vw,28px);padding:0;background:none;border:none;cursor:pointer;font-family:inherit;font-weight:700;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid)")}
              >
                Ver casos destacados
                <ChevronDown className="stan-scrollhint" width={20} height={12} stroke="currentColor" strokeWidth={1.8} />
              </button>
            ) : null}
          </div>
        </div>

        {detail.length > 0 ? (
          <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(20px,2.6vw,50px)")}>
            {detail.map((item, i) => (
              <div key={`${i}-${item.title}`} style={s("display:flex;flex-direction:column")}>
                <span style={s("font-weight:700;font-size:12px;letter-spacing:0.02em;color:var(--stan-acid);margin-bottom:12px")}>{`0${i + 1}.`}</span>
                <h3 style={s("margin:0 0 22px;font-family:var(--font-grotesk);font-weight:700;font-size:clamp(16px,1.35vw,21px);letter-spacing:0.005em;text-transform:uppercase;color:#f5f3ec")}>{item.title}</h3>
                <div style={s("border-radius:clamp(9px,1vw,14px);overflow:hidden;aspect-ratio:4/3;background:#1a1a1a;margin-bottom:20px")}>
                  {item.image ? (
                    <img src={item.image} alt="" style={s("width:100%;height:100%;object-fit:cover;display:block")} />
                  ) : null}
                </div>
                <p style={s("font-size:13px;line-height:1.5;color:rgba(245,243,236,0.72);margin:0")}>{item.desc}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Casos destacados del área — banners largos de punta a punta (BB Factor 29/07).
            Nace del G11 (feedback Adriano 20/07, área → sus casos) y se reformatea al
            mockup de Bianca: menos detalle que el caso del Home, el video del producto
            final al frente y todo resuelto acá, sin mandar a ninguna sección nueva. */}
        {casos.length > 0 ? (
          <>
            {/* Marquee separador — full-bleed: cancela el padding lateral del contenedor */}
            <div style={s(`margin:${detail.length > 0 ? "clamp(48px,6vw,96px)" : "clamp(20px,2.4vw,40px)"} calc(clamp(24px,5vw,64px) * -1) clamp(36px,4.4vw,72px)`)}>
              <Marquee />
            </div>

            <h3 id={CASOS_ANCHOR} style={s("margin:0 0 clamp(24px,3vw,48px);scroll-margin-top:clamp(16px,2vw,32px);font-family:var(--font-grotesk);font-weight:500;font-size:clamp(20px,2vw,32px);letter-spacing:0.14em;text-transform:uppercase;color:var(--stan-paper)")}>
              Casos destacados
            </h3>

            <div>
              {casos.map((c, i) => (
                <div
                  key={c.key}
                  onClick={() => onOpenCaso(c.key)}
                  style={s(`display:grid;grid-template-columns:minmax(0,0.9fr) minmax(0,2fr);gap:clamp(24px,3.4vw,64px);align-items:center;cursor:pointer;padding:clamp(22px,2.8vw,44px) 0${i > 0 ? ";border-top:1px solid rgba(245,243,236,0.16)" : ""}`)}
                >
                  <div>
                    <div style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid);margin-bottom:10px")}>{c.tag}</div>
                    <h4 style={s("margin:0 0 14px;font-family:var(--font-grotesk);font-weight:500;font-size:clamp(19px,1.9vw,29px);line-height:1.05;text-transform:uppercase;color:#f5f3ec")}>{c.title}</h4>
                    {c.lead ? (
                      <p style={s("margin:0;font-size:13px;line-height:1.5;color:rgba(245,243,236,0.72);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden")}>{c.lead}</p>
                    ) : null}
                  </div>

                  <div style={s("position:relative;aspect-ratio:12/5;background:#1a1a1a;overflow:hidden")}>
                    {c.cover ? (
                      <img src={c.cover} alt={c.title} style={s("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block")} />
                    ) : null}
                    <div style={s("position:absolute;inset:0;display:flex;align-items:center;justify-content:center")}>
                      <span style={s("display:inline-flex;align-items:center;justify-content:center;width:clamp(44px,4vw,60px);height:clamp(44px,4vw,60px);border-radius:999px;background:rgba(13,13,13,0.34);backdrop-filter:blur(2px)")}>
                        <PlayCircle width={30} height={30} stroke="#f5f3ec" strokeWidth={1.2} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <Marquee />
    </div>
  );
}
