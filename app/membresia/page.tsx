import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Ticket, Music, ShoppingBag, Star, Smartphone } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/utils/seo";

export const metadata: Metadata = {
  title: "Membresía BTS Weverse Oficial - Preventa Tour 2026",
  description:
    "Compra tu membresía oficial BTS Weverse. Acceso a preventas de entradas Tour 2026, contenido exclusivo y merchandise limitado. Gestión personalizada vía WhatsApp.",
  keywords: [
    "membresia bts weverse",
    "bts fanclub oficial",
    "army membership",
    "preventa bts chile",
    "comprar membresia weverse",
  ],
  alternates: { canonical: `${SITE_URL}/membresia` },
  openGraph: {
    type: "website",
    title: "Membresía BTS Weverse Oficial",
    description: "Acceso a preventas Tour 2026 y contenido exclusivo. Gestión personalizada.",
    url: `${SITE_URL}/membresia`,
    images: [`${SITE_URL}/og-membresia.jpg`],
  },
};

const BENEFICIOS = [
  {
    icon: Ticket,
    title: "Prioridad en Conciertos",
    description:
      "Acceso exclusivo a PREVENTAS y sorteos para entradas de conciertos de BTS. Indispensable para conseguir tickets del Tour 2026.",
  },
  {
    icon: Music,
    title: "Contenido Exclusivo",
    description: "Fotos, videos y audios solo para miembros en Weverse. Contenido detrás de cámaras y más.",
  },
  {
    icon: ShoppingBag,
    title: "Merch Limitado",
    description:
      'Acceso a productos exclusivos "ARMY Member Only" en Weverse Shop. Ediciones limitadas no disponibles para el público.',
  },
  {
    icon: Star,
    title: "Eventos Especiales",
    description:
      "Oportunidad de aplicar para asistir a programas de música y eventos especiales en Corea.",
  },
  {
    icon: Smartphone,
    title: "Tarjeta Digital",
    description: "Tarjeta de membresía móvil oficial dentro de tu app Weverse.",
  },
];

const FAQS = [
  {
    q: "¿Cuánto dura la membresía?",
    a: "La membresía tiene validez de 1 año (365 días) desde la activación.",
  },
  {
    q: "¿Sirve para la preventa de conciertos en Chile?",
    a: "Sí, la ARMY Membership de Weverse es el único requisito oficial para acceder a preventas de tickets en cualquier parte del mundo, incluyendo Chile.",
  },
  {
    q: "¿Cómo funciona el proceso de compra?",
    a: "Haces clic en 'Comprar Membresía', se abre WhatsApp con un mensaje predefinido. Nos envías tus datos y procesamos tu alta en Weverse. Recibirás las credenciales por correo.",
  },
  {
    q: "¿Por qué comprar aquí y no directo en Weverse?",
    a: "Muchas tarjetas latinoamericanas son rechazadas en Weverse Shop. Nosotros gestionamos la compra por ti y te garantizamos la activación.",
  },
  {
    q: "¿Cuánto tiempo tarda la activación?",
    a: "Una vez confirmado tu pago, activamos tu membresía en máximo 24 horas hábiles y te enviamos las credenciales.",
  },
];

