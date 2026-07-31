import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "STAN — Ayuda del panel",
};

/**
 * Manual de uso del CMS, adentro del propio CMS.
 *
 * Decisión (Dan, 31/07): la documentación vive acá y no en una carpeta de Drive.
 * El manual se lee donde se usa, no se pierde, y se actualiza junto con el panel
 * en el mismo deploy — si mañana cambia un campo, cambia su explicación.
 *
 * **Es una página estática a propósito**, no un módulo editable: nadie tiene que
 * mantener el manual desde el panel, y no hay una tabla más que migrar. Para
 * corregir un texto se edita este archivo y el push redeploya solo.
 *
 * **Los accesos NO van acá.** Usuario, contraseña, servidor y dominio viajan en el
 * documento de entrega aparte: si se pierde la contraseña, esta página queda del
 * lado de adentro de la puerta cerrada.
 */

/**
 * Videos del manual. Se llenan cuando estén grabados; mientras la clave esté
 * vacía o comentada, la sección simplemente no muestra ningún recuadro (nada de
 * placeholders "próximamente", que envejecen mal).
 *
 * Pegá el link tal cual lo copiás de Loom, YouTube o Vimeo — `embedUrl()` lo
 * convierte. Ojo: si es de YouTube tiene que estar en "No listado" o "Público";
 * un video privado no se ve embebido.
 */
const VIDEOS: Record<string, string> = {
  // casos: "https://www.loom.com/share/xxxxxxxxxxxx",
  // areas: "https://www.loom.com/share/xxxxxxxxxxxx",
  // imagenes: "https://www.loom.com/share/xxxxxxxxxxxx",
  // contacto: "https://www.loom.com/share/xxxxxxxxxxxx",
};

/** Pasa un link de Loom / YouTube / Vimeo a su URL embebible. Si no reconoce el
 *  formato devuelve el original: un link ya embebible sigue funcionando. */
function embedUrl(url: string): string {
  const loom = url.match(/loom\.com\/share\/([\w-]+)/);
  if (loom) return `https://www.loom.com/embed/${loom[1]}`;

  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return url;
}

function VideoSlot({ id }: { id: string }) {
  const url = VIDEOS[id];
  if (!url) return null;
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-black/10 bg-black">
      <iframe
        src={embedUrl(url)}
        title="Video explicativo"
        allow="fullscreen"
        allowFullScreen
        className="aspect-video w-full"
      />
    </div>
  );
}

function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 rounded-xl border border-black/10 bg-[#faf9f5] p-6">
      <div className="mb-4 flex items-baseline gap-2.5">
        <span className="font-mono text-xs text-black/40">{n}</span>
        <h2 className="font-display text-xl font-black tracking-[0.07em]">{title}</h2>
      </div>
      <div className="grid gap-3 text-sm leading-relaxed text-black/75">{children}</div>
      <VideoSlot id={id} />
    </section>
  );
}

