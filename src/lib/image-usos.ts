/**
 * Dónde se muestra cada imagen, y con qué proporción.
 *
 * Es la única fuente de verdad de las proporciones del sitio. Antes el dato estaba
 * escrito tres veces sin relación entre sí — en el CSS del landing, en la clase de
 * la vista previa del panel y en el texto de ayuda de cada campo — así que un
 * cambio de diseño dejaba mintiendo a los otros dos. Con el encuadre eso pasó de
 * ser un detalle cosmético a un problema real: si el panel le muestra a Adriano un
 * marco que no es el que usa la página, encuadra contra algo que no existe.
 *
 * Cada campo declara TODAS las superficies donde aparece, no una. Ese es el punto:
 * la misma foto se ve en varias formas a la vez, y el encuadre se elige mirando el
 * conjunto. Si mañana cambia una proporción en el landing, se cambia acá.
 */

export type Uso = {
  /** Cómo se le nombra a Adriano. Tiene que decirle DÓNDE lo va a ver. */
  label: string;
  /** ancho / alto */
  ratio: number;
};

/**
 * Portada de un caso — el campo con más superficies del sitio.
 *
 * En la compu, la tarjeta de la home y el encabezado del detalle no tienen
 * proporción fija (son alto fijo con ancho elástico, y la tarjeta además se
 * ensancha al pasarle el mouse). No se pueden previsualizar con un número, así que
 * se muestran las tres que sí son fijas: son las que más recortan y donde el
 * encuadre se nota.
 */
export const USO_PORTADA_CASO: Uso[] = [
  { label: "Tarjeta del caso", ratio: 3 / 4 },
  { label: "Casos del área", ratio: 12 / 5 },
  { label: "Relacionados", ratio: 16 / 9 },
];

/** Imagen grande del área, en el recuadro de "Qué hacemos". */
export const USO_IMAGEN_AREA: Uso[] = [
  { label: "PC", ratio: 16 / 11 },
  { label: "Celular", ratio: 16 / 10 },
];

/** Tarjetas de detalle dentro de la página de un área. */
export const USO_TARJETA_DETALLE: Uso[] = [
  { label: "PC", ratio: 4 / 3 },
  { label: "Celular", ratio: 16 / 10 },
];

/** Stills de la galería del caso. La única superficie que es igual en los dos. */
export const USO_GALERIA: Uso[] = [{ label: "Galería del caso", ratio: 16 / 9 }];
