/**
 * Contenido de la landing, extraído fiel del handoff de Claude Design
 * (Stan Landing.dc.html + Stan Landing Mobile.dc.html, 18/07).
 *
 * Hoy es la fuente de verdad del frontend (para que se vea idéntico al
 * diseño). Cuando se recablee el CMS, estos objetos pasan a salir de la
 * base de datos — por eso el shape ya está pensado como modelo editable.
 */

/** `key` es el identificador estable que se guarda en `projects.services`; el
 *  label y el icono pueden cambiar sin migrar dato. */
export type ServiceTag = { key: string; icon: string; label: string };

export type Caso = {
  key: string;
  tag: string;
  /** Título en mayúsculas (detalle) */
  title: string;
  /** Líneas del título para la card (respeta los saltos del diseño) */
  titleLines: string[];
  /** Imagen de portada; si falta, va placeholder oscuro (como el diseño) */
  cover?: string;
  /** Cliente / marca del proyecto (feedback Adriano 20/07) */
  client?: string;
  /** Año del proyecto (feedback Adriano 20/07) */
  year?: number;
  /** Áreas ("Qué hacemos") con las que se vincula — keys de DISCIPLINES.
   *  Base de la navegación cruzada casos↔disciplinas y del "caso relacionado". */
  disciplines?: string[];
  lead: string;
  body: string;
  /** "Lo que hicimos" */
  services: ServiceTag[];
  /** Keys de los casos recomendados al pie ("Otros proyectos", rabbit-hole).
   *  Manual desde el CMS o, si no hay asignados, un set al azar (Adriano 22/07). */
  recommended?: string[];
  /** Video del producto final (Vimeo/YouTube/storage). Vive en la DB desde
   *  siempre; se expone al landing para el banner de casos de la subpágina de
   *  área (BB Factor 29/07). Vacío = el banner va con la portada y sin play. */
  video?: string;
  /** Stills del proyecto — las fotos que se muestran al abrir el caso, además
   *  de la portada. Se cargan desde el CMS (subida directa). Vacío = el bloque
   *  de stills no se muestra (antes eran 3 recuadros grises hardcodeados). */
  gallery?: string[];
};

/**
 * Una tarjeta del detalle de un área (el bloque que se abre al clickear "Ver área").
 * `image` es opcional a propósito: las tarjetas cargadas antes de que el campo
 * existiera se siguen leyendo igual y caen al recuadro gris, sin migrar nada.
 */
/**
 * Tarjeta de sub-servicio dentro de la subpágina de un área (Content → Campañas,
 * Social Content, …). `projectSlug` es el "Proyecto relacionado" que se elige desde
 * el panel (Adriano 03/08): al clickear la tarjeta se abre ESE caso.
 *
 * Se guarda el **slug** y no el id para que el JSON de `detail` se pueda leer y
 * auditar a ojo. El precio es que renombrar el slug de un proyecto corta el vínculo
 * — por eso el render valida que el slug exista antes de hacer la tarjeta
 * clickeable: un slug muerto degrada a tarjeta estática, no a un click que no abre nada.
 */
export type DisciplineDetailItem = { title: string; desc: string; image?: string; projectSlug?: string };

export type Discipline = {
  key: string;
  title: string;
  icon: string;
  /** Imagen grande del área (recuadro de "Qué hacemos"). Vacío = placeholder. */
  image?: string;
  desc: string;
  items: string[];
  /** Detalle para el overlay (solo Content lo trae en el diseño) */
  detail?: DisciplineDetailItem[];
};

/**
 * "Lo que hicimos" — roles/tareas ejecutados en el proyecto (dirección, producción,
 * filmación, post). Es un dato POR CASO, distinto de las Áreas ("Qué hacemos" =
 * líneas de servicio de la productora): un caso puede pertenecer al área Content y
 * aun así no haber tenido dirección creativa.
 *
 * **Esto es solo la semilla.** El catálogo vivo vive en la tabla `services` y se
 * edita desde el panel (`/admin/servicios`): sumar un ícono no puede depender de un
 * deploy, porque después de la entrega Dan ya no está. Estos 4 se insertan con
 * `INSERT OR IGNORE` en el primer arranque y nunca vuelven a pisar lo que haya.
 */
export const SERVICE_SEED: ServiceTag[] = [
  { key: "direccion", icon: "/assets/imagery/ic-direccion.png", label: "Dirección creativa" },
  { key: "produccion", icon: "/assets/imagery/ic-produccion.png", label: "Producción" },
  { key: "filmacion", icon: "/assets/imagery/ic-filmacion.png", label: "Filmación" },
  { key: "postproduccion", icon: "/assets/imagery/ic-postproduccion.png", label: "Postproducción" },
];

