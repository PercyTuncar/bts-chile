import { NextRequest, NextResponse } from "next/server";
import { notifyIndexNow } from "@/lib/seo/indexnow";

export const dynamic = "force-dynamic";

/**
 * Webhook para notificar URLs a IndexNow.
 * Se puede llamar desde Cloud Functions o desde el cliente después de publicar.
 *
 * POST /api/indexnow
 * Body: { url: string } o { urls: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, urls } = body;

    if (!url && (!urls || urls.length === 0)) {
      return NextResponse.json(
        { error: "Se requiere 'url' o 'urls'" },
        { status: 400 }
      );
    }

    if (url) {
      // Notificar una sola URL
      const success = await notifyIndexNow(url);
      return NextResponse.json({
        success,
        url,
        message: success
          ? "URL notificada a IndexNow"
          : "Error notificando a IndexNow",
      });
    }

    if (urls && Array.isArray(urls)) {
      // Notificar múltiples URLs
      const results = await Promise.all(
        urls.map(async (u: string) => {
          const success = await notifyIndexNow(u);
          return { url: u, success };
        })
      );

      const successCount = results.filter((r) => r.success).length;

      return NextResponse.json({
        success: successCount > 0,
        total: urls.length,
        successful: successCount,
        failed: urls.length - successCount,
        results,
      });
    }

    return NextResponse.json(
      { error: "Formato de request inválido" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en webhook IndexNow:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
