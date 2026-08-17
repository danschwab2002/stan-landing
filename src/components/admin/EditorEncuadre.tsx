"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FOCAL_MAX_ZOOM, type Focal } from "@/lib/focal";
import type { Uso } from "@/lib/image-usos";

/**
 * Editor de encuadre: la ventana queda fija y la foto se mueve por debajo, como en
 * cualquier editor de foto de perfil. Se arrastra la imagen, se acerca con el dial,
 * y lo que queda dentro del marco es lo que se ve en el sitio.
 *
 * POR QUÉ HAY UN SELECTOR DE SUPERFICIE
 * Un editor de foto de perfil tiene un marco y listo. Acá la misma foto se muestra
 * en varias formas a la vez — una portada va en 3:4, en 12:5 y en 16:9 — así que el
 * marco cambia según qué superficie estés mirando, pero el ajuste que sale es UNO
 * SOLO y vale para todas. Se elige mirando la que más recorta.
 *
 * POR QUÉ LA IMAGEN SE POSICIONA A MANO Y NO CON `object-position`
 * Para que arrastrar mueva la foto exactamente los píxeles que se movió el mouse.
 * Las dos formas producen el mismo recorte (verificado sobre 1280 combinaciones de
 * marco, imagen, zoom y punto: difieren en 3e-13 px), pero el posicionamiento
 * directo da un arrastre 1:1 y el otro no. Al guardar se convierte de vuelta a
 * porcentaje + zoom, que es lo que el sitio sabe aplicar.
 *
 * Es solo para la compu: Adriano carga desde ahí. No hay gestos táctiles.
 */

const ESCENARIO = { w: 560, h: 400 };
/** Cuánto del escenario ocupa el marco. El resto es el aire que deja ver el afuera. */
const OCUPACION = 0.74;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function EditorEncuadre({
  src,
  focal,
  usos,
  onAplicar,
  onCerrar,
}: {
  src: string;
  focal: Focal;
  usos: Uso[];
  onAplicar: (f: Focal) => void;
  onCerrar: () => void;
}) {
  // Se trabaja sobre un borrador: si cierra sin aplicar, no pasó nada.
  const [borrador, setBorrador] = useState<Focal>(focal);
  const [usoActivo, setUsoActivo] = useState(0);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const gesto = useRef<{ px: number; py: number; left: number; top: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  const ratio = usos[usoActivo]?.ratio ?? 1;

  /** El marco más grande con esa proporción que entra en el escenario. */
  const marco = useMemo(() => {
    const w = Math.min(ESCENARIO.w * OCUPACION, ESCENARIO.h * OCUPACION * ratio);
    return { w, h: w / ratio };
  }, [ratio]);

  /**
   * Geometría de la foto dentro del marco. `sobra` es cuánto de la imagen queda
   * fuera en cada eje: es el recorrido disponible para arrastrar, y cuando es cero
   * ese eje no se puede mover (la foto entra justa).
   */
  const geo = useMemo(() => {
    if (!nat) return null;
    const base = Math.max(marco.w / nat.w, marco.h / nat.h) * borrador.z;
    const w = nat.w * base, h = nat.h * base;
    const sobraX = w - marco.w, sobraY = h - marco.h;
    return {
      w, h, sobraX, sobraY,
      left: -sobraX * borrador.x / 100,
      top: -sobraY * borrador.y / 100,
    };
  }, [nat, marco, borrador]);

  function arrastrar(e: React.PointerEvent) {
    if (!gesto.current || !geo) return;
    const g = gesto.current;
    const left = g.left + (e.clientX - g.px);
    const top = g.top + (e.clientY - g.py);
    setBorrador((b) => ({
      ...b,
      // Un eje sin recorrido (la foto entra justa) CONSERVA su valor en vez de
      // volver al centro: ese número puede venir de haberlo ajustado en otra
      // superficie, donde sí se recortaba. Pisarlo perdería ese trabajo.
      x: geo.sobraX > 0.5 ? clamp((-left / geo.sobraX) * 100, 0, 100) : b.x,
      y: geo.sobraY > 0.5 ? clamp((-top / geo.sobraY) * 100, 0, 100) : b.y,
    }));
  }

  const marcoLeft = (ESCENARIO.w - marco.w) / 2;
  const marcoTop = (ESCENARIO.h - marco.h) / 2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onPointerDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="max-h-full w-full max-w-4xl overflow-auto rounded-xl bg-[#faf9f5] shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-3.5">
          <h2 className="text-lg font-semibold text-[#16170f]">Editar imagen</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-2xl leading-none text-black/40 hover:text-[#16170f]"
          >
            ×
          </button>
        </div>

        <div className="flex flex-wrap gap-6 p-5">
          {/* ---------------- escenario ---------------- */}
          <div
            className="relative shrink-0 overflow-hidden rounded-lg bg-[#1a1a1a]"
            style={{ width: ESCENARIO.w, height: ESCENARIO.h }}
            onPointerMove={arrastrar}
            onPointerUp={() => (gesto.current = null)}
            onPointerLeave={() => (gesto.current = null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              draggable={false}
              onLoad={(e) =>
                setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
              }
              onPointerDown={(e) => {
                if (!geo) return;
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                gesto.current = { px: e.clientX, py: e.clientY, left: geo.left, top: geo.top };
              }}
              className="absolute max-w-none cursor-grab select-none active:cursor-grabbing"
              style={
                geo
                  ? {
                      width: geo.w,
                      height: geo.h,
                      left: marcoLeft + geo.left,
                      top: marcoTop + geo.top,
                    }
                  : { opacity: 0 }
              }
            />

            {/* Oscurece todo menos el marco, de una: una sombra enorme hacia afuera. */}
            <div
              className="pointer-events-none absolute rounded-[2px] ring-2 ring-white/90"
              style={{
                left: marcoLeft,
                top: marcoTop,
                width: marco.w,
                height: marco.h,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
              }}
            />
          </div>

          {/* ---------------- controles ---------------- */}
          <div className="flex min-w-56 flex-1 flex-col gap-5">
            {usos.length > 1 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-black/55">
                  Dónde se ve
                </p>
                <div className="flex flex-col gap-1.5">
                  {usos.map((u, i) => (
                    <button
                      key={u.label}
                      type="button"
                      onClick={() => setUsoActivo(i)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        i === usoActivo
                          ? "border-[#16170f] bg-[#16170f] font-semibold text-[#faf9f5]"
                          : "border-black/15 bg-white hover:border-black/40"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-black/40">
                  El encuadre es uno solo y vale para las {usos.length}. Elegí mirando la que
                  más recorta.
                </p>
              </div>
            )}

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-black/55">
                  Zoom
                </span>
                <span className="text-xs tabular-nums text-black/45">
                  {borrador.z.toFixed(2)}×
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={FOCAL_MAX_ZOOM}
                step={0.01}
                value={borrador.z}
                onChange={(e) => setBorrador((b) => ({ ...b, z: Number(e.target.value) }))}
                className="w-full accent-[#16170f]"
              />
            </div>

            <div>
              <p className="text-xs text-black/45">Arrastrá la foto para mover el encuadre.</p>
              <button
                type="button"
                onClick={() => setBorrador({ x: 50, y: 50, z: 1 })}
                className="mt-2 text-xs font-semibold text-black/45 hover:text-[#16170f]"
              >
                Volver al centro
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-black/10 px-5 py-3.5">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold hover:border-[#16170f]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onAplicar(borrador)}
            className="rounded-lg bg-[#16170f] px-4 py-2 text-sm font-semibold text-[#faf9f5] hover:opacity-90"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
