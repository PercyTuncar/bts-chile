/**
 * Cliente IndexNow para notificación instantánea de nuevas URLs a Bing y Yandex.
 * Gratis, aumenta velocidad de indexación.
 *
 * Documentación: https://www.indexnow.org/documentation
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.btschile.com";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? ""; // Genera una key única en indexnow.org

/**
 * Notifica a IndexNow que una URL ha sido creada o actualizada.
 * Llama a esto después de publicar una noticia.
 */
export async function notifyIndexNow(url: string): Promise<boolean> {
  if (!INDEXNOW_KEY) {
    console.warn("INDEXNOW_KEY no configurada. Saltando notificación IndexNow.");
    return false;
  }

  try {
    const endpoint = "https://api.indexnow.org/indexnow";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        urlList: [url],
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`✅ IndexNow notificado: ${url}`);
      return true;
    } else {
      console.error(`❌ IndexNow error: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Error llamando a IndexNow:", error);
    return false;
  }
}

/**
 * Notifica múltiples URLs a la vez (hasta 10,000 por request).
 * Útil para actualizaciones masivas.
 */
export async function notifyIndexNowBatch(urls: string[]): Promise<boolean> {
  if (!INDEXNOW_KEY) {
    console.warn("INDEXNOW_KEY no configurada. Saltando notificación IndexNow.");
    return false;
  }

  if (urls.length === 0) return true;

  try {
    const endpoint = "https://api.indexnow.org/indexnow";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        urlList: urls.slice(0, 10000), // Máximo 10,000 URLs
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`✅ IndexNow notificado: ${urls.length} URLs`);
      return true;
    } else {
      console.error(`❌ IndexNow error: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Error llamando a IndexNow:", error);
    return false;
  }
}

/**
 * Genera el contenido del archivo de verificación IndexNow.
 * Debe servirse en: https://tudominio.com/{INDEXNOW_KEY}.txt
 * El contenido del archivo es simplemente la key.
 */
export function generateIndexNowKeyFile(): string {
  return INDEXNOW_KEY;
}
