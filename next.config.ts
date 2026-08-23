import type { NextConfig } from "next";

// Configuración base — PRD §17 / §3.5 (Core Web Vitals).
const nextConfig: NextConfig = {
  images: {
    // Dominios remotos permitidos para next/image (PRD §17).
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // PPR (Partial Prerendering) — en Next 16 se habilita vía `cacheComponents: true`.
  // Palanca de Core Web Vitals (PRD §3.5, §17). Queda DESACTIVADO por ahora: exige envolver
  // cada lectura dinámica de Firestore en `use cache`/Suspense (refactor transversal), y sin
  // ello rompe el build. Activar cuando esas fronteras estén definidas.
  // cacheComponents: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
