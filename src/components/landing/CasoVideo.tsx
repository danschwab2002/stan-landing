"use client";

import { useState } from "react";
import { PlayCircle } from "./icons";
import { s } from "./style";
import { Img } from "./Img";
import { parseFocal } from "@/lib/focal";

/**
 * El video de un caso: portada con CTA de play, y al clickear, reproducción.
 *
 * Lo comparten el detalle del caso en desktop y el de mobile — la misma pieza en
 * las dos superficies, así el comportamiento no puede divergir entre una y otra.
 *
 * TRES REGLAS QUE VIENEN DE LA REVISIÓN DEL 03/08
 *
 *  1. NUNCA arranca solo. Adriano fue explícito con la analogía de la página que
 *     te arranca la música sola. El `autoPlay` de acá abajo corre DESPUÉS del
 *     click, que es una intención declarada, y no al abrir el caso.
 *  2. El CTA va grande y centrado, con animación. El rótulo "Ver video" chiquito
 *     de la esquina no se leía como algo clickeable.
 *  3. Sin video no hay play. Un botón que no lleva a nada es peor que la portada
 *     sola — es justo lo que motivó el campo "Proyecto relacionado" de ese día.
 */

type Embed = { kind: "file"; src: string } | { kind: "iframe"; src: string };

/**
 * Decide cómo reproducir lo que haya en el campo.
 *
 * Desde el 03/08 los videos se hostean acá y llegan como `/uploads/…`, pero el
 * campo sigue aceptando una URL externa. Si un link de YouTube pegado a mano no
 * reprodujera, estaríamos repitiendo el bug que este trabajo vino a arreglar: un
 * campo que se guarda bien y no se muestra nunca.
 */
export function videoEmbed(url: string): Embed {
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/.exec(url);
  if (yt) {
    // `rel=0` no apaga las sugerencias del final —ya no se puede—, pero al menos
    // las restringe al mismo canal en vez de mandar al visitante a cualquier lado.
    return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0&playsinline=1` };
  }

  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
  if (vimeo) {
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  }

  return { kind: "file", src: url };
}

export function CasoVideo({
  cover,
  video,
  title,
  /** CSS extra del contenedor: cada superficie trae su forma (aspecto, radio). */
  frame,
  /** Diámetro del botón. Mobile lo achica. */
  buttonSize = "clamp(64px,5.4vw,92px)",
}: {
  cover?: string;
  video?: string;
  title: string;
  frame: string;
  buttonSize?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing && video) {
    const embed = videoEmbed(video);
    return (
      <div style={s(`${frame};background:#000`)}>
        {embed.kind === "iframe" ? (
          <iframe
            src={embed.src}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={s("position:absolute;inset:0;width:100%;height:100%;border:0;display:block")}
          />
        ) : (
          <video
            src={embed.src}
            poster={parseFocal(cover).src || undefined}
            controls
            autoPlay
            playsInline
            style={s("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;background:#000")}
          />
        )}
      </div>
    );
  }

  return (
    <div style={s(frame)}>
      {cover ? (
        <Img value={cover} alt={title} extra="position:absolute;inset:0" />
      ) : null}

      {video ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir el video de ${title}`}
          style={s(
            "position:absolute;inset:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:none;border:0;padding:0;cursor:pointer;color:#f5f3ec"
          )}
        >
          {/* Dos capas a proposito: el disco de vidrio respira (`.stan-play-glass`)
              y el icono queda quieto encima. Con el icono adentro del elemento que
              escala, crecia y se achicaba con el — se lee como un zoom, no como una
              respiracion. El anillo amarillo que hubo aca se saco (Dan, 03/08). */}
          <span
            className="stan-play"
            style={s(
              `position:relative;display:inline-flex;align-items:center;justify-content:center;width:${buttonSize};height:${buttonSize}`
            )}
          >
            {/* El vidrio va INLINE y no en la clase: el procesador de CSS
                (Lightning, via Tailwind v4) descarta `backdrop-filter` de la hoja
                de estilos — verificado leyendo la regla ya servida al navegador.
                En la clase queda solo la animacion, que si sobrevive. */}
            {/* El `box-shadow` es el brillo del borde, y son dos capas: el `inset`
                dibuja un filo de un pixel —el canto del vidrio— y el de afuera lo
                derrama apenas sobre la foto. Van con opacidad muy baja a proposito:
                se tiene que notar que el disco tiene borde, sin que se lea como un
                resplandor (Dan, 03/08). */}
            <span
              className="stan-play-glass"
              style={s(
                "position:absolute;inset:0;border-radius:999px;background:rgba(13,13,13,0.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);box-shadow:inset 0 0 0 1px rgba(245,243,236,0.16), 0 0 10px rgba(245,243,236,0.13)"
              )}
            />
            <PlayCircle width={34} height={34} stroke="var(--stan-acid)" strokeWidth={1.4} style={s("position:relative")} />
          </span>
          <span
            style={s(
              "font-weight:700;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;text-shadow:0 1px 10px rgba(0,0,0,0.6)"
            )}
          >
            Ver video
          </span>
        </button>
      ) : null}
    </div>
  );
}
