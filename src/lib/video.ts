import { execFile } from "node:child_process";
import { access, constants } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

/**
 * Procesamiento de los videos de los casos — wrapper flaco sobre ffmpeg/ffprobe.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * Los videos se hostean acá (decisión 03/08: nada de Vimeo/YouTube). Servir tal
 * cual lo que suba el cliente tiene dos fallas que no se ven en desarrollo:
 *
 *  1. Un master de edición pesa cientos de MB y no está pensado para la web. El
 *     visitante se lo baja entero.
 *  2. Un MP4 guarda su índice (el `moov atom`) al final salvo que se lo pida
 *     explícitamente. Con el índice al final el navegador NO puede empezar a
 *     reproducir hasta terminar de descargar: la barra queda girando aunque el
 *     servidor esté respondiendo perfecto. `+movflags faststart` lo mueve al
 *     principio, y es lo único que hace falta cuando el archivo ya es web-ready.
 *
 * LA ESTRATEGIA: REMUX ANTES QUE RECODIFICAR
 * Un export para web de cualquier editor ya sale H.264 + AAC en MP4. Recodificar
 * eso sería tirar calidad y minutos de CPU para llegar al mismo lado. Entonces se
 * sondea primero y se elige:
 *
 *  - ya es web-ready  → `-c copy` + faststart: copia de streams, segundos incluso
 *                       en archivos grandes, cero pérdida de calidad.
 *  - no lo es         → transcodifica a H.264/AAC 1080p.
 *
 * SI FFMPEG NO ESTÁ
 * El archivo se guarda tal cual y se avisa. Preferimos un video subido que quizá
 * tarde en arrancar antes que una subida rechazada — pero el aviso viaja hasta la
 * respuesta del endpoint para que no sea un fallo silencioso.
 */

/** Alto máximo que se guarda. Arriba de 1080p el peso se dispara y no se nota. */
const MAX_HEIGHT = 1080;

/** Techo de bitrate que se acepta sin recodificar (bits por segundo). */
const MAX_BITRATE = 12_000_000;

/** Códecs de audio que el navegador reproduce sin recodificar. */
const OK_AUDIO = new Set(["aac", "mp3"]);

/** Corta un ffmpeg colgado en vez de dejar el request abierto para siempre. */
const FFMPEG_TIMEOUT_MS = 15 * 60 * 1000;

export type VideoInfo = {
  videoCodec: string;
  audioCodec: string | null;
  width: number;
  height: number;
  durationSec: number;
  bitrate: number;
};

export type VideoProcessResult =
  /** Se copiaron los streams y se movió el índice al principio. */
  | { action: "remux" }
  /** Se recodificó a H.264/AAC. */
  | { action: "transcode"; reason: string }
  /** No había ffmpeg: el archivo quedó tal cual. */
  | { action: "passthrough"; warning: string };

/**
 * Ubica los binarios: primero `FFMPEG_PATH`, después el `ffmpeg` del sistema.
 *
 * La env var es la vía de escape si el contenedor no trae ffmpeg en el PATH — por
 * ejemplo apuntando al binario que instala el paquete `ffmpeg-static`, que es el
 * plan B si el build no lo provee. Se resuelve sin tocar este archivo.
 *
 * El resultado se cachea: son llamadas a disco y esto corre en cada subida.
 */
let binCache: { ffmpeg: string; ffprobe: string } | null | undefined;

