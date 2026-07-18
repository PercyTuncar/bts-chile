import type { NextConfig } from "next";

// Configuración base — PRD §17 / §3.5 (Core Web Vitals).
const nextConfig: NextConfig = {
  images: {
    // Dominios remotos permitidos para next/image (PRD §17).
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // PPR (Partial Prerendering) — en Next 16 se habilita vía `cacheComponents: true`.
  // Palanca de Core Web Vitals (PRD §3.5, §17). Queda DESACTIVADO por ahora: exige envolver
  // cada lectura dinámica de Firestore en `use cache`/Suspense (refactor transversal), y sin
  // ello rompe el build. Activar cuando esas fronteras estén definidas.
  // cacheComponents: true,
};

export default nextConfig;
