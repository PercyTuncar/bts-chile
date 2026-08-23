import type { Metadata } from "next";
import Link from "next/link";
import { Bus, Car, MapPin, Train } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: "Cómo Llegar al Estadio Nacional - BTS Chile 2026",
  description:
    "Guía completa para llegar al Estadio Nacional: Metro Línea 6, buses, auto, Uber, estacionamientos, mapa y mejores rutas. Direcciones exactas para el concierto de BTS.",
  keywords: [
    "como llegar estadio nacional",
    "estadio nacional santiago direccion",
    "metro estadio nacional",
    "estacionamiento estadio nacional",
    "transporte estadio nacional",
    "llegar concierto bts",
  ],
  alternates: { canonical: `${SITE_URL}/como-llegar` },
  openGraph: {
    type: "article",
    title: "Cómo Llegar al Estadio Nacional - BTS Chile 2026",
    description: "Guía completa de transporte al Estadio Nacional para el concierto de BTS.",
    url: `${SITE_URL}/como-llegar`,
    images: [`${SITE_URL}/og-estadio.jpg`],
  },
};

export default function ComoLlegarPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": `${SITE_URL}/como-llegar#estadio-nacional`,
        name: "Estadio Nacional Julio Martínez Prádanos",
        alternateName: ["Estadio Nacional", "Coloso de Ñuñoa"],
        description:
          "El estadio más grande de Chile, ubicado en el corazón de Ñuñoa, Santiago. Sede del concierto BTS WORLD TOUR ARIRANG 2026.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. Grecia 2001",
          addressLocality: "Ñuñoa",
          addressRegion: "Región Metropolitana",
          postalCode: "7750000",
          addressCountry: "CL",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: -33.4646,
          longitude: -70.6094,
        },
        url: "https://www.estadionacional.cl",
        telephone: "+56-2-2238-8102",
        maximumAttendeeCapacity: 48000,
        publicAccess: true,
        isAccessibleForFree: false,
        smokingAllowed: false,
        amenityFeature: [
          {
            "@type": "LocationFeatureSpecification",
            name: "Baños",
            value: true,
          },
          {
            "@type": "LocationFeatureSpecification",
            name: "Estacionamiento",
            value: true,
          },
          {
            "@type": "LocationFeatureSpecification",
            name: "Acceso Metro",
            value: true,
          },
          {
            "@type": "LocationFeatureSpecification",
            name: "Puntos de venta de comida",
            value: true,
          },
          {
            "@type": "LocationFeatureSpecification",
            name: "Accesibilidad para sillas de ruedas",
            value: true,
          },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${SITE_URL}/como-llegar#howto`,
        name: "Cómo Llegar al Estadio Nacional para el Concierto de BTS",
        description:
          "Guía paso a paso para llegar al Estadio Nacional Julio Martínez Prádanos usando Metro, bus, auto o Uber. Incluye horarios, costos y mejores rutas.",
        totalTime: "PT30M",
        tool: [
          {
            "@type": "HowToTool",
            name: "Tarjeta BIP!",
            description: "Necesaria para usar Metro y buses en Santiago",
          },
          {
            "@type": "HowToTool",
            name: "Aplicación Google Maps",
            description: "Para navegación en tiempo real",
          },
        ],
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Tomar Metro Línea 6",
            text: "Dirígete a cualquier estación de Metro en Santiago y toma la Línea 6 (morada) hacia Estadio Nacional. La estación está a solo 2 minutos caminando de la entrada principal.",
            url: `${SITE_URL}/como-llegar#metro`,
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Salir en Estadio Nacional",
            text: "Baja en la estación Estadio Nacional (última estación de Línea 6). Sigue las señalizaciones hacia el estadio.",
            url: `${SITE_URL}/como-llegar#metro`,
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Caminar al Estadio",
            text: "Sal por la salida principal y camina 200 metros hacia el norte por Av. Grecia. Verás el estadio frente a ti. Tiempo de caminata: 2-3 minutos.",
            url: `${SITE_URL}/como-llegar#metro`,
          },
        ],
        estimatedCost: {
          "@type": "MonetaryAmount",
          currency: "CLP",
          value: "850",
        },
      },
      {
        "@type": "Article",
        "@id": `${SITE_URL}/como-llegar#article`,
        headline: "Guía Completa: Cómo Llegar al Estadio Nacional para BTS 2026",
        description:
          "Todas las opciones de transporte para llegar al Estadio Nacional: Metro, bus, auto, Uber, con tiempos, costos y recomendaciones.",
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
          },
        },
        datePublished: "2026-08-23",
        dateModified: "2026-08-23",
        mainEntityOfPage: `${SITE_URL}/como-llegar`,
        about: { "@id": `${SITE_URL}/como-llegar#estadio-nacional` },
        inLanguage: "es-CL",
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 text-center">
          <MapPin className="mx-auto mb-4 text-brand" size={48} />
          <h1 className="text-h1 font-bold">Cómo Llegar al Estadio Nacional</h1>
          <p className="mt-4 text-lg text-text-muted">
            <strong>Estadio Nacional Julio Martínez Prádanos</strong>
            <br />
            Av. Grecia 2001, Ñuñoa, Santiago
          </p>
          <a
            href="https://maps.google.com/?q=-33.4646,-70.6094"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-brand hover:underline"
          >
            📍 Ver en Google Maps
          </a>
        </div>

        <div className="mb-8 rounded-lg border-2 border-brand bg-brand-soft p-6">
          <h2 className="mb-3 text-xl font-semibold">⏰ Horarios del Concierto</h2>
          <ul className="space-y-2 text-text-muted">
            <li>🚪 <strong>Apertura de puertas:</strong> 18:00 hrs</li>
            <li>🎤 <strong>Inicio del show:</strong> 20:00 hrs</li>
            <li>📢 <strong>Recomendación:</strong> Llegar entre 17:00-18:00 hrs</li>
          </ul>
        </div>

        <section id="metro" className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <Train className="text-brand" size={36} />
            <h2 className="text-h2 font-semibold">Metro (RECOMENDADO)</h2>
          </div>

          <div className="rounded-lg bg-surface p-6 border border-border">
            <h3 className="mb-3 text-lg font-semibold text-green-600">✅ Mejor Opción</h3>
            <p className="mb-4 text-text-muted">
              <strong>Línea 6 (Morada)</strong> - Estación: Estadio Nacional
            </p>

            <div className="mb-4">
              <h4 className="mb-2 font-semibold">Pasos:</h4>
              <ol className="list-decimal list-inside space-y-2 text-text-muted">
                <li>Toma Metro Línea 6 (color morado) dirección Estadio Nacional</li>
                <li>Baja en la última estación: <strong>Estadio Nacional</strong></li>
                <li>Sal por la salida principal hacia Av. Grecia</li>
                <li>Camina 200m hacia el norte (2-3 minutos)</li>
                <li>¡Llegas al estadio!</li>
              </ol>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded bg-white dark:bg-surface-hover p-3">
                <p className="font-semibold">⏱️ Tiempo</p>
                <p className="text-text-muted">2 min caminando</p>
              </div>
              <div className="rounded bg-white dark:bg-surface-hover p-3">
                <p className="font-semibold">💰 Costo</p>
                <p className="text-text-muted">$850 CLP (Tarjeta BIP!)</p>
              </div>
              <div className="rounded bg-white dark:bg-surface-hover p-3">
                <p className="font-semibold">📅 Horario</p>
                <p className="text-text-muted">6:00 - 23:00 hrs</p>
              </div>
            </div>

            <div className="mt-4 rounded bg-blue-50 dark:bg-blue-950 p-4 text-sm">
              <p className="font-semibold text-blue-800 dark:text-blue-200">💡 Consejos:</p>
              <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Carga tu tarjeta BIP! con anticipación</li>
                <li>• El metro estará MUY lleno después del concierto (23:00 hrs)</li>
                <li>• Considera esperar 30-40 min antes de tomar metro de vuelta</li>
                <li>• Alternativa: caminar a estación Ñuñoa (L6) o Plaza Egaña (L4)</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="bus" className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <Bus className="text-brand" size={36} />
            <h2 className="text-h2 font-semibold">Bus (Transantiago)</h2>
          </div>

          <div className="rounded-lg bg-surface p-6 border border-border">
            <p className="mb-4 text-text-muted">
              Múltiples recorridos pasan cerca del Estadio Nacional por <strong>Av. Grecia</strong>:
            </p>

            <div className="mb-4">
              <h4 className="mb-2 font-semibold">Recorridos principales:</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded bg-white dark:bg-surface-hover p-3">
                  <p className="font-semibold">🚌 B24</p>
                  <p className="text-sm text-text-muted">Metro La Florida ↔ Plaza Ñuñoa</p>
                </div>
                <div className="rounded bg-white dark:bg-surface-hover p-3">
                  <p className="font-semibold">🚌 D02</p>
                  <p className="text-sm text-text-muted">Maipú ↔ Plaza Egaña</p>
                </div>
                <div className="rounded bg-white dark:bg-surface-hover p-3">
                  <p className="font-semibold">🚌 H05</p>
                  <p className="text-sm text-text-muted">Las Rejas ↔ Ñuñoa</p>
                </div>
                <div className="rounded bg-white dark:bg-surface-hover p-3">
                  <p className="font-semibold">🚌 210</p>
                  <p className="text-sm text-text-muted">Puente Alto ↔ Providencia</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded bg-white dark:bg-surface-hover p-3">
                <p className="font-semibold">💰 Costo</p>
                <p className="text-text-muted">$740-$850 CLP (Tarjeta BIP!)</p>
              </div>
              <div className="rounded bg-white dark:bg-surface-hover p-3">
                <p className="font-semibold">📍 Paradero</p>
                <p className="text-text-muted">Av. Grecia con Av. Marathon</p>
              </div>
            </div>

            <div className="mt-4 rounded bg-yellow-50 dark:bg-yellow-950 p-4 text-sm">
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ Advertencia:</p>
              <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                Los buses pueden demorar más debido al tráfico. Considera 45-60 minutos de viaje.
                Usa la app RED para ver horarios en tiempo real.
              </p>
            </div>
          </div>
        </section>

        <section id="auto" className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <Car className="text-brand" size={36} />
            <h2 className="text-h2 font-semibold">Auto Particular</h2>
          </div>

          <div className="rounded-lg bg-surface p-6 border border-border">
            <h3 className="mb-3 text-lg font-semibold">Rutas principales:</h3>

            <div className="mb-4 space-y-3">
              <div className="rounded bg-white dark:bg-surface-hover p-4">
                <p className="font-semibold">🛣️ Desde el Centro</p>
                <p className="text-sm text-text-muted">
                  Tomar Av. Vicuña Mackenna hacia el sur → Av. Grecia → Estadio Nacional (izquierda)
                  <br />⏱️ 20-30 minutos (sin tráfico)
                </p>
              </div>

              <div className="rounded bg-white dark:bg-surface-hover p-4">
                <p className="font-semibold">🛣️ Desde Providencia</p>
                <p className="text-sm text-text-muted">
                  Av. Providencia → Av. Irarrázaval → Av. Grecia → Estadio Nacional
                  <br />⏱️ 15-20 minutos
                </p>
              </div>

              <div className="rounded bg-white dark:bg-surface-hover p-4">
                <p className="font-semibold">🛣️ Desde Las Condes</p>
                <p className="text-sm text-text-muted">
                  Av. Apoquindo → Av. Grecia (sur) → Estadio Nacional
                  <br />⏱️ 20-30 minutos
                </p>
              </div>
            </div>

            <h3 className="mb-3 text-lg font-semibold">🅿️ Estacionamientos:</h3>
            <div className="mb-4 space-y-2 text-sm text-text-muted">
              <p>• <strong>Estadio Nacional (Oficial):</strong> Limitado, llegar antes de las 17:00</p>
              <p>• <strong>Calles aledañas:</strong> Av. Marathon, Av. Pedro de Valdivia, calle Rodrigo de Araya</p>
              <p>• <strong>Costo estimado:</strong> $5,000-$10,000 CLP</p>
            </div>

            <div className="rounded bg-red-50 dark:bg-red-950 p-4 text-sm">
              <p className="font-semibold text-red-800 dark:text-red-200">⚠️ Importante:</p>
              <ul className="mt-2 space-y-1 text-red-700 dark:text-red-300">
                <li>• Habrá MUCHO tráfico cerca del estadio (17:00-19:00 y 23:00-01:00)</li>
                <li>• Los estacionamientos se llenan rápido</li>
                <li>• Considera estacionar más lejos y caminar 10-15 minutos</li>
                <li>• No dejes objetos de valor visibles en el auto</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="uber" className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <Car className="text-brand" size={36} />
            <h2 className="text-h2 font-semibold">Uber / Taxi / DiDi</h2>
          </div>

          <div className="rounded-lg bg-surface p-6 border border-border">
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold">Cómo usar:</h3>
              <ol className="list-decimal list-inside space-y-2 text-text-muted">
                <li>Abre tu app (Uber, Cabify, DiDi, Beat)</li>
                <li>Ingresa destino: <strong>"Estadio Nacional"</strong></li>
                <li>Pide que te dejen en la entrada de tu zona</li>
              </ol>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm mb-4">
              <div className="rounded bg-white dark:bg-surface-hover p-3">
                <p className="font-semibold">💰 Costo aprox</p>
                <p className="text-text-muted">$3,000-$8,000 CLP (depende origen)</p>
              </div>
              <div className="rounded bg-white dark:bg-surface-hover p-3">
                <p className="font-semibold">⏱️ Tiempo</p>
                <p className="text-text-muted">15-40 min (depende tráfico)</p>
              </div>
            </div>

            <div className="rounded bg-orange-50 dark:bg-orange-950 p-4 text-sm">
              <p className="font-semibold text-orange-800 dark:text-orange-200">💡 Consejos:</p>
              <ul className="mt-2 space-y-1 text-orange-700 dark:text-orange-300">
                <li>• <strong>Para llegar:</strong> Pide con anticipación (30-45 min antes de salir)</li>
                <li>• <strong>Para volver:</strong> Camina 3-4 cuadras alejándote del estadio primero</li>
                <li>• Las tarifas suben 2-3x después del concierto (surge pricing)</li>
                <li>• Considera compartir Uber con amigos para dividir costos</li>
                <li>• Ten batería en tu celular y saldo/tarjeta cargada</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-h2 font-semibold">📋 Resumen de Opciones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface">
                  <th className="border border-border p-3 text-left">Transporte</th>
                  <th className="border border-border p-3 text-left">Costo</th>
                  <th className="border border-border p-3 text-left">Tiempo</th>
                  <th className="border border-border p-3 text-left">Recomendación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3">🚇 Metro L6</td>
                  <td className="border border-border p-3">$850</td>
                  <td className="border border-border p-3">2 min</td>
                  <td className="border border-border p-3 text-green-600 font-semibold">⭐ MEJOR</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">🚌 Bus</td>
                  <td className="border border-border p-3">$740-850</td>
                  <td className="border border-border p-3">45-60 min</td>
                  <td className="border border-border p-3">Buena opción</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">🚗 Auto</td>
                  <td className="border border-border p-3">$5,000-10,000</td>
                  <td className="border border-border p-3">20-30 min</td>
                  <td className="border border-border p-3">Si llegas temprano</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">🚕 Uber/Taxi</td>
                  <td className="border border-border p-3">$3,000-8,000</td>
                  <td className="border border-border p-3">15-40 min</td>
                  <td className="border border-border p-3">Cómodo pero caro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="rounded-lg bg-brand-soft p-8 text-center">
          <h2 className="mb-4 text-h2 font-semibold">¿Ya sabes cómo llegar?</h2>
          <p className="mb-6 text-text-muted">
            Asegura tus entradas para BTS en Chile 2026
          </p>
          <Link
            href="/entradas"
            className="inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white hover:bg-brand/90 transition-colors"
          >
            Comprar Entradas
          </Link>
        </div>
      </main>
    </>
  );
}
