"use client";

import { useRef, useState } from "react";
import { s } from "../style";
import { ArrowRight, ChevronDown, PlayCircle, Close } from "../icons";
import { SITE, relatedCaso, disciplineTitle, casosByDiscipline, type Caso, type Discipline } from "@/lib/landing-data";
import type { SiteSettings } from "@/lib/data/settings";

type SectionKey = "hero" | "work" | "casos" | "manifesto" | "contact";

export function MobileLanding({ casos, disciplines, settings }: { casos: Caso[]; disciplines: Discipline[]; settings: SiteSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState(-1);
  const [discIdx, setDiscIdx] = useState(-1); // overlay de disciplina (navegación cruzada, G11)
  const [reelOpen, setReelOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const lastIdx = useRef(0);
  const startY = useRef(0);

  const heroRef = useRef<HTMLElement>(null);
  const workRef = useRef<HTMLElement>(null);
  const casosRef = useRef<HTMLElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const refMap: Record<SectionKey, React.RefObject<HTMLElement | null>> = {
    hero: heroRef, work: workRef, casos: casosRef, manifesto: manifestoRef, contact: contactRef,
  };

  const go = (key: SectionKey) => {
    setMenuOpen(false);
    const el = refMap[key].current;
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const sheetOpen = openIdx >= 0;
  if (sheetOpen) lastIdx.current = openIdx;
  const current = casos[sheetOpen ? openIdx : lastIdx.current];
  // Caso relacionado para el "siguiente proyecto" del sheet (feedback Adriano 20/07)
  const nextCaso = current ? relatedCaso(current, casos) : undefined;
  const nextIdx = nextCaso ? casos.findIndex((c) => c.key === nextCaso.key) : -1;
  const nextArea = nextCaso?.disciplines?.[0] ? disciplineTitle(nextCaso.disciplines[0], disciplines) : null;
  // Casos recomendados al pie (rabbit-hole: manual o random, decisión Adriano 22/07)
  const recCasos: Caso[] = current
    ? (current.recommended ?? [])
        .map((k) => casos.find((c) => c.key === k))
        .filter((c): c is Caso => Boolean(c))
    : [];
  // Disciplina abierta + sus casos (navegación cruzada área → casos, G11)
  const disc = discIdx >= 0 ? disciplines[discIdx] : undefined;
  const discCasos = disc ? casosByDiscipline(disc.key, casos) : [];

  return (
    <div style={s("position:relative;background:#0d0d0d;color:#f5f3ec;font-family:var(--font-grotesk);overflow-x:hidden")}>
      {/* HEADER STICKY COMPACTO */}
      <header style={s("position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 18px;background:rgba(13,13,13,0.92);border-bottom:1px solid rgba(245,243,236,0.16);backdrop-filter:blur(6px)")}>
        <a onClick={() => go("hero")} style={s("display:flex;align-items:center;gap:9px;text-decoration:none;cursor:pointer")}>
          <img src="/assets/logos/iso-white.png" alt="STAN" style={s("height:26px;width:auto;display:block")} />
          <img src="/assets/logos/stan-white.png" alt="STAN" style={s("height:15px;width:auto;display:block")} />
        </a>
        <button onClick={() => setMenuOpen(true)} aria-label="Menú" style={s("width:44px;height:44px;margin-right:-10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:0")}>
          <span style={s("width:22px;height:2px;background:#f5f3ec;display:block")} />
          <span style={s("width:22px;height:2px;background:#f5f3ec;display:block")} />
        </button>
      </header>

      {/* HERO */}
      <section ref={heroRef} style={s("position:relative;margin-top:-64px;min-height:720px;overflow:hidden;background:#0d0d0d")}>
        <div style={s("position:absolute;inset:0;z-index:0")}>
          <img src="/assets/imagery/hero-home.webp" alt="" style={s("width:100%;height:100%;object-fit:cover;object-position:72% center;display:block")} />
        </div>
        <div style={s("position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg, rgba(13,13,13,0.72) 0%, rgba(13,13,13,0.28) 26%, rgba(13,13,13,0.28) 52%, rgba(13,13,13,0.86) 84%, rgba(13,13,13,0.98) 100%)")} />

        <div style={s("position:absolute;top:56px;left:50%;transform:translateX(-50%);z-index:7;pointer-events:none")}>
          <img src="/assets/imagery/hero-tag.webp" alt="We STAN for the vision" style={s("display:block;width:248px;height:auto;transform-origin:50% 0;animation:stan-sway 7s var(--ease-inout) infinite;filter:drop-shadow(0 18px 26px rgba(0,0,0,0.55))")} />
        </div>

        <div style={s("position:absolute;left:0;right:0;bottom:0;z-index:8;padding:0 22px 40px")}>
          <h1 style={s("font-family:var(--font-grotesk);font-weight:500;font-size:30px;line-height:1.08;letter-spacing:-0.015em;margin:0 0 20px")}>
            Ideas grandes.
            <br />
            <span style={{ fontStyle: "italic" }}>Ideas complejas.</span>
            <br />
            <span style={s("font-style:italic;text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px")}>Ideas imposibles.</span>
          </h1>
          <p style={s("font-size:17px;line-height:1.5;font-weight:400;color:rgba(245,243,236,0.94);margin:0 0 22px;max-width:330px")}>
            Las transformamos en <span style={s("text-decoration:underline;text-underline-offset:3px")}>experiencias, contenidos</span> y <span style={s("text-decoration:underline;text-underline-offset:3px")}>producciones</span> que <span style={{ fontWeight: 700 }}>generan impacto.</span>
          </p>
          <div style={s("display:flex;flex-wrap:wrap;align-items:center;gap:20px")}>
            <a onClick={() => go("casos")} style={s("display:inline-flex;align-items:center;gap:14px;min-height:44px;text-decoration:none;font-weight:500;font-size:16px;letter-spacing:0.12em;text-transform:uppercase;color:#f5f3ec;cursor:pointer")}>
              Ver proyectos
              <ArrowRight width={56} height={11} />
            </a>
            <a onClick={() => setReelOpen(true)} style={s("display:inline-flex;align-items:center;gap:10px;min-height:44px;text-decoration:none;font-weight:500;font-size:16px;letter-spacing:0.12em;text-transform:uppercase;color:#f5f3ec;cursor:pointer")}>
              <PlayCircle width={20} height={20} stroke="var(--stan-acid)" />
              Ver Reel 2026
            </a>
          </div>
          <div style={s("display:flex;align-items:center;gap:10px;margin-top:26px")}>
            <img src="/assets/logos/iso-acid.png" alt="STAN iso" style={s("display:block;width:26px;height:auto;flex:none")} />
            <div style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;line-height:1.7;color:rgba(245,243,236,0.66)")}>
              {SITE.tagline[0]}
              <br />
              {SITE.tagline[1]}
            </div>
          </div>
        </div>
        <a onClick={() => go("work")} aria-label="Ver proyectos" style={s("position:absolute;bottom:8px;left:50%;transform:translateX(-50%);z-index:9;width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:rgba(245,243,236,0.7);animation:stan-bob 2.6s var(--ease-inout) infinite;cursor:pointer")}>
          <ChevronDown width={24} height={15} />
        </a>
      </section>

      {/* 01 · QUÉ HACEMOS */}
      <section ref={workRef} style={s("background:#0d0d0d;padding:56px 22px 44px")}>
        <div style={s("display:flex;gap:12px;align-items:baseline;margin-bottom:14px")}>
          <span style={s("font-weight:700;font-size:13px;color:var(--stan-acid)")}>{SITE.work.n}</span>
          <h2 style={s("font-weight:500;font-size:38px;line-height:0.95;text-transform:uppercase;margin:0")}>Qué<br />hacemos</h2>
        </div>
        <p style={s("font-size:17px;line-height:1.42;font-weight:700;margin:0 0 36px;color:#f5f3ec")}>{SITE.work.lead}</p>

        <div style={s("display:flex;flex-direction:column;gap:44px")}>
          {disciplines.map((d, di) => {
            // Clickeable si tiene detalle propio o casos de esa área (G11).
            const clickable = Boolean(d.detail) || casosByDiscipline(d.key, casos).length > 0;
            return (
              <div
                key={d.key}
                onClick={clickable ? () => setDiscIdx(di) : undefined}
                style={s(`display:flex;flex-direction:column;${clickable ? "cursor:pointer" : ""}`)}
              >
                <img src={d.icon} alt="" style={s("display:block;height:30px;width:auto;align-self:flex-start;margin-bottom:14px")} />
                <h3 style={s("font-family:var(--font-grotesk);font-weight:900;font-size:26px;letter-spacing:-0.01em;line-height:1;margin:0 0 16px;color:var(--stan-acid)")}>{d.title}</h3>
                <div style={s("aspect-ratio:16/10;border-radius:10px;overflow:hidden;background:#1a1a1a;margin-bottom:18px")} />
                <p style={s("font-size:17px;line-height:1.5;color:rgba(245,243,236,0.84);margin:0")}>{d.desc}</p>
                <ul style={s("list-style:none;margin:20px 0 0;padding:16px 0 0;border-top:1px solid rgba(245,243,236,0.16);display:flex;flex-direction:column;gap:11px")}>
                  {d.items.map((it) => (
                    <li key={it} style={s("font-size:16px;color:rgba(245,243,236,0.72)")}>{it}</li>
                  ))}
                </ul>
                {clickable ? (
                  <span style={s("display:inline-flex;align-items:center;gap:10px;min-height:44px;margin-top:12px;font-weight:700;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:var(--stan-acid)")}>
                    Ver área <ArrowRight width={40} height={11} stroke="var(--stan-acid)" />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* 02 · casos DESTACADOS (carrusel) */}
      <section ref={casosRef} style={s("background:#0d0d0d;padding:44px 22px 40px")}>
        <div style={s("display:flex;gap:12px;align-items:baseline;margin-bottom:14px")}>
          <span style={s("font-weight:700;font-size:13px;color:var(--stan-acid)")}>{SITE.casos.n}</span>
          <h2 style={s("font-weight:500;font-size:38px;line-height:0.95;text-transform:uppercase;margin:0")}>Casos<br />destacados</h2>
        </div>
        <p style={s("font-size:17px;line-height:1.42;font-weight:700;margin:0 0 34px;color:#f5f3ec")}>{SITE.casos.lead}</p>

        <div className="hscroll" style={s("display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -22px;padding:0 22px 4px")}>
          {casos.map((c, i) => (
            <button key={c.key} onClick={() => setOpenIdx(i)} style={s("flex:none;width:78%;scroll-snap-align:start;display:block;text-align:left;padding:0;border:none;background:none;cursor:pointer")}>
              <div style={s("position:relative;border-radius:16px;overflow:hidden;background:#1a1a1a;aspect-ratio:3/4")}>
                <div style={s("position:absolute;inset:0")}>
                  {c.cover ? (
                    <img src={c.cover} alt={c.title} style={s("width:100%;height:100%;object-fit:cover;object-position:center;display:block")} />
                  ) : null}
                </div>
                <div style={s("position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(13,13,13,0) 40%,rgba(13,13,13,0.9) 100%)")} />
                <div style={s("position:absolute;left:0;right:0;bottom:0;padding:20px")}>
                  <div style={s("font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid);margin-bottom:8px")}>{c.tag}</div>
                  <h3 style={s("margin:0 0 12px;font-family:var(--font-grotesk);font-weight:500;font-size:30px;line-height:0.98;text-transform:uppercase;color:#f5f3ec")}>{c.title}</h3>
                  <span style={s("display:inline-flex;align-items:center;gap:9px;min-height:44px;font-size:15px;font-weight:500;letter-spacing:0.03em;color:#f5f3ec")}>
                    Ver proyecto <PlayCircle width={19} height={19} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* marquee (dark) */}
      <div style={s("background:#0d0d0d;border-top:1px solid rgba(245,243,236,0.16);border-bottom:1px solid rgba(245,243,236,0.16);overflow:hidden;padding:14px 0;white-space:nowrap")}>
        <div style={s("display:inline-flex;animation:stan-mq 22s linear infinite;will-change:transform")}>
          {[0, 1].map((rep) => (
            <span key={rep} aria-hidden={rep === 1 || undefined} style={s("display:inline-flex;align-items:center;gap:20px;padding-right:20px;font-weight:700;font-size:14px;letter-spacing:0.14em;text-transform:uppercase")}>
              {Array.from({ length: 3 }).flatMap((_, i) => [
                <span key={`t${i}`}>{SITE.marquee}</span>,
                <img key={`i${i}`} src="/assets/logos/iso-white.png" alt="" style={s("height:15px;width:auto;opacity:0.6")} />,
              ])}
            </span>
          ))}
        </div>
      </div>

      {/* 03 · MANIFESTO */}
      <section ref={manifestoRef} style={s("position:relative;background:#0d0d0d;padding:60px 22px 56px;overflow:hidden")}>
        <div style={s("display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:8px")}>
          <span style={s("font-weight:700;font-size:13px;color:var(--stan-acid)")}>{SITE.manifesto.n}</span>
          <span style={s("font-weight:500;font-size:15px;letter-spacing:0.02em;text-transform:uppercase;color:#f5f3ec")}>{SITE.manifesto.label}</span>
        </div>
        <div style={s("position:relative;width:326px;max-width:100%;margin:0 auto;aspect-ratio:1;display:flex;align-items:center;justify-content:center")}>
          <svg viewBox="0 0 500 500" style={s("position:absolute;inset:0;width:100%;height:100%;overflow:visible;animation:stan-rotate 100s linear infinite")}>
            <defs>
              <path id="m-ring" d="M250,250 m-205,0 a205,205 0 1,1 410,0 a205,205 0 1,1 -410,0" />
            </defs>
            <text fill="rgba(245,243,236,0.9)" style={s("font-family:var(--font-grotesk);font-weight:500;font-size:19px;letter-spacing:0.01em")}>
              <textPath href="#m-ring" startOffset="0%">{SITE.manifesto.ring}</textPath>
            </text>
          </svg>
          <div style={s("width:190px;height:130px")} />
        </div>
        <div style={s("display:flex;align-items:center;gap:10px;justify-content:center;margin-top:20px")}>
          <img src="/assets/logos/iso-acid.png" alt="STAN iso" style={s("display:block;width:26px;height:auto;flex:none")} />
          <div style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;line-height:1.7;color:rgba(245,243,236,0.66);text-align:center")}>
            {SITE.tagline[0]}
            <br />
            {SITE.tagline[1]}
          </div>
        </div>
      </section>

      {/* 04 · CONTACTO */}
      <section ref={contactRef} style={s("position:relative;background:#0d0d0d;padding:44px 22px 40px")}>
        {/* Agendamiento embebido (Calendly, editable desde el CMS). Fallback al
            placeholder si Adriano todavía no cargó el código. */}
        {settings.calendlyEmbed ? (
          <div className="calendly-embed" style={s("border-radius:20px;overflow:hidden;aspect-ratio:4/5;background:#fff;margin-bottom:28px")} dangerouslySetInnerHTML={{ __html: settings.calendlyEmbed }} />
        ) : (
          <div style={s("border-radius:20px;overflow:hidden;aspect-ratio:4/5;background:#1a1a1a;margin-bottom:28px")} />
        )}
        <h2 style={s("margin:0 0 18px;font-family:'Bootzy',var(--font-grotesk);font-weight:400;font-size:66px;line-height:0.84;letter-spacing:0.02em;color:var(--stan-acid);text-transform:uppercase")}>
          {SITE.contact.title[0]}
          <br />
          {SITE.contact.title[1]}
        </h2>
        <p style={s("margin:0 0 32px;font-size:19px;line-height:1.34;font-weight:700;color:#f5f3ec")}>
          Contanos tu idea. Nosotros <span style={s("font-style:italic;text-decoration:underline;text-underline-offset:3px")}>la llevamos a otro nivel.</span>
        </p>

        <div style={s("display:flex;flex-direction:column")}>
          {[
            // Punto de contacto: solo WhatsApp (Adriano 22/07); agendar = Calendly
            // embebido arriba. Instagram + Ubicación quedan como contexto de marca.
            { label: "WhatsApp", value: "Escribinos", href: settings.whatsappUrl || "#" },
            { label: "Instagram", value: SITE.contact.instagram, href: "#" },
            { label: "Ubicación", value: SITE.contact.location, last: true },
          ].map((f) => (
            <div key={f.label} style={s(`padding:18px 0;border-top:1px solid rgba(245,243,236,0.16)${f.last ? ";border-bottom:1px solid rgba(245,243,236,0.16)" : ""}`)}>
              <div style={s("font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.55);margin-bottom:8px")}>{f.label}</div>
              {f.href ? (
                <a href={f.href} style={s("display:inline-flex;align-items:center;min-height:44px;font-size:18px;color:#f5f3ec;text-decoration:none")}>{f.value}</a>
              ) : (
                <span style={s("font-size:18px;color:#f5f3ec")}>{f.value}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* footer */}
      <div style={s("background:#0d0d0d;border-top:1px solid rgba(245,243,236,0.16);padding:22px;display:flex;flex-direction:column;gap:8px")}>
        <span style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.5)")}>{SITE.footer.left}</span>
        <span style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.5)")}>{SITE.footer.right}</span>
      </div>

      {/* spacer para la CTA fija */}
      <div style={s("height:86px")} />

      {/* CTA FIJA */}
      <div style={s("position:fixed;left:0;right:0;bottom:0;z-index:40;padding:14px 16px calc(14px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(13,13,13,0) 0%,rgba(13,13,13,0.9) 34%,#0d0d0d 100%)")}>
        <button onClick={() => go("contact")} style={s("width:100%;min-height:54px;display:flex;align-items:center;justify-content:center;gap:12px;background:var(--stan-acid);color:#0d0d0d;border:none;border-radius:999px;font-family:var(--font-grotesk);font-weight:900;font-size:16px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;box-shadow:0 10px 26px -10px rgba(0,0,0,0.8)")}>
          Trabajemos juntos
          <ArrowRight width={42} height={11} strokeWidth={2} />
        </button>
      </div>

      {/* MENÚ OVERLAY */}
      {menuOpen ? (
        <div style={s("position:fixed;inset:0;z-index:60;background:#0d0d0d;display:flex;flex-direction:column")}>
          <div style={s("display:flex;align-items:center;justify-content:space-between;height:64px;padding:0 18px")}>
            <img src="/assets/logos/logo-slogan-white.png" alt="We STAN for the vision" style={s("height:30px;width:auto")} />
            <button onClick={() => setMenuOpen(false)} aria-label="Cerrar" style={s("width:44px;height:44px;margin-right:-10px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#f5f3ec")}>
              <Close width={26} height={26} />
            </button>
          </div>
          <nav style={s("flex:1;display:flex;flex-direction:column;justify-content:center;gap:26px;padding:0 26px")}>
            <a className="m-navlink" onClick={() => go("work")} style={{ cursor: "pointer" }}>Work</a>
            <a className="m-navlink" onClick={() => go("hero")} style={{ cursor: "pointer" }}>Vision</a>
            <a className="m-navlink" onClick={() => go("manifesto")} style={{ cursor: "pointer" }}>Manifesto</a>
            <a className="m-navlink" onClick={() => go("contact")} style={{ cursor: "pointer" }}>Contact</a>
          </nav>
          <div style={s("padding:26px")}>
            <a onClick={() => go("contact")} style={s("font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid);text-decoration:underline;text-underline-offset:5px;cursor:pointer")}>Let’s build something</a>
          </div>
        </div>
      ) : null}

      {/* REEL OVERLAY (feedback Adriano 20/07) */}
      {reelOpen ? (
        <div style={s("position:fixed;inset:0;z-index:60;background:rgba(6,6,6,0.96);display:flex;flex-direction:column")}>
          <div style={s("display:flex;align-items:center;justify-content:space-between;height:64px;padding:0 18px")}>
            <span style={s("font-weight:700;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid)")}>{SITE.reel.title}</span>
            <button onClick={() => setReelOpen(false)} aria-label="Cerrar" style={s("width:44px;height:44px;margin-right:-10px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#f5f3ec")}>
              <Close width={26} height={26} />
            </button>
          </div>
          <div style={s("flex:1;display:flex;align-items:center;justify-content:center;padding:0 18px 40px")}>
            <div style={s("width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#1a1a1a;position:relative")}>
              {SITE.reel.videoUrl ? (
                <video src={SITE.reel.videoUrl} controls autoPlay playsInline style={s("width:100%;height:100%;object-fit:cover;display:block")} />
              ) : (
                <div style={s("position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:rgba(245,243,236,0.6)")}>
                  <PlayCircle width={54} height={54} stroke="rgba(245,243,236,0.7)" strokeWidth={1.1} />
                  <span style={s("font-size:12px;letter-spacing:0.14em;text-transform:uppercase")}>Reel próximamente</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* OVERLAY DE DISCIPLINA — navegación cruzada área → sus casos (feedback Adriano 20/07, G11) */}
      {disc ? (
        <div style={s("position:fixed;inset:0;z-index:58;background:#0d0d0d;color:#f5f3ec;overflow-y:auto;font-family:var(--font-grotesk)")}>
          <div style={s("position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 18px;background:rgba(13,13,13,0.94);border-bottom:1px solid rgba(245,243,236,0.16);backdrop-filter:blur(6px)")}>
            <span style={s("font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid)")}>Qué hacemos</span>
            <button onClick={() => setDiscIdx(-1)} aria-label="Cerrar" style={s("width:44px;height:44px;margin-right:-10px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#f5f3ec")}>
              <Close width={24} height={24} />
            </button>
          </div>
          <div style={s("padding:26px 22px 60px")}>
            <img src={disc.icon} alt="" style={s("display:block;height:34px;width:auto;margin-bottom:16px")} />
            <h2 style={s("margin:0 0 18px;font-family:'Bootzy',var(--font-grotesk);font-weight:400;font-size:56px;line-height:0.9;text-transform:uppercase;color:var(--stan-paper)")}>{disc.title}</h2>
            <p style={s("font-size:18px;line-height:1.5;font-weight:500;color:#f5f3ec;margin:0 0 30px")}>{disc.desc}</p>

            {(disc.detail ?? []).length > 0 ? (
              <div style={s("display:flex;flex-direction:column;gap:26px;margin-bottom:36px")}>
                {(disc.detail ?? []).map((item, i) => (
                  <div key={item.title} style={s("display:flex;flex-direction:column")}>
                    <span style={s("font-weight:700;font-size:12px;color:var(--stan-acid);margin-bottom:8px")}>{`0${i + 1}.`}</span>
                    <h3 style={s("margin:0 0 12px;font-weight:700;font-size:19px;text-transform:uppercase;color:#f5f3ec")}>{item.title}</h3>
                    <div style={s("aspect-ratio:16/10;border-radius:10px;overflow:hidden;background:#1a1a1a;margin-bottom:12px")} />
                    <p style={s("font-size:15px;line-height:1.5;color:rgba(245,243,236,0.72);margin:0")}>{item.desc}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {discCasos.length > 0 ? (
              <>
                <div style={s("font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid);margin-bottom:16px")}>Casos de {disc.title}</div>
                <div style={s("display:flex;flex-direction:column;gap:14px")}>
                  {discCasos.map((c) => {
                    const ci = casos.findIndex((x) => x.key === c.key);
                    return (
                      <button
                        key={c.key}
                        onClick={() => { setDiscIdx(-1); setOpenIdx(ci); }}
                        style={s("display:block;width:100%;text-align:left;padding:0;border:none;background:none;cursor:pointer")}
                      >
                        <div style={s("position:relative;border-radius:14px;overflow:hidden;aspect-ratio:16/10;background:#1a1a1a")}>
                          {c.cover ? (
                            <img src={c.cover} alt={c.title} style={s("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block")} />
                          ) : null}
                          <div style={s("position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,13,13,0) 44%,rgba(13,13,13,0.9) 100%)")} />
                          <div style={s("position:absolute;left:0;right:0;bottom:0;padding:16px")}>
                            <div style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid);margin-bottom:6px")}>{c.tag}</div>
                            <h4 style={s("margin:0;font-family:var(--font-grotesk);font-weight:500;font-size:24px;line-height:1;text-transform:uppercase;color:#f5f3ec")}>{c.title}</h4>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* BOTTOM SHEET DE CASO */}
      <div style={s(`position:fixed;inset:0;z-index:50;pointer-events:${sheetOpen ? "auto" : "none"}`)}>
        <div onClick={() => setOpenIdx(-1)} style={s(`position:absolute;inset:0;background:rgba(5,5,5,0.6);opacity:${sheetOpen ? 1 : 0};transition:opacity 360ms var(--ease-out)`)} />
        <div style={{ ...s("position:absolute;left:0;right:0;bottom:0;top:24px;background:#0d0d0d;border-radius:20px 20px 0 0;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 -20px 50px -10px rgba(0,0,0,0.7)"), transform: `translateY(${sheetOpen ? `${dragY}px` : "110%"})`, transition: dragging ? "none" : "transform 380ms var(--ease-out)" }}>
          <div
            onPointerDown={(e) => { startY.current = e.clientY; try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} setDragging(true); }}
            onPointerMove={(e) => { if (!dragging) return; setDragY(Math.max(0, e.clientY - startY.current)); }}
            onPointerUp={() => { if (dragY > 120) { setOpenIdx(-1); setDragY(0); setDragging(false); } else { setDragY(0); setDragging(false); } }}
            style={s("flex:none;padding:10px 0 6px;cursor:grab;touch-action:none")}
          >
            <div style={s("width:44px;height:5px;border-radius:999px;background:rgba(245,243,236,0.3);margin:0 auto")} />
          </div>
          <div style={s("flex:none;display:flex;align-items:center;justify-content:space-between;padding:6px 18px 14px")}>
            <span style={s("font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid)")}>Caso destacado</span>
            <button onClick={() => setOpenIdx(-1)} aria-label="Cerrar" style={s("width:44px;height:44px;margin-right:-10px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#f5f3ec")}>
              <Close width={24} height={24} />
            </button>
          </div>
          <div className="stanm" style={s("flex:1;overflow-y:auto;padding:0 18px 32px")}>
            <div style={s("position:relative;border-radius:12px;overflow:hidden;aspect-ratio:16/9;background:#1a1a1a;margin-bottom:22px")}>
              {current?.cover ? (
                <div style={s("position:absolute;inset:0")}>
                  <img src={current.cover} alt={current.title} style={s("width:100%;height:100%;object-fit:cover;display:block")} />
                </div>
              ) : null}
              <div style={s("position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none")}>
                <PlayCircle width={54} height={54} stroke="#f5f3ec" strokeWidth={1.2} />
              </div>
            </div>

            <div style={s("font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.6);margin-bottom:10px")}>{current?.tag}</div>
            <h2 style={s("margin:0 0 16px;font-family:'Bootzy',var(--font-grotesk);font-weight:400;font-size:44px;line-height:0.98")}>{current?.title}</h2>
            {current?.client || current?.year ? (
              <div style={s("display:flex;flex-wrap:wrap;gap:32px;margin:0 0 18px")}>
                {current?.client ? (
                  <div>
                    <div style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.5);margin-bottom:5px")}>Cliente</div>
                    <div style={s("font-size:16px;color:#f5f3ec")}>{current.client}</div>
                  </div>
                ) : null}
                {current?.year ? (
                  <div>
                    <div style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.5);margin-bottom:5px")}>Año</div>
                    <div style={s("font-size:16px;color:#f5f3ec")}>{current.year}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {(current?.disciplines ?? []).length > 0 ? (
              <div style={s("margin:0 0 20px")}>
                <div style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.5);margin-bottom:10px")}>Áreas</div>
                <div style={s("display:flex;flex-wrap:wrap;gap:9px")}>
                  {(current?.disciplines ?? []).map((dk) => (
                    <button
                      key={dk}
                      onClick={() => { setOpenIdx(-1); setDiscIdx(disciplines.findIndex((x) => x.key === dk)); }}
                      style={s("display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:9px 16px;border:1px solid rgba(245,243,236,0.24);border-radius:999px;background:none;color:#f5f3ec;font-family:var(--font-grotesk);font-size:14px;cursor:pointer")}
                    >
                      {disciplineTitle(dk, disciplines)}
                      <ArrowRight width={26} height={9} stroke="var(--stan-acid)" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <p style={s("font-size:18px;line-height:1.5;color:#f5f3ec;margin:0 0 18px;padding-bottom:18px;border-bottom:1px solid rgba(245,243,236,0.16)")}>{current?.lead}</p>
            <p style={s("font-size:17px;line-height:1.5;color:rgba(245,243,236,0.82);margin:0 0 28px")}>{current?.body}</p>

            <div style={s("font-family:var(--font-grotesk);font-weight:900;font-size:20px;letter-spacing:0.01em;text-transform:uppercase;color:var(--stan-acid);margin-bottom:18px")}>Lo que hicimos</div>
            <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:18px;padding-top:20px;border-top:1px solid rgba(245,243,236,0.16);margin-bottom:30px")}>
              {(current?.services ?? []).map((sv) => (
                <div key={sv.label} style={s("display:flex;flex-direction:column;gap:10px")}>
                  <img src={sv.icon} alt="" style={s("height:34px;width:auto;align-self:flex-start;display:block")} />
                  <span style={s("font-size:15px;line-height:1.3;color:rgba(245,243,236,0.85)")}>{sv.label}</span>
                </div>
              ))}
            </div>

            <div style={s("font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid);margin-bottom:14px")}>Stills del proyecto</div>
            <div style={s("display:flex;flex-direction:column;gap:12px;margin-bottom:8px")}>
              {[0, 1].map((i) => (
                <div key={i} style={s("border-radius:8px;overflow:hidden;aspect-ratio:16/9;background:#1a1a1a")} />
              ))}
            </div>

            {/* Otros casos destacados (rabbit-hole: manual o random, Adriano 22/07) */}
            {recCasos.length > 0 ? (
              <>
                <div style={s("display:flex;align-items:center;gap:14px;margin:30px 0 18px")}>
                  <div style={s("flex:1;height:1px;background:rgba(245,243,236,0.2)")} />
                  <div style={s("width:8px;height:8px;border-radius:999px;border:1px solid var(--stan-acid)")} />
                  <div style={s("flex:1;height:1px;background:rgba(245,243,236,0.2)")} />
                </div>
                <div style={s("text-align:center;font-family:var(--font-grotesk);font-weight:900;font-size:15px;letter-spacing:0.02em;text-transform:uppercase;color:var(--stan-acid);margin-bottom:16px")}>Otros casos destacados</div>
                <div style={s("display:flex;flex-direction:column;gap:14px")}>
                  {recCasos.map((rc) => {
                    const ci = casos.findIndex((x) => x.key === rc.key);
                    return (
                      <button
                        key={rc.key}
                        onClick={() => { setOpenIdx(ci); const sc = document.querySelector<HTMLElement>(".stanm"); if (sc) sc.scrollTop = 0; }}
                        style={s("display:block;width:100%;text-align:left;padding:0;border:none;background:none;cursor:pointer")}
                      >
                        <div style={s("position:relative;border-radius:14px;overflow:hidden;aspect-ratio:16/10;background:#1a1a1a")}>
                          {rc.cover ? (
                            <img src={rc.cover} alt={rc.title} style={s("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block")} />
                          ) : null}
                          <div style={s("position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,13,13,0) 44%,rgba(13,13,13,0.9) 100%)")} />
                          <div style={s("position:absolute;left:0;right:0;bottom:0;padding:16px")}>
                            <div style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid);margin-bottom:6px")}>{rc.tag}</div>
                            <h4 style={s("margin:0;font-family:var(--font-grotesk);font-weight:500;font-size:24px;line-height:1;text-transform:uppercase;color:#f5f3ec")}>{rc.title}</h4>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}

            {nextCaso ? (
              <button
                onClick={() => { setOpenIdx(nextIdx); const sc = document.querySelector<HTMLElement>(".stanm"); if (sc) sc.scrollTop = 0; }}
                style={s("width:100%;margin-top:24px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;background:#f5f3ec;color:#0d0d0d;border:none;border-radius:14px;cursor:pointer;text-align:left")}
              >
                <span style={s("display:flex;flex-direction:column;gap:4px")}>
                  <span style={s("font-weight:700;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(13,13,13,0.55)")}>
                    Siguiente proyecto{nextArea ? ` · ${nextArea}` : ""}
                  </span>
                  <span style={s("font-weight:500;font-size:16px;letter-spacing:0.04em;text-transform:uppercase;color:#0d0d0d")}>{nextCaso.title}</span>
                </span>
                <ArrowRight width={38} height={12} strokeWidth={2} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
