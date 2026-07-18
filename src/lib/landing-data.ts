/**
 * Contenido de la landing, extraído fiel del handoff de Claude Design
 * (Stan Landing.dc.html + Stan Landing Mobile.dc.html, 18/07).
 *
 * Hoy es la fuente de verdad del frontend (para que se vea idéntico al
 * diseño). Cuando se recablee el CMS, estos objetos pasan a salir de la
 * base de datos — por eso el shape ya está pensado como modelo editable.
 */

export type ServiceTag = { icon: string; label: string };

export type Caso = {
  key: string;
  tag: string;
  /** Título en mayúsculas (detalle) */
  title: string;
  /** Líneas del título para la card (respeta los saltos del diseño) */
  titleLines: string[];
  /** Imagen de portada; si falta, va placeholder oscuro (como el diseño) */
  cover?: string;
  lead: string;
  body: string;
  /** "Lo que hicimos" */
  services: ServiceTag[];
};

export type DisciplineDetailItem = { title: string; desc: string };

export type Discipline = {
  key: string;
  title: string;
  icon: string;
  desc: string;
  items: string[];
  /** Detalle para el overlay (solo Content lo trae en el diseño) */
  detail?: DisciplineDetailItem[];
};

/** "Lo que hicimos" — común a los casos en el diseño */
const DEFAULT_SERVICES: ServiceTag[] = [
  { icon: "/assets/imagery/ic-direccion.png", label: "Dirección creativa" },
  { icon: "/assets/imagery/ic-produccion.png", label: "Producción" },
  { icon: "/assets/imagery/ic-filmacion.png", label: "Filmación" },
  { icon: "/assets/imagery/ic-postproduccion.png", label: "Postproducción" },
];

export const CASOS: Caso[] = [
  {
    key: "le-coq",
    tag: "Deportes",
    title: "LE COQ SPORTIF",
    titleLines: ["Le Coq", "Sportif"],
    cover: "/assets/imagery/lecoq-jersey.png",
    lead: "Video lanzamiento de la Selección Argentina de Voley.",
    body: "Una pieza audiovisual concebida para transmitir identidad, energía y espíritu de equipo a través de una narrativa visual de alto impacto.",
    services: DEFAULT_SERVICES,
  },
  {
    key: "chandon",
    tag: "Bebidas",
    title: "CHANDON",
    titleLines: ["Chandon"],
    lead: "Ideas que cobraron vida. Proyectos que generaron impacto.",
    body: "Dirección, producción y postproducción de una pieza pensada para conectar con la audiencia y construir marca.",
    services: DEFAULT_SERVICES,
  },
  {
    key: "galicia-polo",
    tag: "Deportes",
    title: "GALICIA POLO",
    titleLines: ["Galicia", "Polo"],
    lead: "Ideas que cobraron vida. Proyectos que generaron impacto.",
    body: "Dirección, producción y postproducción de una pieza pensada para conectar con la audiencia y construir marca.",
    services: DEFAULT_SERVICES,
  },
  {
    key: "converse",
    tag: "Moda",
    title: "CONVERSE",
    titleLines: ["Converse"],
    lead: "Ideas que cobraron vida. Proyectos que generaron impacto.",
    body: "Dirección, producción y postproducción de una pieza pensada para conectar con la audiencia y construir marca.",
    services: DEFAULT_SERVICES,
  },
];

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
  contact: {
    title: ["Let’s build", "something"],
    lead: "Contanos tu idea. Nosotros la llevamos a otro nivel.",
    email: "hola@standforthevision.com",
    instagram: "@standforthevision",
    phone: "+54 11 1234 5678",
    location: "Buenos Aires, Argentina",
  },
  footer: {
    left: "© Stan Productora — Buenos Aires · Worldwide",
    right: "We STAN® for the vision",
  },
} as const;
