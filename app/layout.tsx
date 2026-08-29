import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "../styles/globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UsernameGate } from "@/components/auth/UsernameGate";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import { WhatsAppPopup } from "@/components/ui/WhatsAppPopup";

// Tipografía SF Pro-like — PRD §3.2.C. Self-hosted por next/font, display swap, subsetting.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-kr",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.btschile.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BTS Chile",
    template: "%s | BTS Chile",
  },
  description:
    "BTS en Chile - Precios de las entradas disponible aqui, ARIRANG World Tour 2026 · Estadio Nacional Julio Martínez Prádanos",
  keywords: [
    "bts chile",
    "entradas bts chile",
    "bts chile 2026",
    "concierto bts santiago",
    "bts estadio nacional",
    "army chile",
    "bts world tour arirang",
    "entradas bts estadio nacional",
    "concierto bts chile 2026",
    "bts santiago octubre 2026",
  ],
  authors: [{ name: "BTS Chile" }],
  creator: "BTS Chile",
  publisher: "BTS Chile",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#8b2fc9" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BTS Chile",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteUrl,
    siteName: "BTS Chile",
    title: "BTS Chile",
    description: "BTS en Chile - Precios de las entradas disponible aqui, ARIRANG World Tour 2026 · Estadio Nacional Julio Martínez Prádanos",
    images: [
      {
        url: `${siteUrl}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: "BTS Chile 2026 - Comunidad Oficial ARMY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@btschile",
    creator: "@btschile",
    title: "BTS Chile",
    description: "BTS en Chile - Precios de las entradas disponible aqui, ARIRANG World Tour 2026 · Estadio Nacional Julio Martínez Prádanos",
    images: [`${siteUrl}/og-home.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "es-CL": siteUrl,
      "es": siteUrl,
    },
  },
  other: {
    "msapplication-TileColor": "#8b2fc9",
    "msapplication-config": "/browserconfig.xml",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "",
      "facebook-domain-verification": process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION ?? "",
    },
  },
};

// Evita el zoom automático de Safari iOS al enfocar campos de texto, sin cambiar el layout.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f14" },
  ],
};

// Script anti-FOUC: fija la clase de tema en el primer paint (localStorage + prefers-color-scheme).
const themeInitScript = `
(function(){try{
  var t = localStorage.getItem('theme');
  if(!t){ t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  document.documentElement.classList.toggle('dark', t === 'dark');
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CL"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansKr.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Noticias BTS Chile"
          href={`${siteUrl}/rss.xml`}
        />
        <link rel="author" href={`${siteUrl}/humans.txt`} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
          aria-label="Saltar al contenido principal"
        >
          Saltar al contenido
        </a>
        <AuthProvider>
          <UsernameGate />
          <Navbar />
          <main
            id="contenido"
            className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
            role="main"
          >
            {children}
          </main>
          <Footer />
          <BottomNav />
        </AuthProvider>
        <ToastProvider />
        <WhatsAppPopup />
        <GoogleAnalytics gaId="G-5CWPLP0MMX" />
      </body>
    </html>
  );
}
