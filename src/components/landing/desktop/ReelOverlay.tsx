import { s } from "../style";
import { ArrowLeft, PlayCircle } from "../icons";
import { SITE } from "@/lib/landing-data";

/** Lightbox del "Reel 2026" — se abre desde el botón del Hero (feedback
 *  Adriano 20/07). Muestra el video del reel si hay `videoUrl`; si no,
 *  un placeholder oscuro (hasta que Stan pase el master/link). */
export function ReelOverlay({ onClose }: { onClose: () => void }) {
  const reel = SITE.reel;
  return (
    <div style={s("position:fixed;inset:0;z-index:80;background:rgba(6,6,6,0.95);color:#f5f3ec;overflow:auto;font-family:var(--font-grotesk);display:flex;flex-direction:column")}>
      <header style={s("display:flex;align-items:center;justify-content:space-between;gap:20px;padding:clamp(20px,2.6vw,36px) clamp(24px,5vw,64px)")}>
        <div onClick={onClose} style={s("display:inline-flex;align-items:center;gap:14px;cursor:pointer")}>
          <ArrowLeft width={26} height={12} stroke="#f5f3ec" />
          <span style={s("font-weight:700;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#f5f3ec")}>Cerrar</span>
        </div>
        <span style={s("font-weight:700;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:var(--stan-acid)")}>{reel.title}</span>
      </header>

      <div style={s("flex:1;display:flex;align-items:center;justify-content:center;padding:clamp(8px,2vw,32px) clamp(24px,5vw,64px) clamp(28px,4vw,64px)")}>
        <div style={s("width:100%;max-width:1200px;aspect-ratio:16/9;border-radius:clamp(10px,1.2vw,18px);overflow:hidden;background:#1a1a1a;position:relative")}>
          {reel.videoUrl ? (
            <video src={reel.videoUrl} controls autoPlay playsInline style={s("width:100%;height:100%;object-fit:cover;display:block")} />
          ) : (
            <div style={s("position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:rgba(245,243,236,0.6)")}>
              <PlayCircle width={64} height={64} stroke="rgba(245,243,236,0.7)" strokeWidth={1.1} />
              <span style={s("font-size:13px;letter-spacing:0.14em;text-transform:uppercase")}>Reel próximamente</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
