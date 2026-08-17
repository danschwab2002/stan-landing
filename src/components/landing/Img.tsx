import { s } from "./style";
import { focalCss, parseFocal } from "@/lib/focal";

/**
 * Imagen del sitio que respeta el encuadre elegido en el panel.
 *
 * Todas las fotos del landing se muestran recortadas al contenedor, y hasta ahora
 * el navegador recortaba siempre al centro. El valor guardado puede traer pegado
 * el punto de interés y el acercamiento (ver `lib/focal.ts`); acá se separan y se
 * traducen a CSS.
 *
 * Si el valor no trae encuadre — todo lo cargado antes de que esto existiera, y las
 * portadas que siguen en el CDN de Wix — el resultado es centrado y sin acercamiento,
 * o sea idéntico a como se veía antes. Nada se mueve solo.
 *
 * Devuelve `null` cuando no hay imagen: los contenedores ya tienen su fondo gris de
 * placeholder, y así los llamadores se ahorran el `{x ? … : null}`.
 */
export function Img({
  value,
  alt = "",
  extra,
  loading,
}: {
  /** La URL tal cual está guardada, con o sin encuadre. */
  value?: string | null;
  alt?: string;
  /** CSS propio de la superficie (posicionamiento, sobre todo). */
  extra?: string;
  loading?: "lazy" | "eager";
}) {
  const { src, focal } = parseFocal(value);
  if (!src) return null;
  const css = extra ? `${extra};${focalCss(focal)}` : focalCss(focal);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={loading} style={s(css)} />;
}
