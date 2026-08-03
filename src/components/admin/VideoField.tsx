"use client";

import { useRef, useState } from "react";

const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#16170f]";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-black/55";

type Uploaded = {
  url: string;
  bytes: number;
  originalBytes: number;
  action: "remux" | "transcode" | "passthrough";
  warning?: string;
};

function mb(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

/**
 * Campo de video de un caso: subir el archivo desde la compu **o** pegar una URL.
 *
 * Hermano de `ImageField`, con tres diferencias que salen del peso del archivo:
 *
 *  1. SUBE CON XHR, NO CON FETCH. `fetch` no reporta progreso de subida, y un
 *     archivo de cientos de MB sin barra parece un panel colgado. Es la única
 *     razón por la que acá hay XHR en un código que en todos lados usa fetch.
 *  2. MANDA EL ARCHIVO COMO BODY CRUDO. El endpoint lo streamea a disco; un
 *     multipart lo juntaría entero en la RAM del servidor.
 *  3. TIENE UN SEGUNDO ESTADO DE ESPERA. Cuando la barra llega al 100% el trabajo
 *     recién empieza: ffmpeg está procesando del otro lado. Sin avisarlo, el
 *     silencio después del 100% se lee como que se colgó.
 */
export function VideoField({
  name,
  label,
  defaultValue = "",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [pct, setPct] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Uploaded | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const busy = pct !== null || processing;

  function upload(file: File) {
    setError("");
    setSaved(null);
    setPct(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload/video");
    // El nombre no puede viajar crudo en un header: un acento o un espacio lo rompen.
    xhr.setRequestHeader("x-file-name", encodeURIComponent(file.name));
    xhr.setRequestHeader("Content-Type", "application/octet-stream");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100));
    };

    // Terminó de subir: ahora manda ffmpeg y esto puede tardar bastante más.
    xhr.upload.onload = () => {
      setPct(null);
      setProcessing(true);
    };

    xhr.onload = () => {
      setPct(null);
      setProcessing(false);
      if (fileRef.current) fileRef.current.value = "";

      if (xhr.status === 401) {
        setError("Se cerró la sesión. Recargá la página y volvé a entrar.");
        return;
      }
      let data: Uploaded & { error?: string };
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        setError("El servidor no devolvió una respuesta válida. Probá de nuevo.");
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        setError(data?.error ?? "No se pudo subir el video.");
        return;
      }
      setValue(data.url);
      setSaved(data);
    };

    xhr.onerror = () => {
      setPct(null);
      setProcessing(false);
      if (fileRef.current) fileRef.current.value = "";
      setError("Se cortó la conexión durante la subida. Probá de nuevo.");
    };

    xhr.send(file);
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
          placeholder="Subí un video o pegá una URL"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="shrink-0 rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-[#16170f] disabled:opacity-50"
        >
          {pct !== null ? `Subiendo ${pct}%` : processing ? "Procesando…" : "Subir video"}
        </button>
        {value && !busy && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setSaved(null);
              setError("");
            }}
            className="shrink-0 text-sm font-semibold text-black/45 hover:text-[#16170f]"
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
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      {pct !== null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[#16170f] transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {processing && (
        <p className="mt-2 text-xs text-black/45">
          El video ya subió. Ahora se está preparando para la web — puede tardar unos minutos si
          es largo. No cierres esta pantalla.
        </p>
      )}

      {hint && !busy && <p className="mt-1 text-xs text-black/40">{hint}</p>}

      {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}

      {saved && (
        <p className="mt-2 text-xs text-black/45">
          Listo — {mb(saved.bytes)}
          {saved.originalBytes > saved.bytes * 1.1 && ` (bajó de ${mb(saved.originalBytes)})`}.
          Acordate de guardar el formulario.
        </p>
      )}

      {saved?.warning && <p className="mt-2 text-xs font-semibold text-amber-700">{saved.warning}</p>}

      {value ? (
        <video
          src={value}
          controls
          preload="metadata"
          className="mt-2 aspect-video w-72 rounded-lg bg-black"
          onError={() => setError("No se puede reproducir eso. Revisá la URL.")}
        />
      ) : null}
    </div>
  );
}
