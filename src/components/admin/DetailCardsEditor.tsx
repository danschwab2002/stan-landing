"use client";

import { useState } from "react";
import { ImageField } from "@/components/admin/ImageField";

const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#16170f]";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/55";

export type DetailCard = { title: string; desc: string; image?: string };

/** Fila con identidad local estable: React necesita una `key` que sobreviva al
 *  reordenamiento, si no el estado interno de cada `ImageField` sigue a la
 *  posición en vez de a su tarjeta y las imágenes se cruzan al mover una fila. */
type Row = DetailCard & { uid: number };

/**
 * Editor de las tarjetas del detalle de un área — el bloque que se ve al abrir
 * "Ver área" en la landing.
 *
 * Reemplaza al textarea con sintaxis «Título :: descripción», que funcionaba pero
 * era indescubrible para el cliente y se rompía con un separador mal tipeado.
 *
 * **Cómo viajan los datos:** cada tarjeta emite tres campos con el MISMO nombre
 * (`detailTitle` / `detailImage` / `detailDesc`); la Server Action los lee con
 * `getAll()` y los cruza por índice. Los tres arrays quedan alineados porque el
 * orden del DOM es el orden de las tarjetas y una tarjeta sin imagen igual emite
 * su campo vacío. Así el form sigue siendo nativo, sin serializar JSON a mano.
 */
export function DetailCardsEditor({ initial }: { initial: DetailCard[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((c, i) => ({ ...c, uid: i }))
  );
  const [nextUid, setNextUid] = useState(initial.length);

  function add() {
    setRows((r) => [...r, { title: "", desc: "", image: "", uid: nextUid }]);
    setNextUid((n) => n + 1);
  }

  function remove(uid: number) {
    setRows((r) => r.filter((x) => x.uid !== uid));
  }

  function move(uid: number, dir: -1 | 1) {
    setRows((r) => {
      const i = r.findIndex((x) => x.uid === uid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= r.length) return r;
      const copy = [...r];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  return (
    <div className="grid gap-4">
      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-black/15 px-4 py-6 text-center text-sm text-black/45">
          Esta área todavía no tiene tarjetas. Sin tarjetas y sin casos asociados, el área no
          muestra el botón “Ver área” en la landing.
        </p>
      )}

      {rows.map((row, i) => (
        <fieldset key={row.uid} className="rounded-lg border border-black/12 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold text-black/45">
              Tarjeta {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(row.uid, -1)}
                disabled={i === 0}
                aria-label="Subir la tarjeta"
                className="rounded border border-black/12 px-2 py-1 text-xs font-semibold transition-colors hover:border-[#16170f] disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(row.uid, 1)}
                disabled={i === rows.length - 1}
                aria-label="Bajar la tarjeta"
                className="rounded border border-black/12 px-2 py-1 text-xs font-semibold transition-colors hover:border-[#16170f] disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(row.uid)}
                className="ml-2 text-xs font-semibold text-red-700/80 hover:text-red-700"
              >
                Quitar
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className={labelCls}>Título</label>
              <input
                name="detailTitle"
                defaultValue={row.title}
                className={inputCls}
                placeholder="Campañas"
              />
            </div>

            <ImageField
              name="detailImage"
              label="Imagen"
              defaultValue={row.image ?? ""}
              hint="Opcional. Si la dejás vacía, la tarjeta muestra el recuadro gris."
              previewClass="mt-2 aspect-[4/3] w-44 rounded-lg object-cover"
            />

            <div>
              <label className={labelCls}>Descripción</label>
              <textarea
                name="detailDesc"
                rows={2}
                defaultValue={row.desc}
                className={inputCls}
                placeholder="Diseñamos campañas de contenido a medida para cada marca."
              />
            </div>
          </div>
        </fieldset>
      ))}

      <div>
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-[#16170f]"
        >
          + Agregar tarjeta
        </button>
      </div>
    </div>
  );
}
