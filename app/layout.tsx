import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UsernameGate } from "@/components/auth/UsernameGate";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";

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
    default: "BTS Chile — Entradas, Comunidad ARMY & Noticias",
    template: "%s | btschile.com",
  },
  description:
    "La comunidad oficial de ARMY en Chile. Entradas BTS Chile 2026 verificadas, noticias, membresía ARMY Boom v4 y tienda de merchandise.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
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
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <AuthProvider>
          <UsernameGate />
          <Navbar />
          <div
            id="contenido"
            className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
          >
            {children}
          </div>
          <Footer />
          <BottomNav />
        </AuthProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
