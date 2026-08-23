import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes - BTS Chile 2026",
  description:
    "Respuestas a todas tus dudas sobre BTS en Chile 2026: entradas, concierto, estadio, transporte, edad mínima, reembolsos, zonas, precios y más.",
  keywords: [
    "bts chile preguntas",
    "faq bts chile",
    "dudas entradas bts",
    "edad minima concierto bts",
    "como llegar estadio nacional",
    "preguntas bts 2026",
  ],
  alternates: { canonical: `${SITE_URL}/preguntas-frecuentes` },
  openGraph: {
    type: "website",
    title: "Preguntas Frecuentes - BTS Chile 2026",
    description: "Todas las respuestas sobre BTS en Chile: entradas, fechas, estadio y más.",
    url: `${SITE_URL}/preguntas-frecuentes`,
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const FAQS = [
  {
    category: "Sobre el Concierto",
    questions: [
      {
        q: "¿Cuándo es el concierto de BTS en Chile 2026?",
        a: "BTS se presentará en Chile en tres fechas: miércoles 14, viernes 16 y sábado 17 de octubre de 2026. Las puertas abren a las 18:00 hrs y el show comienza a las 20:00 hrs en punto.",
      },
      {
        q: "¿Dónde es el concierto de BTS en Santiago?",
        a: "El concierto será en el Estadio Nacional Julio Martínez Prádanos, ubicado en Av. Grecia 2001, Ñuñoa, Santiago. Es el estadio más grande de Chile con capacidad para 48,000 personas por noche.",
      },
      {
        q: "¿Cuánto dura el concierto de BTS?",
        a: "El concierto típicamente dura entre 2.5 a 3 horas, incluyendo el opening act (si hay) y el show principal de BTS. Recomendamos llegar temprano para disfrutar la experiencia completa.",
      },
      {
        q: "¿Qué canciones tocará BTS en Chile?",
        a: "El setlist incluirá canciones del nuevo álbum ARIRANG (como SWIM, 2.0, Brothers, ARIRANG) además de sus grandes éxitos como Dynamite, Butter, Permission to Dance, Life Goes On, Boy With Luv, y más. El setlist final se confirma días antes del show.",
      },
    ],
  },
  {
    category: "Sobre las Entradas",
    questions: [
      {
        q: "¿Cuánto cuestan las entradas para BTS Chile 2026?",
        a: "Las entradas van desde $299 USD (Cancha Andes) hasta $1,784 USD (Cancha VIP). Tenemos 8 zonas diferentes: Cancha VIP, Cancha Platinum, Cancha Gold, Cancha Silver, Cancha Bronze, Cancha Andes, Tribuna Pacífico y Tribuna Mapocho. Todas incluyen impuestos.",
      },
      {
        q: "¿Cómo compro entradas para BTS Chile?",
        a: "Puedes comprar directamente en btschile.com/entradas. Selecciona tu zona preferida, elige la cantidad de tickets, y completa el pago con PayPal. Recibirás tus entradas por correo electrónico inmediatamente.",
      },
      {
        q: "¿Puedo pagar en cuotas las entradas de BTS?",
        a: "Sí, ofrecemos pago en cuotas a través de PayPal. Puedes dividir el pago en hasta 3 cuotas sin interés (dependiendo de tu banco). La opción aparece durante el checkout.",
      },
      {
        q: "¿Las entradas son nominativas?",
        a: "Sí, las entradas son nominativas y no transferibles. El nombre que ingreses al comprar debe coincidir con tu ID al ingresar al estadio. Esto previene la reventa y asegura que las entradas lleguen a verdaderos fans.",
      },
      {
        q: "¿Puedo revender o transferir mi entrada?",
        a: "No, las entradas no son transferibles ni revendibles. Solo la persona cuyo nombre aparece en la entrada puede ingresar. Si no puedes asistir, contáctanos para opciones de reembolso (solo en caso de cancelación oficial).",
      },
      {
        q: "¿Cuándo recibiré mis entradas?",
        a: "Recibirás tus entradas electrónicas por correo inmediatamente después de confirmar tu pago. Revisa tu carpeta de spam si no las ves. Las entradas físicas (si aplica) se envían 2 semanas antes del evento.",
      },
    ],
  },
  {
    category: "Acceso y Logística",
    questions: [
      {
        q: "¿Cómo llego al Estadio Nacional?",
        a: "Metro: Línea 6, estación Estadio Nacional (salida más cercana). Bus: Múltiples recorridos paran en Av. Grecia. Auto: Estacionamientos disponibles en los alrededores (recomendamos llegar temprano). Uber/Taxi: Deja en la entrada más cercana a tu zona.",
      },
      {
        q: "¿A qué hora debo llegar al estadio?",
        a: "Recomendamos llegar entre 17:00-18:00 hrs. Las puertas abren a las 18:00 hrs y el show inicia a las 20:00 hrs. Considera tiempo para seguridad, encontrar tu asiento, y comprar merchandise.",
      },
      {
        q: "¿Qué puedo llevar al concierto?",
        a: "Permitido: bolso pequeño (max 20x20cm), celular, cámara sin lente profesional, botella de agua sellada, banners de tela pequeños, ARMY bomb. NO permitido: mochilas grandes, comida externa, bebidas alcohólicas, paraguas con punta, selfie sticks largos, lasers, pirotecnia.",
      },
      {
        q: "¿Hay revisión de seguridad?",
        a: "Sí, hay revisión obligatoria de bolsos y detector de metales. El proceso puede tomar 15-30 minutos en horario peak. Por eso recomendamos llegar temprano y llevar solo lo esencial.",
      },
    ],
  },
  {
    category: "Edad y Restricciones",
    questions: [
      {
        q: "¿Cuál es la edad mínima para entrar?",
        a: "No hay edad mínima, pero menores de 12 años deben ir acompañados de un adulto responsable. Menores de 18 años necesitan autorización notarial de sus padres si no van acompañados.",
      },
      {
        q: "¿Menores de edad necesitan entrada?",
        a: "Sí, todos necesitan entrada, incluyendo bebés y niños pequeños. No hay entrada gratuita por edad. Los niños menores de 2 años pueden sentarse en el regazo del adulto.",
      },
      {
        q: "¿Puedo entrar con mi ARMY Bomb?",
        a: "Sí, puedes traer tu ARMY Bomb oficial (light stick de BTS). Los ARMY Bombs se conectarán automáticamente al sistema del concierto para sincronizar luces. Asegúrate de traer baterías extras.",
      },
    ],
  },
  {
    category: "Reembolsos y Cambios",
    questions: [
      {
        q: "¿Puedo obtener un reembolso?",
        a: "Los reembolsos solo se procesan si el evento es cancelado o reprogramado oficialmente por BTS/HYBE. No se aceptan devoluciones por cambio de opinión, conflictos de horario, o razones personales. Todas las ventas son finales.",
      },
      {
        q: "¿Qué pasa si el concierto se cancela?",
        a: "Si BTS cancela oficialmente el show, recibirás reembolso completo del precio de tu entrada (100%) en un plazo de 30 días hábiles. El reembolso se procesa al mismo método de pago original.",
      },
      {
        q: "¿Qué pasa si llego tarde?",
        a: "Podrás ingresar durante todo el show, pero deberás esperar entre canciones para no interrumpir. El estadio no reembolsa por llegadas tarde. Recomendamos estar antes de las 20:00 hrs para no perderte el inicio.",
      },
    ],
  },
  {
    category: "Membresía y Beneficios",
    questions: [
      {
        q: "¿Qué es ARMY Boom v4?",
        a: "ARMY Boom v4 es nuestra membresía premium para fans de BTS en Chile. Incluye: acceso prioritario a entradas, contenido exclusivo, descuentos en merchandise, badge especial en la comunidad, y eventos exclusivos para miembros. Primer mes gratis, luego desde $1 USD/mes.",
      },
      {
        q: "¿Los miembros ARMY Boom tienen descuento en entradas?",
        a: "Los miembros ARMY Boom v4 reciben acceso prioritario a la preventa (compran antes que el público general) pero no descuento en el precio. El beneficio es asegurar mejores ubicaciones antes de que se agoten.",
      },
      {
        q: "¿Dónde puedo comprar merchandise oficial de BTS?",
        a: "En btschile.com/tienda tenemos merchandise oficial importado desde Corea: albums, lightsticks, ropa, posters, y más. También habrá stands oficiales de merchandise en el estadio el día del concierto.",
      },
    ],
  },
  {
    category: "Zonas y Ubicaciones",
    questions: [
      {
        q: "¿Cuál es la mejor zona para ver a BTS?",
        a: "Cancha VIP y Cancha Platinum ofrecen la vista más cercana al escenario (frente al stage). Cancha Gold y Silver tienen excelente vista lateral. Las Tribunas (Pacífico y Mapocho) ofrecen vista panorámica elevada ideal para ver coreografías completas.",
      },
      {
        q: "¿Las zonas de cancha tienen asientos?",
        a: "No, las zonas de cancha (VIP, Platinum, Gold, Silver, Bronze, Andes) son de pie (standing). Las Tribunas (Pacífico y Mapocho) sí tienen asientos numerados.",
      },
      {
        q: "¿Puedo cambiar de zona una vez dentro?",
        a: "No, cada zona está separada por vallas de seguridad y solo puedes acceder a la zona de tu entrada. El personal de seguridad verifica tu zona al ingresar.",
      },
    ],
  },
];

export default function PreguntasFrecuentesPage() {
  const allQuestions = FAQS.flatMap((cat) =>
    cat.questions.map((q) => ({
      "@type": "Question" as const,
      name: q.q,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: q.a,
      },
    }))
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/preguntas-frecuentes#faqpage`,
        name: "Preguntas Frecuentes - BTS Chile 2026",
        description:
          "Respuestas a todas las preguntas sobre el concierto de BTS en Chile 2026: entradas, fechas, estadio, transporte, edades, reembolsos y más.",
        mainEntity: allQuestions,
        inLanguage: "es-CL",
        about: {
          "@type": "MusicEvent",
          name: 'BTS WORLD TOUR "ARIRANG" IN SANTIAGO',
          url: `${SITE_URL}/entradas`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/preguntas-frecuentes#webpage`,
        url: `${SITE_URL}/preguntas-frecuentes`,
        name: "Preguntas Frecuentes sobre BTS en Chile 2026",
        description:
          "Encuentra respuestas a todas tus dudas sobre el concierto de BTS en Chile: cómo comprar entradas, zonas, precios, horarios, transporte y más.",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@type": "MusicEvent",
          name: 'BTS WORLD TOUR "ARIRANG" IN SANTIAGO 2026',
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Inicio",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Preguntas Frecuentes",
              item: `${SITE_URL}/preguntas-frecuentes`,
            },
          ],
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "h2", ".question"],
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12 text-center">
          <HelpCircle className="mx-auto mb-4 text-brand" size={48} />
          <h1 className="text-h1 font-bold">Preguntas Frecuentes</h1>
          <p className="mt-4 text-lg text-text-muted">
            Encuentra respuestas a todas tus dudas sobre BTS en Chile 2026
          </p>
        </div>

        {FAQS.map((category, catIdx) => (
          <section key={catIdx} className="mb-12">
            <h2 className="mb-6 text-h2 font-semibold text-brand">{category.category}</h2>
            <div className="space-y-6">
              {category.questions.map((faq, qIdx) => (
                <div
                  key={qIdx}
                  className="question rounded-lg border border-border bg-surface p-6 transition-shadow hover:shadow-md"
                >
                  <h3 className="mb-3 text-lg font-semibold">{faq.q}</h3>
                  <p className="text-text-muted">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-12 rounded-lg bg-brand-soft p-8 text-center">
          <h2 className="mb-4 text-h2 font-semibold">¿No encontraste tu respuesta?</h2>
          <p className="mb-6 text-text-muted">
            Si tienes más preguntas, visita nuestra comunidad o revisa las entradas disponibles
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/entradas"
              className="inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white hover:bg-brand/90 transition-colors"
            >
              Ver Entradas
            </Link>
            <Link
              href="/comunidad"
              className="inline-block rounded-full border-2 border-brand bg-white px-8 py-3 font-semibold text-brand hover:bg-brand hover:text-white transition-colors"
            >
              Ir a la Comunidad
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
