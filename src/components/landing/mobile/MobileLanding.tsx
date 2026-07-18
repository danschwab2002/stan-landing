"use client";

import { useRef, useState } from "react";
import { s } from "../style";
import { ArrowRight, ChevronDown, PlayCircle, Close } from "../icons";
import { CASOS, DISCIPLINES, SITE } from "@/lib/landing-data";

type SectionKey = "hero" | "work" | "casos" | "manifesto" | "contact";

export function MobileLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState(-1);
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
  const current = CASOS[sheetOpen ? openIdx : lastIdx.current];

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
          <img src="/assets/imagery/hero-home.png" alt="" style={s("width:100%;height:100%;object-fit:cover;object-position:72% center;display:block")} />
        </div>
        <div style={s("position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg, rgba(13,13,13,0.72) 0%, rgba(13,13,13,0.28) 26%, rgba(13,13,13,0.28) 52%, rgba(13,13,13,0.86) 84%, rgba(13,13,13,0.98) 100%)")} />

        <div style={s("position:absolute;top:56px;left:50%;transform:translateX(-50%);z-index:7;pointer-events:none")}>
          <img src="/assets/imagery/hero-tag.png" alt="We STAN for the vision" style={s("display:block;width:248px;height:auto;transform-origin:50% 0;animation:stan-sway 7s var(--ease-inout) infinite;filter:drop-shadow(0 18px 26px rgba(0,0,0,0.55))")} />
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
          <a onClick={() => go("work")} style={s("display:inline-flex;align-items:center;gap:14px;min-height:44px;text-decoration:none;font-weight:500;font-size:16px;letter-spacing:0.12em;text-transform:uppercase;color:#f5f3ec;cursor:pointer")}>
            Ver proyectos
            <ArrowRight width={56} height={11} />
          </a>
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
          {DISCIPLINES.map((d) => (
            <div key={d.key} style={s("display:flex;flex-direction:column")}>
              <img src={d.icon} alt="" style={s("display:block;height:30px;width:auto;align-self:flex-start;margin-bottom:14px")} />
              <h3 style={s("font-family:var(--font-grotesk);font-weight:900;font-size:26px;letter-spacing:-0.01em;line-height:1;margin:0 0 16px;color:var(--stan-acid)")}>{d.title}</h3>
              <div style={s("aspect-ratio:16/10;border-radius:10px;overflow:hidden;background:#1a1a1a;margin-bottom:18px")} />
              <p style={s("font-size:17px;line-height:1.5;color:rgba(245,243,236,0.84);margin:0")}>{d.desc}</p>
              <ul style={s("list-style:none;margin:20px 0 0;padding:16px 0 0;border-top:1px solid rgba(245,243,236,0.16);display:flex;flex-direction:column;gap:11px")}>
                {d.items.map((it) => (
                  <li key={it} style={s("font-size:16px;color:rgba(245,243,236,0.72)")}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 02 · CASOS DESTACADOS (carrusel) */}
      <section ref={casosRef} style={s("background:#0d0d0d;padding:44px 22px 40px")}>
        <div style={s("display:flex;gap:12px;align-items:baseline;margin-bottom:14px")}>
          <span style={s("font-weight:700;font-size:13px;color:var(--stan-acid)")}>{SITE.casos.n}</span>
          <h2 style={s("font-weight:500;font-size:38px;line-height:0.95;text-transform:uppercase;margin:0")}>Casos<br />destacados</h2>
        </div>
        <p style={s("font-size:17px;line-height:1.42;font-weight:700;margin:0 0 34px;color:#f5f3ec")}>{SITE.casos.lead}</p>

        <div className="hscroll" style={s("display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -22px;padding:0 22px 4px")}>
          {CASOS.map((c, i) => (
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
        <div style={s("border-radius:20px;overflow:hidden;aspect-ratio:4/5;background:#1a1a1a;margin-bottom:28px")} />
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
            { label: "Email", value: SITE.contact.email, href: `mailto:${SITE.contact.email}` },
            { label: "Instagram", value: SITE.contact.instagram, href: "#" },
            { label: "Teléfono", value: SITE.contact.phone },
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
            <h2 style={s("margin:0 0 20px;font-family:'Bootzy',var(--font-grotesk);font-weight:400;font-size:44px;line-height:0.98")}>{current?.title}</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
}
