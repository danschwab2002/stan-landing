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
  { id: "servicios", label: "Los servicios (“Lo que hicimos”)" },
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
            El panel administra cuatro cosas, y son las cuatro del menú de la izquierda:
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
              <strong>Servicios</strong> — la lista de “Lo que hicimos” (dirección,
              producción, filmación…) que después tildás en cada caso.
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
                <strong>Video.</strong> Se sube desde la compu, igual que la portada. Se
                reproduce cuando el visitante toca el play adentro del caso.{" "}
                <a href="#videos" className="font-semibold underline">
                  ver abajo
                </a>
                .
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
                <strong>Lo que hicimos.</strong> Tildá los servicios que se hicieron{" "}
                <em>en este proyecto</em>: son los íconos que salen al pie de la ficha. Si
                fue una cobertura donde filmaron y editaron pero no hubo dirección
                creativa, destildá esa. Si no tocás nada, se muestran todos —{" "}
                <a href="#servicios" className="font-semibold underline">
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
              título, su foto, una línea de descripción y el{" "}
              <strong>proyecto relacionado</strong>. Se numeran solas y se ordenan con las
              flechitas.
            </li>
            <li>
              <strong>Imagen del área</strong> — la foto grande del bloque en la portada. Si
              la dejás vacía queda un recuadro gris.
            </li>
          </ul>

          <p className="font-semibold">El “Proyecto relacionado” de cada tarjeta</p>
          <p>
            Cada tarjeta del área puede llevar a un caso. Elegís cuál en el desplegable del
            final de la tarjeta y, cuando alguien la toca en el sitio, va derecho a ese
            proyecto. Sirve para mostrar <em>tu mejor ejemplo</em> de ese servicio: si la
            tarjeta dice “Campañas”, elegís la campaña que más te guste mostrar.
          </p>
          <ul className="grid list-disc gap-2 pl-5 marker:text-black/30">
            <li>
              Va <strong>un solo</strong> proyecto por tarjeta. Una vez adentro del caso, el
              bloque de recomendados del pie sigue llevando al visitante a otros trabajos.
            </li>
            <li>
              Si lo dejás en <strong>“Ninguno”</strong>, la tarjeta se sigue viendo pero no
              se puede tocar. No es un error: es lo normal hasta que le elijas uno.
            </li>
            <li>
              Solo aparecen en la lista los proyectos <strong>publicados</strong>, para que
              la tarjeta no lleve a una página que nadie puede ver.
            </li>
          </ul>
          <Ojo>
            Si cambiás el <strong>slug</strong> de un proyecto, las tarjetas que apuntaban a
            él dejan de ser clickeables (se ven, pero no llevan a ningún lado). No se rompe
            nada; hay que volver a elegirlo en el desplegable.
          </Ojo>

          <Ojo>
            El campo <strong>Key</strong> del área no se toca. Es el vínculo interno con los
            proyectos: si lo cambiás, todos los casos que tenía asociados quedan sueltos y
            hay que volver a tildarlos uno por uno.
          </Ojo>
        </Section>

        <Section id="servicios" n="05" title="Los servicios (“Lo que hicimos”)">
          <p>
            Al pie de cada caso hay una fila de íconos con lo que se hizo en ese trabajo:
            dirección creativa, producción, filmación, postproducción. Esa lista la
            administrás vos desde{" "}
            <Link href="/admin/servicios" className="font-semibold underline">
              Servicios
            </Link>
            , y después en cada proyecto tildás cuáles corresponden.
          </p>
          <p className="font-semibold">Son dos cosas distintas</p>
          <ul className="grid list-disc gap-2 pl-5 marker:text-black/30">
            <li>
              <strong>Servicios</strong> (esta sección) — <em>qué opciones existen</em>. Acá
              creás “Dirección de arte” o “Streaming” si te falta alguna.
            </li>
            <li>
              <strong>Lo que hicimos</strong> (dentro de cada proyecto) — <em>cuáles se
              hicieron en ese caso</em>. Es tildar casillas.
            </li>
          </ul>
          <p className="font-semibold">Para agregar un servicio nuevo</p>
          <Pasos
            items={[
              <>
                Pedile al equipo de diseño el <strong>ícono</strong>: un PNG con fondo
                transparente, en el amarillo de la marca, igual que los que ya están.
              </>,
              <>
                Andá a <strong>Servicios → + Nuevo servicio</strong>, poné el nombre y subí
                el ícono con el mismo botón de siempre.
              </>,
              <>
                <strong>Guardar.</strong> Aparece solo en todos los casos que no tengan
                nada tildado, y queda disponible para tildar en el resto.
              </>,
            ]}
          />
          <Ojo>
            Un caso <strong>sin nada tildado muestra todos</strong> los servicios de la
            lista. Por eso, al crear uno nuevo, no hace falta entrar a los casos viejos uno
            por uno. Y si a un caso le destildás todos, el bloque “Lo que hicimos”
            directamente no aparece en su ficha.
          </Ojo>
          <p>
            <strong>Renombrar</strong> un servicio es seguro: cambia el texto en todos los
            casos y no desvincula ninguno. <strong>Borrarlo</strong> lo saca de todas las
            fichas donde salía — la lista te avisa en cuántos casos aparece antes de que
            confirmes.
          </p>
          <p className="text-black/55">
            El <em>identificador interno</em> que ves al editar no se puede cambiar: es la
            etiqueta con la que cada proyecto tiene guardado el servicio. Para cambiar lo
            que se lee, editá el nombre.
          </p>
        </Section>

        <Section id="imagenes" n="06" title="Imágenes">
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

        <Section id="videos" n="07" title="Videos">
          <p>
            El video de un caso <strong>se sube desde la compu</strong>, igual que una
            foto: entrás al proyecto, tocás <strong>Subir video</strong> y elegís el
            archivo. Se aloja en el sitio, sin YouTube ni Vimeo de por medio — así el caso
            se ve limpio, sin logos ajenos ni sugerencias de otros videos al terminar.
          </p>
          <p>
            <strong>Exportalo en 1080p.</strong> Es lo que se ve en pantalla y pesa una
            fracción de un master. Si subís algo más grande, el sitio lo achica solo, pero
            la subida tarda bastante más. El tope por archivo es de 600 MB.
          </p>
          <p>
            Después de que la barra llega al 100%, el video queda un rato{" "}
            <strong>preparándose</strong>: se lo está acomodando para que arranque rápido
            en el navegador de quien entre. No cierres esa pantalla hasta que diga{" "}
            <strong>Listo</strong>, y acordate de <strong>guardar el formulario</strong>{" "}
            después.
          </p>
          <Ojo>
            <p>
              <strong>Dónde se ve.</strong> Adentro del caso, arriba de todo. La portada se
              muestra con un botón de play encima, y el video arranca{" "}
              <strong>solo cuando el visitante lo toca</strong> — nunca solo. En la grilla
              de casos y en las páginas de área, el play que aparece sobre las imágenes es
              una señal de que ese caso tiene video: lleva al caso, donde se reproduce.
            </p>
          </Ojo>
          <p className="text-black/55">
            El campo también acepta pegar un link de Vimeo o YouTube, por si algún video ya
            está publicado ahí. Anda igual, pero en ese caso el reproductor es el de esa
            plataforma, con su marca. Lo normal es subirlo.
          </p>
          <p className="text-black/55">
            <strong>Si no cargás video</strong> en un caso, la portada se muestra sola y sin
            botón de play. No queda nada roto ni a medias.
          </p>
        </Section>

        <Section id="contacto" n="08" title="Contacto">
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
            <li>
              <strong>Instagram</strong> — podés pegar el link del perfil o escribir el
              usuario con arroba; las dos formas funcionan. El usuario que se muestra en la
              sección de Contacto sale de ahí, así que el texto y el link nunca van a
              apuntar a cuentas distintas.
            </li>
          </ul>
          <p className="text-black/55">
            Si dejás el de Calendly vacío, el botón lleva a la sección de contacto en vez de
            abrir el calendario. Si dejás el de Instagram vacío, el dato no se muestra.
          </p>
        </Section>

        <Section id="problemas" n="09" title="Si algo no se ve">
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