export default function MembresiaPage() {
  const whatsappNumber = "56912345678"; // TODO: Reemplazar con número real
  const whatsappMessage = encodeURIComponent(
    "Hola! Quiero comprar la Membresía BTS Weverse Oficial para acceder a la preventa del Tour 2026. ¿Me pueden ayudar con el proceso?"
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${SITE_URL}/membresia#product`,
        name: "Membresía BTS Global Official Fanclub ARMY - Weverse",
        description:
          "Membresía oficial BTS en Weverse. Incluye prioridad en preventa de entradas Tour 2026, contenido exclusivo y merchandise limitado.",
        brand: { "@type": "Brand", name: "HYBE / Big Hit Music / Weverse" },
        image: [`${SITE_URL}/og-membresia.jpg`],
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/membresia`,
          priceCurrency: "USD",
          price: "33.73",
          availability: "https://schema.org/InStock",
          priceValidUntil: "2026-12-31",
          seller: {
            "@type": "Organization",
            name: "BTS Chile",
            url: SITE_URL,
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "2843",
          bestRating: "5",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/membresia#webpage`,
        url: `${SITE_URL}/membresia`,
        name: "Membresía BTS Weverse Oficial - Preventa Tour 2026",
        description:
          "Compra tu membresía oficial para acceder a preventas de entradas y contenido exclusivo.",
        inLanguage: "es-CL",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Membresía",
              item: `${SITE_URL}/membresia`,
            },
          ],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="min-h-screen bg-bg">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand/10 via-purple-50 to-pink-50 dark:from-brand/5 dark:via-purple-950/20 dark:to-pink-950/20">
          <div className="aurora absolute inset-0 opacity-30" />
          <div className="container relative z-10 mx-auto px-6 py-20 text-center">
            <div className="mx-auto max-w-4xl">
              <span className="mb-4 inline-block rounded-full bg-brand px-4 py-1 text-sm font-bold text-white">
                Membresía Oficial Weverse
              </span>
              <h1 className="mb-6 text-4xl font-black uppercase tracking-tight sm:text-6xl md:text-7xl">
                Membresía BTS
                <br />
                <span className="text-brand">Weverse Oficial</span>
              </h1>
              <p className="mb-8 text-xl text-text-muted sm:text-2xl">
                Asegura tu acceso a la{" "}
                <span className="bg-yellow-200 px-2 py-1 font-bold text-slate-900 dark:bg-yellow-400 dark:text-slate-900">
                  preventa del Tour 2026
                </span>{" "}
                hoy mismo
              </p>

              <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-3 rounded-full bg-green-500 px-8 py-4 text-xl font-bold text-white shadow-xl transition-all hover:bg-green-600 hover:shadow-2xl hover:-translate-y-1 sm:w-auto"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span>Comprar Membresía</span>
                </a>
                <div className="text-center sm:text-left">
                  <p className="text-2xl font-black">$33.73 USD</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-text-muted">
                    Pago Único / 1 Año
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold">
                  Gestionamos tu compra en Weverse de forma segura y personalizada
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="container mx-auto px-6 py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black uppercase md:text-4xl">
              Beneficios Exclusivos
            </h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-brand" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFICIOS.map((beneficio, i) => {
              const Icon = beneficio.icon;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-border bg-surface p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-brand/10 p-3 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{beneficio.title}</h3>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {beneficio.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA con imagen */}
        <section className="py-20 bg-surface">
          <div className="container mx-auto px-6">
            <div className="overflow-hidden rounded-3xl border border-border bg-bg shadow-2xl">
              <div className="grid md:grid-cols-2">
                <div className="relative min-h-[300px] bg-slate-100 dark:bg-slate-800">
                  <img
                    src="/images/bts-group.jpg"
                    alt="BTS"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-brand/10 mix-blend-multiply" />
                </div>
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <h2 className="mb-2 text-2xl font-bold uppercase">Oferta Limitada</h2>
                  <div className="mb-2 text-6xl font-black text-brand">$33.73 USD</div>
                  <span className="mb-8 text-sm font-bold uppercase tracking-widest text-text-muted">
                    Pago Único / 1 Año
                  </span>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-6 w-full rounded-xl bg-slate-900 dark:bg-brand px-6 py-4 font-bold uppercase text-white transition-colors hover:bg-brand dark:hover:bg-brand/90"
                  >
                    Proceder al Pago
                  </a>
                  <p className="text-xs text-text-muted">
                    Te contactaremos por WhatsApp para gestionar tu compra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="container mx-auto max-w-3xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black uppercase">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group cursor-pointer rounded-lg border border-border bg-surface p-6"
              >
                <summary className="flex items-center justify-between text-lg font-bold list-none">
                  {faq.q}
                  <span className="ml-4 text-2xl text-text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="mt-4 leading-relaxed text-text-muted">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="container mx-auto px-6 py-20">
          <div className="rounded-3xl bg-gradient-to-br from-brand to-purple-600 p-12 text-center text-white shadow-2xl">
            <h2 className="mb-4 text-3xl font-black uppercase">¿Listo para unirte al ARMY?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
              No te pierdas la oportunidad de asegurar tus entradas en la preventa exclusiva del
              Tour 2026. La membresía es el único requisito oficial.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-xl font-bold text-brand shadow-xl transition-all hover:bg-slate-100 hover:shadow-2xl hover:-translate-y-1"
            >
              <MessageCircle className="h-6 w-6" />
              <span>Comprar Ahora por WhatsApp</span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
