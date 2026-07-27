import { s } from "../style";
import { ArrowRight } from "../icons";
import { CalendlyButton } from "../calendly";
import { SITE } from "@/lib/landing-data";

const FIELD_LABEL = "font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.55);margin-bottom:10px";
const FIELD_VALUE = "font-size:clamp(14px,1.1vw,17px);color:#f5f3ec;text-decoration:none";
const FIELD_BOX = "padding-top:14px;border-top:1px solid rgba(245,243,236,0.16)";

export function Contacto({ whatsappUrl, calendlyUrl }: { whatsappUrl: string; calendlyUrl: string }) {
  const c = SITE.contact;
  return (
    <>
      <section id="contact" style={s("position:relative;background:#0d0d0d;color:#f5f3ec;min-height:100svh;overflow:hidden;padding:clamp(44px,5vw,80px) clamp(24px,5vw,72px);display:flex;flex-direction:column;justify-content:center")}>
        <div style={s("max-width:1500px;margin:0 auto;width:100%")}>
          <div style={s("display:grid;grid-template-columns:minmax(260px,0.85fr) 1.5fr;gap:clamp(20px,2.6vw,52px);align-items:center")}>
            {/* Imagen de marca (hardcoded, no editable desde el CMS). Vacía →
                placeholder gris hasta que llegue la definitiva de Adriano. */}
            {c.image ? (
              <div style={s("border-radius:clamp(16px,2vw,30px);overflow:hidden;aspect-ratio:4/5")}>
                <img src={c.image} alt="" style={s("width:100%;height:100%;object-fit:cover;display:block")} />
              </div>
            ) : (
              <div style={s("border-radius:clamp(16px,2vw,30px);overflow:hidden;aspect-ratio:4/5;background:#1a1a1a")} />
            )}

            <div style={s("position:relative")}>
              <div style={s("display:flex;flex-wrap:wrap;align-items:flex-start;gap:clamp(18px,2.4vw,44px)")}>
                <h2 style={s("margin:0 0 0 clamp(-48px,-5vw,-12px);font-family:Bootzy;font-weight:400;font-size:clamp(46px,8vw,140px);line-height:0.84;letter-spacing:0.04em;color:var(--stan-acid);text-transform:uppercase")}>
                  {c.title[0]}
                  <br />
                  {c.title[1]}
                </h2>
                <div style={s("display:flex;flex-direction:column;gap:clamp(14px,1.6vw,22px);margin-top:clamp(6px,1vw,16px)")}>
                  <p style={s("max-width:210px;font-size:clamp(14px,1.15vw,18px);line-height:1.34;font-weight:700;color:#f5f3ec")}>
                    Contanos tu idea. Nosotros{" "}
                    <span style={s("font-style:italic;text-decoration:underline;text-underline-offset:3px")}>la llevamos a otro nivel.</span>
                  </p>
                  {/* CTA principal de agendamiento: abre Calendly en popup flotante. */}
                  <CalendlyButton
                    url={calendlyUrl}
                    style={s("display:inline-flex;align-items:center;gap:12px;align-self:flex-start;background:var(--stan-acid);color:#0d0d0d;padding:clamp(12px,1.1vw,16px) clamp(20px,1.8vw,30px);border-radius:999px;font-weight:900;font-size:clamp(13px,1vw,15px);letter-spacing:0.06em;text-transform:uppercase;text-decoration:none")}
                  >
                    Agendá una llamada
                    <ArrowRight width={40} height={11} strokeWidth={2} />
                  </CalendlyButton>
                </div>
              </div>

              {/* Puntos de contacto: solo WhatsApp (Adriano, 22/07); el agendamiento
                  es el botón de Calendly de arriba. Instagram + Ubicación quedan
                  como contexto de marca, no como vías de contacto. */}
              <div style={s("margin-top:clamp(28px,4vw,66px);display:grid;grid-template-columns:1fr 1fr;gap:clamp(18px,2.2vw,42px);max-width:660px")}>
                <div style={s(FIELD_BOX)}>
                  <div style={s(FIELD_LABEL)}>WhatsApp</div>
                  <a href={whatsappUrl || "#"} target="_blank" rel="noopener noreferrer" style={s(FIELD_VALUE)}>Escribinos</a>
                </div>
                <div style={s(FIELD_BOX)}>
                  <div style={s(FIELD_LABEL)}>Instagram</div>
                  <a href="#" style={s(FIELD_VALUE)}>{c.instagram}</a>
                </div>
                <div style={s(FIELD_BOX)}>
                  <div style={s(FIELD_LABEL)}>Ubicación</div>
                  <span style={s(FIELD_VALUE)}>{c.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={s("max-width:1500px;margin:clamp(30px,4vw,56px) auto 0;width:100%;display:flex;align-items:flex-end;justify-content:space-between;gap:20px")}>
          <div style={s("display:flex;align-items:center;gap:10px")}>
            <img src="/assets/logos/iso-acid.png" alt="STAN iso" style={s("display:block;width:26px;height:auto;flex:none")} />
            <div style={s("font-weight:700;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;line-height:1.7;color:rgba(245,243,236,0.66)")}>
              {SITE.tagline[0]}
              <br />
              {SITE.tagline[1]}
            </div>
          </div>
          <a href="#hero" style={s("color:rgba(245,243,236,0.9)")}>
            <ArrowRight width={70} height={14} />
          </a>
        </div>
      </section>

      {/* Footer bar */}
      <div style={s("background:#0d0d0d;color:#f5f3ec;border-top:1px solid rgba(245,243,236,0.16);padding:16px clamp(24px,5vw,72px);display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between")}>
        <span style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.5)")}>{SITE.footer.left}</span>
        <span style={s("font-weight:700;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,243,236,0.5)")}>{SITE.footer.right}</span>
      </div>
    </>
  );
}