async function isExecutable(p: string): Promise<boolean> {
  try {
    await access(p, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export async function resolveBinaries(): Promise<{ ffmpeg: string; ffprobe: string } | null> {
  if (binCache !== undefined) return binCache;

  const fromEnv = process.env.FFMPEG_PATH;
  if (fromEnv && (await isExecutable(fromEnv))) {
    const dir = path.dirname(fromEnv);
    const probe = path.join(dir, "ffprobe");
    binCache = { ffmpeg: fromEnv, ffprobe: (await isExecutable(probe)) ? probe : "ffprobe" };
    return binCache;
  }

  try {
    await run("ffmpeg", ["-version"], { timeout: 10_000 });
    binCache = { ffmpeg: "ffmpeg", ffprobe: "ffprobe" };
    return binCache;
  } catch {
    binCache = null;
    return null;
  }
}

/** Solo para los tests: olvida los binarios detectados. */
export function resetBinaryCache(): void {
  binCache = undefined;
}

/**
 * Lee los metadatos del archivo. Devuelve null si ffprobe no puede parsearlo, que
 * es también nuestra validación de "esto es un video de verdad": igual que sharp
 * con las imágenes, la prueba son los bytes y no el content-type que declara el
 * browser, que un cliente puede mentir.
 */
export async function probeVideo(file: string): Promise<VideoInfo | null> {
  const bins = await resolveBinaries();
  if (!bins) return null;

  let raw: string;
  try {
    const { stdout } = await run(
      bins.ffprobe,
      ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file],
      { timeout: 60_000, maxBuffer: 8 * 1024 * 1024 }
    );
    raw = stdout;
  } catch {
    return null;
  }

  type Stream = {
    codec_type?: string;
    codec_name?: string;
    width?: number;
    height?: number;
  };
  let parsed: { streams?: Stream[]; format?: { duration?: string; bit_rate?: string } };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const streams = parsed.streams ?? [];
  const video = streams.find((s) => s.codec_type === "video");
  if (!video?.codec_name) return null;

  const audio = streams.find((s) => s.codec_type === "audio");

  return {
    videoCodec: video.codec_name,
    audioCodec: audio?.codec_name ?? null,
    width: video.width ?? 0,
    height: video.height ?? 0,
    durationSec: Number(parsed.format?.duration ?? 0) || 0,
    bitrate: Number(parsed.format?.bit_rate ?? 0) || 0,
  };
}

/**
 * ¿Hay que recodificar, o alcanza con mover el índice? Devuelve el motivo cuando
 * hace falta recodificar — viaja al log para poder explicar después por qué una
 * subida tardó tres minutos en vez de tres segundos.
 */
export function transcodeReason(info: VideoInfo): string | null {
  if (info.videoCodec !== "h264") return `el video viene en ${info.videoCodec}`;
  if (info.audioCodec && !OK_AUDIO.has(info.audioCodec)) {
    return `el audio viene en ${info.audioCodec}`;
  }
  if (info.height > MAX_HEIGHT) return `el video es de ${info.height}p`;
  if (info.bitrate > MAX_BITRATE) {
    return `el bitrate es de ${Math.round(info.bitrate / 1_000_000)} Mbps`;
  }
  return null;
}

/**
 * Deja `output` listo para servir desde `input`. No toca el archivo de entrada:
 * el llamador se encarga de borrar el temporal.
 */
export async function processVideo(
  input: string,
  output: string
): Promise<VideoProcessResult> {
  const bins = await resolveBinaries();
  if (!bins) {
    const { copyFile } = await import("node:fs/promises");
    await copyFile(input, output);
    return {
      action: "passthrough",
      warning:
        "El video se guardó sin optimizar porque falta ffmpeg en el servidor. " +
        "Puede tardar en empezar a reproducirse.",
    };
  }

  const info = await probeVideo(input);
  if (!info) throw new Error("El archivo no es un video válido (probá con MP4 o MOV).");

  const reason = transcodeReason(info);

  if (!reason) {
    await run(
      bins.ffmpeg,
      ["-y", "-i", input, "-c", "copy", "-movflags", "+faststart", output],
      { timeout: FFMPEG_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 }
    );
    return { action: "remux" };
  }

  await run(
    bins.ffmpeg,
    [
      "-y",
      "-i", input,
      "-c:v", "libx264",
      // `veryfast` sobre `medium`: en un VPS chico la diferencia de peso es
      // marginal y la de tiempo es de minutos. El cliente está esperando.
      "-preset", "veryfast",
      "-crf", "23",
      // -2 mantiene el aspecto y fuerza alto par, que libx264 necesita.
      "-vf", `scale=-2:'min(${MAX_HEIGHT},ih)'`,
      // Sin esto, un fuente 10-bit sale en un pix_fmt que Safari no decodifica.
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      output,
    ],
    { timeout: FFMPEG_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 }
  );

  return { action: "transcode", reason };
}
