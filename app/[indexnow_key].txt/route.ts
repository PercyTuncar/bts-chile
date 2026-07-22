import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Archivo de verificación de IndexNow.
 * Debe servirse en: https://tudominio.com/{INDEXNOW_KEY}.txt
 *
 * IMPORTANTE: Genera tu propia key en https://www.indexnow.org/
 * y agrégala a tus variables de entorno como INDEXNOW_KEY
 */
export async function GET() {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return new NextResponse("IndexNow key not configured", { status: 404 });
  }

  return new NextResponse(key, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