/**
 * Resuelve las keys guardadas en un proyecto contra el catálogo vivo.
 *
 * - Sin keys → **todo el catálogo**: un caso que nadie tocó se sigue viendo como
 *   antes de que la columna existiera.
 * - Una key que ya no está en el catálogo se ignora en silencio: borrar un servicio
 *   desde el panel no rompe los casos que lo tenían tildado.
 * - El orden sale del catálogo, no del guardado, para que el bloque se vea igual
 *   en todos los casos.
 */
export function servicesFromKeys(
  keys: string[] | undefined,
  catalog: ServiceTag[]
): ServiceTag[] {
  if (!keys || keys.length === 0) return catalog;
  return catalog.filter((s) => keys.includes(s.key));
}

// NOTA: `client`, `year` y `disciplines` son datos SEED provisorios (feedback
// Adriano 20/07). Se reemplazan cuando Adriano cargue sus proyectos reales
// desde el panel / migremos del Wix. Los años están marcados a confirmar.
export const CASOS: Caso[] = [
  {
    key: "le-coq",
    tag: "Deportes",
    title: "LE COQ SPORTIF",
    titleLines: ["Le Coq", "Sportif"],
    cover: "/assets/imagery/lecoq-jersey.png",
    client: "Le Coq Sportif",
    year: 2024, // TODO: confirmar con Adriano
    disciplines: ["content", "production"],
    lead: "Video lanzamiento de la Selección Argentina de Voley.",
    body: "Una pieza audiovisual concebida para transmitir identidad, energía y espíritu de equipo a través de una narrativa visual de alto impacto.",
    services: SERVICE_SEED,
  },
  {
    key: "chandon",
    tag: "Bebidas",
    title: "CHANDON",
    titleLines: ["Chandon"],
    client: "Chandon",
    year: 2024, // TODO: confirmar con Adriano
    disciplines: ["production", "content"],
    lead: "Ideas que cobraron vida. Proyectos que generaron impacto.",
    body: "Dirección, producción y postproducción de una pieza pensada para conectar con la audiencia y construir marca.",
    services: SERVICE_SEED,
  },
  {
    key: "galicia-polo",
    tag: "Deportes",
    title: "GALICIA POLO",
    titleLines: ["Galicia", "Polo"],
    client: "Banco Galicia",
    year: 2023, // TODO: confirmar con Adriano
    disciplines: ["content"],
    lead: "Ideas que cobraron vida. Proyectos que generaron impacto.",
    body: "Dirección, producción y postproducción de una pieza pensada para conectar con la audiencia y construir marca.",
    services: SERVICE_SEED,
  },
  {
    key: "converse",
    tag: "Moda",
    title: "CONVERSE",
    titleLines: ["Converse"],
    client: "Converse",
    year: 2023, // TODO: confirmar con Adriano
    disciplines: ["content"],
    lead: "Ideas que cobraron vida. Proyectos que generaron impacto.",
    body: "Dirección, producción y postproducción de una pieza pensada para conectar con la audiencia y construir marca.",
    services: SERVICE_SEED,
  },
];

/* ————————————————————————————————————————————————————————————————
 * Helpers PUROS de navegación cruzada (G11). Toman los arrays como parámetro
 * — antes leían los consts estáticos; ahora la data llega de la base y estos
 * helpers operan sobre lo que reciban (DB o seed).
 * ———————————————————————————————————————————————————————————————— */

/** Lookup de área/disciplina por key → título legible. */
export const disciplineTitle = (key: string, disciplines: Discipline[]): string =>
  disciplines.find((d) => d.key === key)?.title ?? key;

/** Casos que pertenecen a un área/disciplina — "abrí un área → ves sus casos". */
export function casosByDiscipline(key: string, casos: Caso[], limit?: number): Caso[] {
  const found = casos.filter((c) => (c.disciplines ?? []).includes(key));
  return limit === undefined ? found : found.slice(0, limit);
}

/** Cuántos casos destacados muestra la subpágina de un área. Bianca (BB Factor,
 *  29/07): "ahí ponemos como barridas de dos o tres casos destacados". El tope
 *  aplica solo al render — `casosByDiscipline` sin `limit` sigue devolviendo
 *  todos, que es lo que necesita el cálculo de "el área es clickeable". */
export const MAX_CASOS_AREA = 3;

/** Caso relacionado para el rabbit-hole: el siguiente caso que comparte al
 *  menos un área; si ninguno comparte, el siguiente en orden. */
export function relatedCaso(caso: Caso, casos: Caso[]): Caso {
  const rest = casos.filter((c) => c.key !== caso.key);
  const shared = rest.find((c) =>
    (c.disciplines ?? []).some((d) => (caso.disciplines ?? []).includes(d))
  );
  if (shared) return shared;
  const idx = casos.findIndex((c) => c.key === caso.key);
  return casos[(idx + 1) % casos.length];
}

