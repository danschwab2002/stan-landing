"use client";

import { useState } from "react";
import { ImageField } from "@/components/admin/ImageField";
import { USO_GALERIA } from "@/lib/image-usos";

/** Fila con identidad local estable: sin una `key` que sobreviva al reordenamiento,
 *  el estado interno de cada `ImageField` sigue a la posición en vez de a su imagen
 *  y las fotos se cruzan al mover una fila (mismo criterio que `DetailCardsEditor`). */
type Row = { url: string; uid: number };

/**
 * Editor de los stills de un proyecto — las fotos que se ven al abrir el caso,
 * debajo de la ficha técnica.
 *
 * Hasta ahora ese bloque eran tres recuadros grises hardcodeados en el render:
 * no existía el campo, así que no había forma de cargarlos desde el CMS. Cada fila
 * emite un `galleryImage`; la Server Action los lee con `getAll()` en el orden del
 * DOM, que es el orden en que se muestran. Sin serializar JSON a mano en el cliente:
 * el form sigue siendo nativo con Server Action.
 */
export function GalleryEditor({ initial }: { initial: string[] }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((url, i) => ({ url, uid: i })));
  const [nextUid, setNextUid] = useState(initial.length);

  function add() {
    setRows((r) => [...r, { url: "", uid: nextUid }]);
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
          Este caso todavía no tiene stills. Sin stills, el bloque no se muestra al abrir el
          proyecto (la portada y el video no se ven afectados).
        </p>
      )}

      {rows.map((row, i) => (
        <fieldset key={row.uid} className="rounded-lg border border-black/12 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold text-black/45">
              Still {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(row.uid, -1)}
                disabled={i === 0}
                aria-label="Subir el still"
                className="rounded border border-black/12 px-2 py-1 text-xs font-semibold transition-colors hover:border-[#16170f] disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(row.uid, 1)}
                disabled={i === rows.length - 1}
                aria-label="Bajar el still"
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

          <ImageField
            name="galleryImage"
            label="Imagen"
            defaultValue={row.url}
            usos={USO_GALERIA}
            hint="Horizontal, se recorta a 16:9."
            previewClass="mt-2 aspect-[16/9] w-56 rounded-lg object-cover"
          />
        </fieldset>
      ))}

      <div>
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-[#16170f]"
        >
          + Agregar still
        </button>
      </div>
    </div>
  );
}
