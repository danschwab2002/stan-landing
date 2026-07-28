"use client";

import { useRef, useState } from "react";

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
 */
export function ImageField({
  name,
  label,
  defaultValue = "",
  hint,
  previewClass = "mt-2 aspect-[16/11] w-56 rounded-lg object-cover",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  previewClass?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Uploaded | null>(null);
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
          onChange={(e) => setValue(e.target.value)}
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
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
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

      {/* El valor que realmente lee la Server Action. */}
      <input type="hidden" name={name} value={value} />

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
          onError={() => setError("No se puede mostrar esa imagen. Revisá la URL.")}
        />
      ) : null}
    </div>
  );
}
