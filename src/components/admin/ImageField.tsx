"use client";

import { useRef, useState } from "react";
import { EditorEncuadre } from "@/components/admin/EditorEncuadre";
import { FOCAL_DEFAULT, parseFocal, withFocal, type Focal } from "@/lib/focal";
import type { Uso } from "@/lib/image-usos";

const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#16170f]";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/55";

type Uploaded = { url: string; width: number; height: number; bytes: number; originalBytes: number };

function kb(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

/**
 * Campo de imagen del CMS: subir un archivo desde la compu **o** pegar una URL.
 *
 * Las dos vías conviven a propósito. La subida es la que se usa de acá en adelante;
 * pegar la URL sigue habilitado porque las 13 portadas de la carga inicial apuntan
 * al CDN de Wix y no hay por qué re-subirlas.
 *
 * El valor real viaja en un input oculto: el form sigue siendo un form nativo con
 * Server Action, sin estado compartido con el resto de los campos.
 *
 * Si el campo declara `usos`, aparece además el selector de encuadre: la imagen se
 * guarda entera y el recorte se decide acá (ver `lib/focal.ts`). Los campos que no
 * lo declaran — los íconos, que se muestran completos y sin recortar — siguen
 * funcionando exactamente como antes.
 */
export function ImageField({
  name,
  label,
  defaultValue = "",
  hint,
  usos,
  previewClass = "mt-2 aspect-[16/11] w-56 rounded-lg object-cover",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  usos?: Uso[];
  previewClass?: string;
}) {
  const inicial = parseFocal(defaultValue);
  // La URL y su encuadre se manejan por separado y se vuelven a unir recién al
  // guardar: así el campo de texto muestra una dirección limpia, sin el `#f=…`.
  const [value, setValue] = useState(inicial.src);
  const [focal, setFocal] = useState<Focal>(inicial.focal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Uploaded | null>(null);
  const [editando, setEditando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError("");
    setSaved(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });

      if (res.status === 401) throw new Error("Se cerró la sesión. Recargá la página y volvé a entrar.");

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No se pudo subir la imagen.");

      setValue(data.url);
      // Foto nueva, encuadre nuevo: el de la anterior no tiene por qué servirle.
      setFocal({ ...FOCAL_DEFAULT });
      setSaved(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
      // Limpia el input para que elegir el MISMO archivo otra vez vuelva a disparar onChange.
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className={labelCls}>{label}</label>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            // Pegar otra dirección es cambiar de imagen: el encuadre vuelve al centro.
            setValue(parseFocal(e.target.value).src);
            setFocal({ ...FOCAL_DEFAULT });
          }}
          className={`${inputCls} min-w-0 flex-1`}
          placeholder="Subí una imagen o pegá una URL"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="shrink-0 rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-[#16170f] disabled:opacity-50"
        >
          {busy ? "Subiendo…" : "Subir imagen"}
        </button>
        {value && usos?.length ? (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="shrink-0 rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-[#16170f]"
          >
            Editar imagen
          </button>
        ) : null}
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setFocal({ ...FOCAL_DEFAULT });
              setSaved(null);
              setError("");
            }}
            disabled={busy}
            className="shrink-0 text-sm font-semibold text-black/45 hover:text-[#16170f] disabled:opacity-50"
          >
            Quitar
          </button>
        )}
      </div>

      {/* El valor que realmente lee la Server Action: la dirección con su encuadre pegado. */}
      <input type="hidden" name={name} value={withFocal(value, focal)} />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      {hint && <p className="mt-1 text-xs text-black/40">{hint}</p>}

      {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}

      {saved && (
        <p className="mt-2 text-xs text-black/45">
          Listo — {saved.width}×{saved.height}px, {kb(saved.bytes)}
          {saved.originalBytes > saved.bytes * 1.1 && ` (bajó de ${kb(saved.originalBytes)})`}. Acordate de
          guardar el formulario.
        </p>
      )}

      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Vista previa"
          className={previewClass}
          style={{
            objectPosition: `${focal.x}% ${focal.y}%`,
            transform: focal.z === 1 ? undefined : `scale(${focal.z})`,
            transformOrigin: `${focal.x}% ${focal.y}%`,
          }}
          onError={() => setError("No se puede mostrar esa imagen. Revisá la URL.")}
        />
      ) : null}

      {editando && value && usos?.length ? (
        <EditorEncuadre
          src={value}
          focal={focal}
          usos={usos}
          onAplicar={(f) => {
            setFocal(f);
            setEditando(false);
          }}
          onCerrar={() => setEditando(false)}
        />
      ) : null}
    </div>
  );
}
