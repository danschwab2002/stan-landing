import { s } from "../style";
import { SITE } from "@/lib/landing-data";

const TRACK = s(
  "flex:none;display:inline-flex;align-items:center;gap:44px;padding-right:44px;font-family:var(--font-grotesk);font-weight:400;font-size:clamp(12px,1.05vw,15px);letter-spacing:0.14em;text-transform:uppercase",
);

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <span style={TRACK} aria-hidden={hidden || undefined}>
      {Array.from({ length: 8 }).flatMap((_, i) => [
        <span key={`t${i}`} style={{ flex: "none" }}>
          {SITE.marquee}
        </span>,
        <img
          key={`i${i}`}
          src="/assets/logos/iso-black.png"
          alt=""
          style={s("height:16px;width:auto;opacity:0.6;flex:none")}
        />,
      ])}
    </span>
  );
}

export function Marquee() {
  return (
    <div style={s("background:#f5f3ec;color:#0d0d0d;border-top:1px solid rgba(13,13,13,0.16);border-bottom:1px solid rgba(13,13,13,0.16);overflow:hidden;padding:1px 0;white-space:nowrap")}>
      <div style={s("display:inline-flex;min-width:max-content;animation:stan-mq-rev 52s linear infinite;will-change:transform")}>
        <Track />
        <Track hidden />
      </div>
    </div>
  );
}
