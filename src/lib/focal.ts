/**
 * Encuadre de una imagen: qué parte se ve y con cuánto zoom.
 *
 * EL PROBLEMA QUE RESUELVE
 * Todas las imágenes del sitio se muestran con `object-fit: cover`, así que el
 * navegador recorta al centro y decide solo. Si el sujeto de la foto no está en
 * el medio, se pierde — y no había forma de corregirlo desde el panel.
 *
 * POR QUÉ NO SE RECORTA LA IMAGEN AL SUBIRLA
 * Porque el mismo archivo se muestra en formas distintas según dónde aparezca.
 * La portada de un caso va en 3:4 en el celular, en 12:5 en el bloque de casos
 * del área, en 16:9 en los relacionados, y sin proporción fija en la tarjeta de
 * la home (ancho flex que además cambia al hacer hover). No existe UN recorte que
 * sirva para todos: cortarla a 3:4 dejaría el 12:5 peor que hoy, porque el
 * navegador le sacaría una franja a un vertical ya recortado.
 *
 * Guardar punto + zoom en vez de una imagen recortada es lo único que sobrevive a
 * eso: un solo ajuste de Adriano vale para todas las superficies a la vez.
 *
 * POR QUÉ VIAJA EN LA URL Y NO EN UNA COLUMNA
 * Los campos de imagen no siempre son columnas: `projects.gallery` y
 * `disciplines.detail` son JSON de strings. Meterle una propiedad a cada uno
 * obligaría a reestructurar el JSON y migrar los datos ya cargados en la SQLite
 * de producción. El fragmento de una URL (`#…`) no se manda al servidor y el
 * navegador lo ignora en el `src` de un `<img>`, así que el valor sigue siendo un
 * string opaco para todo el resto del sistema — incluidas las portadas que todavía
 * apuntan al CDN de Wix, que quedan encuadrables igual.
 *
 * El default es el centro, o sea exactamente lo que hace el sitio hoy: una imagen
 * sin encuadre guardado se ve igual que antes de que esto existiera.
 */

export type Focal = {
  /** Punto de interés horizontal, 0-100 (% del ancho de la imagen). */
  x: number;
  /** Punto de interés vertical, 0-100 (% del alto). */
  y: number;
  /** Acercamiento. 1 = la imagen entra justo en el marco. */
  z: number;
};

export const FOCAL_DEFAULT: Focal = { x: 50, y: 50, z: 1 };

/**
 * Tope de acercamiento. Más que esto empieza a pixelar: los archivos se guardan
 * con 2400px de ancho como máximo (ver `uploads.ts`) y el navegador tiene que
 * estirar lo que falte.
 *
 * No hay zoom hacia afuera. Con `object-fit: cover` la imagen ya está en su
 * tamaño mínimo cuando llena el marco; achicarla más dejaría franjas vacías.
 */
export const FOCAL_MAX_ZOOM = 3;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Redondeo corto, para que la URL guardada no se llene de decimales. */
const round = (v: number, decimales: number) => {
  const f = 10 ** decimales;
  return Math.round(v * f) / f;
};

export function isDefaultFocal(f: Focal): boolean {
  return f.x === FOCAL_DEFAULT.x && f.y === FOCAL_DEFAULT.y && f.z === FOCAL_DEFAULT.z;
}

/**
 * Separa una URL guardada en la imagen y su encuadre.
 *
 * Tolera cualquier basura en el fragmento: si no parsea, devuelve el centro. Un
 * encuadre roto tiene que degradar al comportamiento viejo, nunca romper la
 * página — el valor lo puede haber editado alguien a mano en el campo de texto.
 */
export function parseFocal(value: string | null | undefined): { src: string; focal: Focal } {
  const raw = (value ?? "").trim();
  if (!raw) return { src: "", focal: { ...FOCAL_DEFAULT } };

  const i = raw.lastIndexOf("#f=");
  if (i === -1) return { src: raw, focal: { ...FOCAL_DEFAULT } };

  const src = raw.slice(0, i);
  const partes = raw.slice(i + 3).split(",");
  const [x, y, z] = partes.map((p) => Number.parseFloat(p));

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return { src, focal: { ...FOCAL_DEFAULT } };
  }

  return {
    src,
    focal: {
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
      // El zoom es opcional: `#f=34,59` es un punto sin acercamiento.
      z: Number.isFinite(z) ? clamp(z, 1, FOCAL_MAX_ZOOM) : 1,
    },
  };
}

/**
 * Vuelve a pegar el encuadre a la URL. Si es el centro sin zoom no escribe nada:
 * una imagen que nadie tocó se guarda con la URL limpia, igual que siempre.
 */
export function withFocal(src: string, focal: Focal): string {
  const limpia = parseFocal(src).src;
  if (!limpia || isDefaultFocal(focal)) return limpia;

  const x = round(clamp(focal.x, 0, 100), 1);
  const y = round(clamp(focal.y, 0, 100), 1);
  const z = round(clamp(focal.z, 1, FOCAL_MAX_ZOOM), 2);

  return z === 1 ? `${limpia}#f=${x},${y}` : `${limpia}#f=${x},${y},${z}`;
}

/**
 * CSS del `<img>` para que respete el encuadre, en el formato de string que usa
 * el helper `s()` del landing.
 *
 * `object-position` elige qué parte del recorte se ve y `transform` acerca sobre
 * ese mismo punto — por eso `transform-origin` repite las coordenadas: sin eso el
 * zoom crecería desde el centro y se llevaría puesto el sujeto que se acaba de
 * elegir. Es agnóstico de la proporción del contenedor, que es justamente lo que
 * hace que un solo ajuste sirva para las siete superficies.
 */
export function focalCss(focal: Focal): string {
  const base = `width:100%;height:100%;object-fit:cover;object-position:${focal.x}% ${focal.y}%;display:block`;
  return focal.z === 1
    ? base
    : `${base};transform:scale(${focal.z});transform-origin:${focal.x}% ${focal.y}%`;
}
