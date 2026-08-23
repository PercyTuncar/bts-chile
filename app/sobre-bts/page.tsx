import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Music, Users } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: "BTS ARIRANG World Tour 2026 - Información Completa",
  description:
    "Todo sobre el BTS WORLD TOUR ARIRANG 2026: 79 shows en 34 ciudades, álbum completo con 16 tracks, miembros RM, Jin, Suga, J-Hope, Jimin, V y Jungkook reunidos. Fechas, ciudades y entradas.",
  keywords: [
    "bts arirang tour",
    "bts 2026",
    "bts world tour arirang",
    "bts chile 2026",
    "bts arirang album",
    "bts members",
    "rm jin suga jhope jimin v jungkook",
  ],
  alternates: { canonical: `${SITE_URL}/sobre-bts` },
  openGraph: {
    type: "article",
    title: "BTS ARIRANG World Tour 2026 - Guía Completa",
    description:
      "Todo sobre BTS en 2026: World Tour, álbum ARIRANG, miembros y fechas en Chile.",
    url: `${SITE_URL}/sobre-bts`,
    images: [`${SITE_URL}/og-bts-arirang.jpg`],
  },
};

export default function SobreBTSPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicGroup",
        "@id": `${SITE_URL}/sobre-bts#bts`,
        name: "BTS",
        alternateName: [
          "방탄소년단",
          "Bangtan Sonyeondan",
          "Beyond The Scene",
          "Bangtan Boys",
          "防弹少年团",
        ],
        description:
          "BTS (방탄소년단) es un grupo surcoreano de K-pop de 7 miembros formado por Big Hit Entertainment (ahora HYBE) en 2013. El grupo está compuesto por RM, Jin, Suga, J-Hope, Jimin, V y Jungkook.",
        genre: ["K-pop", "Pop", "Hip hop", "R&B", "EDM", "Synth-pop"],
        foundingDate: "2013-06-13",
        foundingLocation: {
          "@type": "Place",
          name: "Seoul, South Korea",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Seoul",
            addressCountry: "KR",
          },
        },
        member: [
          {
            "@type": "Person",
            name: "RM",
            alternateName: ["Kim Namjoon", "김남준", "Rap Monster"],
            birthDate: "1994-09-12",
            jobTitle: "Leader, Main Rapper, Producer",
            description: "Líder y rapero principal de BTS, conocido por su profundo lirismo y producción musical.",
          },
          {
            "@type": "Person",
            name: "Jin",
            alternateName: ["Kim Seokjin", "김석진"],
            birthDate: "1992-12-04",
            jobTitle: "Sub Vocalist, Visual",
            description: "El miembro mayor de BTS, conocido por su voz poderosa y carisma visual.",
          },
          {
            "@type": "Person",
            name: "Suga",
            alternateName: ["Min Yoongi", "민윤기", "Agust D"],
            birthDate: "1993-03-09",
            jobTitle: "Lead Rapper, Producer",
            description: "Rapero y productor de BTS, también activo como solista bajo el nombre Agust D.",
          },
          {
            "@type": "Person",
            name: "J-Hope",
            alternateName: ["Jung Hoseok", "정호석"],
            birthDate: "1994-02-18",
            jobTitle: "Main Dancer, Sub Rapper, Producer",
            description: "Bailarín principal y rapero de BTS, conocido por su energía positiva.",
          },
          {
            "@type": "Person",
            name: "Jimin",
            alternateName: ["Park Jimin", "박지민"],
            birthDate: "1995-10-13",
            jobTitle: "Main Dancer, Lead Vocalist",
            description: "Bailarín principal y vocalista líder de BTS, conocido por su voz única y coreografías.",
          },
          {
            "@type": "Person",
            name: "V",
            alternateName: ["Kim Taehyung", "김태형"],
            birthDate: "1995-12-30",
            jobTitle: "Lead Dancer, Sub Vocalist, Visual",
            description: "Vocalista y bailarín de BTS, también conocido por su carrera actoral.",
          },
          {
            "@type": "Person",
            name: "Jungkook",
            alternateName: ["Jeon Jungkook", "전정국", "Golden Maknae"],
            birthDate: "1997-09-01",
            jobTitle: "Main Vocalist, Lead Dancer, Sub Rapper, Center, Maknae",
            description: "El miembro más joven de BTS, conocido como el 'Golden Maknae' por sus múltiples talentos.",
          },
        ],
        url: "https://www.bts.bighitofficial.com",
        sameAs: [
          "https://www.wikidata.org/wiki/Q18123741",
          "https://en.wikipedia.org/wiki/BTS",
          "https://www.instagram.com/bts.bighitofficial/",
          "https://twitter.com/bts_bighit",
          "https://www.youtube.com/@bts",
          "https://www.tiktok.com/@bts_official_bighit",
          "https://www.facebook.com/bangtan.official",
          "https://open.spotify.com/artist/3Nrfpe0tUJi4K4DXYWgMUX",
        ],
        award: [
          "Grammy Nomination (2021, 2022, 2023)",
          "Billboard Music Awards",
          "American Music Awards",
          "MTV Video Music Awards",
          "MAMA Awards",
        ],
        recordLabel: {
          "@type": "Organization",
          name: "Big Hit Music",
          parentOrganization: "HYBE Corporation",
        },
      },
      {
        "@type": "MusicAlbum",
        "@id": `${SITE_URL}/sobre-bts#arirang-album`,
        name: "ARIRANG",
        alternateName: "BTS ARIRANG",
        description:
          "ARIRANG es el quinto álbum de estudio de BTS, lanzado el 20 de marzo de 2026. Marca el regreso del grupo tras su hiato por servicio militar. El álbum combina hip hop, pop, R&B alternativo, synth-pop, EDM y música tradicional coreana.",
        byArtist: { "@id": `${SITE_URL}/sobre-bts#bts` },
        datePublished: "2026-03-20",
        genre: ["K-pop", "Hip hop", "Pop", "R&B", "Synth-pop", "EDM"],
        numTracks: 16,
        inLanguage: ["ko", "en"],
        recordLabel: {
          "@type": "Organization",
          name: "Big Hit Music",
        },
        track: [
          { "@type": "MusicRecording", name: "Body to Body", position: 1 },
          { "@type": "MusicRecording", name: "Hooligan", position: 2 },
          { "@type": "MusicRecording", name: "Aliens", position: 3 },
          { "@type": "MusicRecording", name: "FYA", position: 4 },
          { "@type": "MusicRecording", name: "2.0", position: 5 },
          { "@type": "MusicRecording", name: "No", position: 6 },
          { "@type": "MusicRecording", name: "SWIM", position: 7, description: "Lead single" },
          { "@type": "MusicRecording", name: "Interlude: 613", position: 8 },
          { "@type": "MusicRecording", name: "NORMAL", position: 9 },
          { "@type": "MusicRecording", name: "Run Away", position: 10 },
          { "@type": "MusicRecording", name: "Paradise Lost", position: 11 },
          { "@type": "MusicRecording", name: "Seoul", position: 12 },
          { "@type": "MusicRecording", name: "Moonlight", position: 13 },
          { "@type": "MusicRecording", name: "Brothers", position: 14 },
          { "@type": "MusicRecording", name: "ARIRANG", position: 15, description: "Title track" },
          { "@type": "MusicRecording", name: "Come Over", position: 16, description: "Bonus track - Deluxe Vinyl only" },
        ],
        producer: [
          "Pdogg",
          "Diplo",
          "El Guincho",
          "Ryan Tedder",
          "Jasper Harris",
          "Kevin Parker",
          "Mike Will Made-It",
          "Artemas",
          "JPEGMafia",
          "Flume",
          "NITTI",
          "Picard Brothers",
        ],
      },
      {
        "@type": "MusicEvent",
        "@id": `${SITE_URL}/sobre-bts#world-tour`,
        name: 'BTS WORLD TOUR "ARIRANG" 2026',
        description:
          "El BTS WORLD TOUR ARIRANG 2026 es una gira mundial de 79 shows en 34 ciudades a través de 5 continentes: Asia, Norteamérica, Europa, Latinoamérica y Australia. Es la gira más grande en la carrera de BTS.",
        startDate: "2026-05-15",
        endDate: "2027-02-28",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        performer: { "@id": `${SITE_URL}/sobre-bts#bts` },
        organizer: {
          "@type": "Organization",
          name: "HYBE Corporation",
          sameAs: "https://www.hybecorp.com",
        },
        workFeatured: { "@id": `${SITE_URL}/sobre-bts#arirang-album` },
        subEvent: [
          {
            "@type": "MusicEvent",
            name: 'BTS WORLD TOUR "ARIRANG" IN SANTIAGO',
            location: {
              "@type": "Place",
              name: "Estadio Nacional Julio Martínez Prádanos",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Av. Grecia 2001",
                addressLocality: "Santiago",
                addressRegion: "Región Metropolitana",
                addressCountry: "CL",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: -33.4646,
                longitude: -70.6094,
              },
            },
            startDate: "2026-10-14T20:00:00-03:00",
            endDate: "2026-10-17T23:00:00-03:00",
          },
        ],
        url: `${SITE_URL}/entradas`,
      },
      {
        "@type": "Article",
        "@id": `${SITE_URL}/sobre-bts#article`,
        headline: "BTS ARIRANG World Tour 2026 - Todo lo que Necesitas Saber",
        description:
          "Guía completa del BTS WORLD TOUR ARIRANG 2026: información sobre los 7 miembros, el álbum ARIRANG de 16 canciones, fechas de la gira mundial y entradas para Chile.",
        author: {
          "@type": "Organization",
          name: "BTS Chile",
          url: SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "BTS Chile",
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logo.png`,
            width: 512,
            height: 512,
          },
        },
        datePublished: "2026-08-23",
        dateModified: "2026-08-23",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/sobre-bts`,
        },
        about: { "@id": `${SITE_URL}/sobre-bts#bts` },
        mentions: [
          { "@id": `${SITE_URL}/sobre-bts#arirang-album` },
          { "@id": `${SITE_URL}/sobre-bts#world-tour` },
        ],
        inLanguage: "es-CL",
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h1>BTS ARIRANG World Tour 2026 - Guía Completa</h1>

          <p className="lead">
            BTS regresa en 2026 con su tour más ambicioso: 79 shows en 34 ciudades de 5 continentes.
            Chile es parte de esta gira histórica con 3 fechas en el Estadio Nacional.
          </p>

          <section>
            <h2>
              <Music className="inline-block mr-2" size={32} />
              El Álbum: ARIRANG
            </h2>
            <p>
              <strong>ARIRANG</strong> es el quinto álbum de estudio de BTS, lanzado el 20 de marzo de 2026.
              Después de casi 4 años de hiato por el servicio militar, el grupo vuelve con 16 canciones que
              fusionan hip hop, pop, R&B, synth-pop, EDM y música tradicional coreana.
            </p>

            <h3>Tracklist Completo:</h3>
            <ol>
              <li><strong>Body to Body</strong> - Producida por Picard Brothers, Diplo, Ryan Tedder, Pdogg</li>
              <li><strong>Hooligan</strong> - Producida por El Guincho, Fakegudo, Jasper Harris</li>
              <li><strong>Aliens</strong> - Producida por Mike Will Made-It, Pluss, Donut, Khaled Rohaim</li>
              <li><strong>FYA</strong> - Producida por Diplo, Flume, NITTI</li>
              <li><strong>2.0</strong> - Producida por Mike Will Made-It, Pluss</li>
              <li><strong>No</strong></li>
              <li><strong>SWIM</strong> - 🎵 Lead Single (Single principal)</li>
              <li><strong>Interlude: 613</strong></li>
              <li><strong>NORMAL</strong> - También disponible en versión coreana</li>
              <li><strong>Run Away</strong></li>
              <li><strong>Paradise Lost</strong></li>
              <li><strong>Seoul</strong></li>
              <li><strong>Moonlight</strong></li>
              <li><strong>Brothers</strong></li>
              <li><strong>ARIRANG</strong> - 🎵 Title Track (Canción título)</li>
              <li><strong>Come Over</strong> - Bonus track exclusivo del vinilo deluxe</li>
            </ol>

            <p>
              <strong>Productores destacados:</strong> Pdogg, Diplo, El Guincho, Ryan Tedder, Kevin Parker (Tame Impala),
              Mike Will Made-It, JPEGMafia, Flume, y más.
            </p>
          </section>

          <section>
            <h2>
              <Users className="inline-block mr-2" size={32} />
              Los 7 Miembros de BTS
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="mt-0">RM (Kim Namjoon)</h3>
                <p className="text-sm text-text-muted">
                  <strong>Rol:</strong> Líder, Rapero Principal, Productor<br />
                  <strong>Nacimiento:</strong> 12 septiembre 1994<br />
                  El cerebro creativo detrás de BTS, conocido por su profundo lirismo y fluidez en inglés.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="mt-0">Jin (Kim Seokjin)</h3>
                <p className="text-sm text-text-muted">
                  <strong>Rol:</strong> Sub Vocalista, Visual<br />
                  <strong>Nacimiento:</strong> 4 diciembre 1992<br />
                  El miembro mayor del grupo, conocido por su voz poderosa y sentido del humor.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="mt-0">Suga (Min Yoongi / Agust D)</h3>
                <p className="text-sm text-text-muted">
                  <strong>Rol:</strong> Rapero Líder, Productor<br />
                  <strong>Nacimiento:</strong> 9 marzo 1993<br />
                  Productor y rapero talentoso, también activo como solista bajo el nombre Agust D.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="mt-0">J-Hope (Jung Hoseok)</h3>
                <p className="text-sm text-text-muted">
                  <strong>Rol:</strong> Bailarín Principal, Sub Rapero, Productor<br />
                  <strong>Nacimiento:</strong> 18 febrero 1994<br />
                  El sol de BTS, conocido por su energía positiva y habilidades de baile excepcionales.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="mt-0">Jimin (Park Jimin)</h3>
                <p className="text-sm text-text-muted">
                  <strong>Rol:</strong> Bailarín Principal, Vocalista Líder<br />
                  <strong>Nacimiento:</strong> 13 octubre 1995<br />
                  Conocido por su voz única y coreografías emotivas que cautivan a millones.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="mt-0">V (Kim Taehyung)</h3>
                <p className="text-sm text-text-muted">
                  <strong>Rol:</strong> Bailarín Líder, Sub Vocalista, Visual<br />
                  <strong>Nacimiento:</strong> 30 diciembre 1995<br />
                  Vocalista con tono barítono único, también conocido por su carrera actoral.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <h3 className="mt-0">Jungkook (Jeon Jungkook)</h3>
                <p className="text-sm text-text-muted">
                  <strong>Rol:</strong> Vocalista Principal, Bailarín Líder, Centro, Maknae<br />
                  <strong>Nacimiento:</strong> 1 septiembre 1997<br />
                  El "Golden Maknae" (miembro más joven dorado) por sus múltiples talentos en todo.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>
              <Calendar className="inline-block mr-2" size={32} />
              BTS WORLD TOUR "ARIRANG" 2026
            </h2>
            <p>
              La gira más grande en la historia de BTS: <strong>79 shows en 34 ciudades</strong> a través de
              5 continentes, estableciendo un nuevo estándar para artistas surcoreanos en giras internacionales.
            </p>

            <h3>Regiones del Tour:</h3>
            <ul>
              <li><strong>Asia:</strong> Corea del Sur, Japón, Filipinas, Tailandia, Singapur, Hong Kong</li>
              <li><strong>Norteamérica:</strong> Estados Unidos (38 shows), Canadá, México</li>
              <li><strong>Europa:</strong> Reino Unido, Francia, Alemania, España, Italia</li>
              <li><strong>Latinoamérica:</strong> Chile, Brasil, Argentina, Colombia</li>
              <li><strong>Australia:</strong> Sídney, Melbourne</li>
            </ul>

            <div className="rounded-lg border-2 border-brand bg-brand-soft p-6 my-8">
              <h3 className="mt-0 flex items-center gap-2">
                <MapPin size={28} className="text-brand" />
                BTS en Chile - Estadio Nacional
              </h3>
              <p className="text-lg">
                <strong>Fechas:</strong> 14, 16 y 17 de octubre de 2026<br />
                <strong>Lugar:</strong> Estadio Nacional Julio Martínez Prádanos, Santiago<br />
                <strong>Dirección:</strong> Av. Grecia 2001, Ñuñoa<br />
                <strong>Capacidad:</strong> 48,000 personas por noche<br />
                <strong>Precio entradas:</strong> Desde $299 USD hasta $1,784 USD
              </p>
              <Link
                href="/entradas"
                className="inline-block mt-4 rounded-full bg-brand px-8 py-3 font-semibold text-white hover:bg-brand/90 transition-colors no-underline"
              >
                Ver Entradas y Zonas
              </Link>
            </div>
          </section>

          <section>
            <h2>Historia y Logros de BTS</h2>
            <p>
              BTS (방탄소년단, Bangtan Sonyeondan, que significa "Bullet Proof Boy Scouts") debutó el 13 de junio de 2013
              bajo Big Hit Entertainment (ahora HYBE Corporation). El grupo comenzó como un acto de hip-hop pero evolucionó
              hacia un sonido más diverso que abarca múltiples géneros.
            </p>

            <h3>Premios y Reconocimientos:</h3>
            <ul>
              <li>Nominaciones al <strong>Grammy Awards</strong> (2021, 2022, 2023)</li>
              <li>Múltiples <strong>Billboard Music Awards</strong></li>
              <li><strong>American Music Awards</strong> - Favorite Pop Duo or Group</li>
              <li><strong>MTV Video Music Awards</strong></li>
              <li>Incontables <strong>MAMA Awards</strong> (Mnet Asian Music Awards)</li>
              <li>Primer grupo K-pop en presentarse en los Grammy Awards</li>
              <li>Primer artista K-pop en alcanzar #1 en Billboard Hot 100</li>
            </ul>

            <h3>Impacto Cultural:</h3>
            <p>
              BTS ha trascendido la música para convertirse en un fenómeno cultural global. Han hablado en las
              Naciones Unidas sobre temas de amor propio y juventud, colaborado con UNICEF en la campaña
              "Love Myself", y han sido reconocidos por su influencia positiva en millones de jóvenes alrededor del mundo.
            </p>
          </section>

          <section>
            <h2>ARMY: El Fandom de BTS</h2>
            <p>
              <strong>ARMY</strong> (Adorable Representative M.C. for Youth) es el nombre oficial del fandom de BTS.
              Establecido el 9 de julio de 2013, ARMY se ha convertido en uno de los fandoms más grandes, organizados
              y dedicados del mundo.
            </p>

            <p>
              ARMY Chile es una de las comunidades más activas de Latinoamérica, organizando eventos, proyectos de caridad,
              y celebraciones masivas para apoyar a BTS. La membresía ARMY Boom v4 ofrece beneficios exclusivos para
              fans chilenos, incluyendo acceso prioritario a entradas, contenido exclusivo y descuentos en merchandise.
            </p>
          </section>

          <section className="bg-surface rounded-lg p-6 border border-border">
            <h2 className="mt-0">Únete a la Comunidad ARMY Chile</h2>
            <p>
              No te pierdas ninguna actualización sobre BTS en Chile. Únete a nuestra comunidad, consigue tu
              membresía ARMY Boom v4, y asegura tus entradas para el concierto del año.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/membresia"
                className="inline-block rounded-full border-2 border-brand px-6 py-2 font-semibold text-brand hover:bg-brand hover:text-white transition-colors no-underline"
              >
                Ver Membresía
              </Link>
              <Link
                href="/comunidad"
                className="inline-block rounded-full border-2 border-border px-6 py-2 font-semibold hover:bg-surface-hover transition-colors no-underline"
              >
                Unirse a la Comunidad
              </Link>
              <Link
                href="/noticias"
                className="inline-block rounded-full border-2 border-border px-6 py-2 font-semibold hover:bg-surface-hover transition-colors no-underline"
              >
                Leer Noticias
              </Link>
            </div>
          </section>

          <section>
            <h2>Fuentes y Referencias</h2>
            <p className="text-sm text-text-muted">
              La información en esta página proviene de fuentes oficiales y confiables:
            </p>
            <ul className="text-sm">
              <li><a href="https://en.wikipedia.org/wiki/BTS" target="_blank" rel="noopener">Wikipedia - BTS</a></li>
              <li><a href="https://en.wikipedia.org/wiki/Arirang_(album)" target="_blank" rel="noopener">Wikipedia - ARIRANG Album</a></li>
              <li><a href="https://www.forbes.com/sites/hannahabraham/2026/01/13/bts-2026-tour-dates-are-finally-out-all-the-details/" target="_blank" rel="noopener">Forbes - BTS 2026 Tour Dates</a></li>
              <li><a href="https://www.forbes.com/sites/hannahabraham/2026/03/03/bts-releases-arirang-tracklist-all-the-details/" target="_blank" rel="noopener">Forbes - ARIRANG Tracklist</a></li>
              <li><a href="https://kprofiles.com/bts-bangtan-boys-members-profile/" target="_blank" rel="noopener">K-Profiles - BTS Members</a></li>
              <li><a href="https://genius.com/albums/Bts/Arirang" target="_blank" rel="noopener">Genius - ARIRANG Lyrics</a></li>
            </ul>
          </section>
        </article>
      </main>
    </>
  );
}