export const DISCIPLINES: Discipline[] = [
  {
    key: "content",
    title: "Content",
    icon: "/assets/imagery/ic-content.png",
    desc: "Creamos sistemas de contenido pensados para generar impacto y consistencia.",
    items: ["Campañas", "Social Content", "Branded Content", "Fotografía"],
    detail: [
      { title: "Campañas", desc: "Diseñamos campañas de contenido a medida para lanzamientos, temporadas o momentos clave de marca." },
      { title: "Social content", desc: "Producimos contenido nativo para redes sociales que conecta, informa y construye comunidad." },
      { title: "Branded content", desc: "Creamos contenidos que cuentan historias de marca con profundidad, autenticidad y propósito." },
      { title: "Fotografía", desc: "Capturamos imágenes que comunican la esencia de tu marca con estética, intención y calidad." },
    ],
  },
  {
    key: "streaming",
    title: "Streaming",
    icon: "/assets/imagery/ic-streaming.png",
    desc: "Diseñamos experiencias en vivo para conectar con audiencias en tiempo real.",
    items: ["Estudios", "Programas", "Eventos en vivo", "Cobertura"],
  },
  {
    key: "podcast",
    title: "Podcast",
    icon: "/assets/imagery/ic-podcast.png",
    desc: "Creamos formatos que transforman conversaciones en activos de marca.",
    items: ["Producción", "Dirección", "Distribución"],
  },
  {
    key: "experiences",
    title: "Experiences",
    icon: "/assets/imagery/ic-experiences.png",
    desc: "Convertimos espacios físicos en experiencias memorables.",
    items: ["Eventos", "Activaciones", "Lanzamientos"],
  },
  {
    key: "production",
    title: "Production",
    icon: "/assets/imagery/ic-production.png",
    desc: "Desde la idea hasta la entrega final.",
    items: ["Filmación", "Postproducción", "Dirección creativa"],
  },
];

/** Copy + datos estáticos del sitio (candidatos a editables en el CMS). */
export const SITE = {
  nav: [
    { label: "Work", href: "#work" },
    { label: "Vision", href: "#hero" },
    { label: "Manifesto", href: "#manifesto" },
    { label: "Contact", href: "#contact" },
  ],
  tagline: ["Creative production house", "Buenos Aires — Worldwide"],
  marquee: "We stand for the vision",
  hero: {
    lines: ["Ideas grandes.", "Ideas complejas.", "Ideas imposibles."],
  },
  work: {
    n: "01.",
    title: "Qué hacemos",
    lead: "Transformamos ideas en experiencias, contenidos y producciones que generan impacto.",
  },
  casos: {
    n: "02.",
    title: ["Casos", "destacados"],
    lead: "Ideas que cobraron vida. Proyectos que generaron impacto.",
  },
  manifesto: {
    n: "03.",
    label: "Nuestro manifiesto",
    ring: "WE STAND FOR THE VISION · Creemos que una buena idea merece existir. · Que el talento sin ejecución es potencial desperdiciado. · Que las marcas más memorables son las que se animan a construir algo diferente. · Y que las mejores historias todavía no fueron producidas. · Que la creatividad no sirve si no genera movimiento. · ",
  },
  /** Reel del año — abre desde el botón "Ver Reel 2026" del Hero (feedback Adriano 20/07).
   *  videoUrl vacío hasta que Stan pase el master/link del reel. */
  reel: {
    title: "Reel 2026",
    videoUrl: "",
  },
  contact: {
    title: ["Let’s build", "something"],
    lead: "Contanos tu idea. Nosotros la llevamos a otro nivel.",
    email: "info@stancontenidos.com",
    instagram: "@standforthevision",
    phone: "+54 11 1234 5678",
    // Accesos directos pedidos por Adriano (20/07). Placeholders a confirmar:
    // - whatsapp: número real de Stan (wa.me sin "+" ni espacios)
    // - calendly: URL del calendario (se abre en popup); editable desde el CMS
    whatsapp: "5491112345678", // TODO: número real de Stan
    calendly: "", // TODO: URL de Calendly a definir con Adriano (semilla del CMS)
    // Imagen del recuadro de la sección Contacto ("Let's build something").
    // HARDCODED a propósito (no editable desde el CMS). Vacío → placeholder gris.
    image: "/assets/imagery/contacto-build.webp", // definitiva, la pasó Adriano el 28/07
    location: "Buenos Aires, Argentina",
  },
  footer: {
    left: "© Stan Productora — Buenos Aires · Worldwide",
    right: "We STAN® for the vision",
  },
} as const;