/** Bloque destacado para lo que, si se pasa por alto, hace perder media hora. */
function Ojo({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border-l-[3px] border-[#16170f] bg-black/[0.04] px-4 py-3 text-sm">
      {children}
    </p>
  );
}

function Pasos({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="grid gap-2.5">
      {items.map((item, i) => (
        // El índice alcanza como key: la lista es fija y no se reordena ni filtra.
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16170f] font-mono text-[10px] font-bold text-[#f5f3ec]">
            {i + 1}
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ol>
  );
}

const INDICE = [
  { id: "mapa", label: "Cómo funciona el panel" },
  { id: "casos", label: "Cargar un caso" },
  { id: "donde", label: "Dónde aparece cada caso" },
  { id: "areas", label: "Las áreas" },
  { id: "imagenes", label: "Imágenes" },
  { id: "videos", label: "Videos" },
  { id: "contacto", label: "Contacto" },
  { id: "problemas", label: "Si algo no se ve" },
];

export default function AyudaPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black tracking-[0.07em]">Ayuda</h1>
        <p className="mt-1 text-sm text-black/50">
          Cómo cargar y publicar el contenido del sitio. Escrito para tenerlo al lado
          mientras trabajás.
        </p>
      </header>

      <nav className="mb-8 rounded-xl border border-black/10 bg-white p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-black/45">
          En esta página
        </p>
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {INDICE.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm font-medium text-black/70 transition-colors hover:text-[#16170f] hover:underline"
              >
                <span className="font-mono text-xs text-black/35">
                  {String(i + 1).padStart(2, "0")}
                </span>{" "}
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-5">
        <Section id="mapa" n="01" title="Cómo funciona el panel">
          <p>
            El panel administra tres cosas, y son las tres del menú de la izquierda:
          </p>
          <ul className="grid list-disc gap-2 pl-5 marker:text-black/30">
            <li>
              <strong>Proyectos</strong> — cada trabajo que mostrás: la tarjeta, la ficha
              con las fotos, el video y los créditos.
            </li>
            <li>
              <strong>Áreas</strong> — los cuatro bloques de “Qué hacemos”, con su
              descripción y su página propia.
            </li>
            <li>
              <strong>Contacto</strong> — el link de WhatsApp y el de Calendly que usan los
              botones del sitio.
            </li>
          </ul>
          <p>
            Lo que guardás se ve en el sitio enseguida: no hay que publicar, aprobar ni
            avisarle a nadie. Refrescás la página y ya está.
          </p>
          <Ojo>
            Un proyecto recién cargado <strong>no se ve hasta que lo marcás como
            Publicado</strong>. Es a propósito: podés dejar cosas a medio cargar sin que
            aparezcan en el sitio.
          </Ojo>
        </Section>

        <Section id="casos" n="02" title="Cargar un caso">
          <Pasos
            items={[
              <>
                Andá a{" "}
                <Link href="/admin/proyectos" className="font-semibold underline">
                  Proyectos
                </Link>{" "}
                y tocá <strong>+ Nuevo proyecto</strong>.
              </>,
              <>
                <strong>Identidad y contenido.</strong> Lo único obligatorio es el título.
                La <em>descripción corta</em> es la que se lee en la tarjeta; la{" "}
                <em>larga</em>, adentro de la ficha del caso. En{" "}
                <em>créditos</em> va el equipo, todo en un renglón.
              </>,
              <>
                <strong>Portada.</strong> Es la foto de la tarjeta y del encabezado.{" "}
                <strong>Vertical</strong>: se recorta a 3:4, así que si subís una
                apaisada le va a cortar los costados.
              </>,
              <>
                <strong>Video.</strong> Se pega el link de Vimeo o YouTube. Los videos no
                se suben al panel.
              </>,
              <>
                <strong>Áreas.</strong> Tildá a cuál o cuáles pertenece. Esto es lo que
                hace que el caso aparezca dentro de la página de esa área —{" "}
                <a href="#donde" className="font-semibold underline">
                  ver abajo
                </a>
                .
              </>,
              <>
                <strong>Publicación.</strong> Tildá <strong>Publicado</strong> y, si querés
                que además salga en la portada del sitio, <strong>Destacado</strong>.
              </>,
              <>
                <strong>Guardar</strong>, y listo. Abrí el sitio y fijate cómo quedó.
              </>,
            ]}
          />
          <p className="text-black/55">
            Los otros campos (slug, casos recomendados, orden) se pueden dejar como vienen:
            el sistema los completa solo con valores razonables.
          </p>
        </Section>

        <Section id="donde" n="03" title="Dónde aparece cada caso">
          <p>Hay dos casillas y cada una hace una cosa distinta:</p>
          <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-black/40">
                  <th className="px-4 py-2.5 font-medium">Si el caso está…</th>
                  <th className="px-4 py-2.5 font-medium">Se ve en…</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black/5">
                  <td className="px-4 py-3 text-black/50">Sin publicar</td>
                  <td className="px-4 py-3 text-black/50">
                    En ningún lado. Existe solo acá adentro.
                  </td>
                </tr>
                <tr className="border-b border-black/5">
                  <td className="px-4 py-3 font-medium">Publicado</td>
                  <td className="px-4 py-3">
                    La página de cada área que le hayas tildado.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Publicado + Destacado</td>
                  <td className="px-4 py-3">
                    Lo anterior <strong>y además</strong> el bloque “Casos destacados” de la
                    portada.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Ojo>
            La lista de casos de un área <strong>se arma desde el proyecto, no desde el
            área</strong>. Si a un área le faltan casos, no busques el error en Áreas:
            entrá a cada proyecto y fijate que tenga tildada esa área.
          </Ojo>
          <p>
            Cada área muestra hasta tres casos, los primeros según el campo{" "}
            <em>Orden</em> de cada proyecto (número más chico, más arriba).
          </p>
        </Section>

        <Section id="areas" n="04" title="Las áreas">
          <p>
            Un área es cada uno de los bloques de “Qué hacemos”. Al abrirla desde el sitio
            tiene su página propia: la descripción grande, las tarjetas de lo que incluye,
            y abajo los casos.
          </p>
          <ul className="grid list-disc gap-2 pl-5 marker:text-black/30">
            <li>
              <strong>Descripción</strong> — el texto grande que se lee al abrir el área.
            </li>
            <li>
              <strong>Ítems del listado</strong> — la lista corta que aparece en la portada,
              debajo del título del área. Uno por renglón.
            </li>
            <li>
              <strong>Tarjetas del área</strong> — los servicios de adentro, cada uno con su
              título, su foto y una línea de descripción. Se numeran solas y se ordenan con
              las flechitas.
            </li>
            <li>
              <strong>Imagen del área</strong> — la foto grande del bloque en la portada. Si
              la dejás vacía queda un recuadro gris.
            </li>
          </ul>
          <Ojo>
            El campo <strong>Key</strong> no se toca. Es el vínculo interno con los
            proyectos: si lo cambiás, todos los casos que tenía asociados quedan sueltos y
            hay que volver a tildarlos uno por uno.
          </Ojo>
        </Section>

        <Section id="imagenes" n="05" title="Imágenes">
          <p>
            En todos los campos de foto tenés el botón <strong>Subir imagen</strong>: elegís
            el archivo de la computadora y se sube ahí mismo. Acepta hasta 20 MB, así que
            una foto de celular o una exportada de Photoshop entran sin problema.
          </p>
          <p>
            El sistema la optimiza solo: la achica si es enorme y la convierte a un formato
            liviano para que el sitio cargue rápido. Debajo del campo te dice cuánto pesó al
            final.
          </p>
          <Ojo>
            Subir la imagen <strong>no guarda el formulario</strong>. Después de subirla
            tenés que tocar <strong>Guardar</strong> abajo, como con cualquier otro campo.
          </Ojo>
          <p className="text-black/55">
            El campo también acepta pegar una URL, por si la imagen ya está publicada en
            otro lado. Es lo que usan las portadas que venían del sitio anterior.
          </p>
        </Section>

        <Section id="videos" n="06" title="Videos">
          <p>
            Los videos <strong>no se suben al panel</strong>: se suben a Vimeo o YouTube y
            acá se pega el link. Es lo que conviene — el video lo sirve la plataforma, que
            se encarga de la calidad según la conexión de quien mira, y el sitio no se pone
            pesado.
          </p>
          <p>
            Si no querés que el video aparezca en las búsquedas de YouTube, subilo como{" "}
            <strong>No listado</strong>: se ve perfecto embebido en el sitio pero no figura
            en el canal.
          </p>
        </Section>

        <Section id="contacto" n="07" title="Contacto">
          <p>
            En{" "}
            <Link href="/admin/contacto" className="font-semibold underline">
              Contacto
            </Link>{" "}
            se configuran los dos botones del sitio:
          </p>
          <ul className="grid list-disc gap-2 pl-5 marker:text-black/30">
            <li>
              <strong>WhatsApp</strong> — el link va en formato{" "}
              <code className="rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-xs">
                https://wa.me/5491112345678
              </code>
              : el número con código de país, sin el “+”, sin espacios ni guiones.
            </li>
            <li>
              <strong>Calendly</strong> — el link de tu calendario. En Calendly lo sacás con{" "}
              <em>Share → Copy link</em>. El botón “Agendá una llamada” lo abre en una
              ventana flotante, sin sacar a la persona del sitio.
            </li>
          </ul>
          <p className="text-black/55">
            Si dejás el de Calendly vacío, el botón lleva a la sección de contacto en vez de
            abrir el calendario.
          </p>
        </Section>

        <Section id="problemas" n="08" title="Si algo no se ve">
          <p>Casi siempre es una de estas cinco, en este orden:</p>
          <Pasos
            items={[
              <>
                <strong>¿Tocaste Guardar?</strong> El botón está al final del formulario.
                Salir sin guardar pierde los cambios.
              </>,
              <>
                <strong>¿Está tildado Publicado?</strong> Se ve de un vistazo en la lista de
                Proyectos: dice “Publicado” o “Borrador”.
              </>,
              <>
                <strong>¿Lo estás buscando en la portada?</strong> Ahí solo salen los{" "}
                <strong>Destacados</strong>. En la página del área salen todos los
                publicados.
              </>,
              <>
                <strong>¿Le tildaste el área?</strong> Es el error más común cuando a un área
                le faltan casos.
              </>,
              <>
                <strong>Refrescá de nuevo.</strong> A veces el navegador se queda con la
                versión vieja. En Mac, <em>Cmd + Shift + R</em>; en Windows,{" "}
                <em>Ctrl + F5</em>.
              </>,
            ]}
          />
          <p className="text-black/55">
            Si pasaste las cinco y sigue sin verse, escribinos con el nombre del proyecto y
            lo miramos.
          </p>
        </Section>
      </div>

      <p className="mt-8 text-xs text-black/40">
        ¿Falta algo en esta página? Decinos qué te trabó y lo agregamos acá, así queda para
        la próxima.
      </p>
    </div>
  );
}
