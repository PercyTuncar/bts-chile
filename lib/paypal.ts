// Helpers de PayPal (SOLO SERVIDOR) — token OAuth + verificación de webhook. PRD §10.5.
import "server-only";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/** Token de acceso OAuth2 (client_credentials). */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const secret = process.env.PAYPAL_CLIENT_SECRET ?? "";
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface WebhookHeaders {
  transmissionId: string;
  transmissionTime: string;
  transmissionSig: string;
  certUrl: string;
  authAlgo: string;
}

/**
 * Verifica la firma del webhook contra PayPal (§10.5). Devuelve true si es válida.
 * Requiere PAYPAL_WEBHOOK_ID.
 */
export async function verifyWebhookSignature(
  headers: WebhookHeaders,
  event: unknown,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  try {
    const token = await getPayPalAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers.authAlgo,
        cert_url: headers.certUrl,
        transmission_id: headers.transmissionId,
        transmission_sig: headers.transmissionSig,
        transmission_time: headers.transmissionTime,
        webhook_id: webhookId,
        webhook_event: event,
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { verification_status: string };
    return data.verification_status === "SUCCESS";
  } catch (err) {
    // Credenciales mock o red caída → firma no verificable (se rechaza con 400).
    console.warn("verifyWebhookSignature falló:", err);
    return false;
  }
}

/** Mapea un plan_id de PayPal al tier de membresía. */
export function planIdToTier(planId: string | undefined): "basic" | "premium" | "vip" | null {
  if (!planId) return null;
  if (planId === process.env.PAYPAL_PLAN_ID_BASIC) return "basic";
  if (planId === process.env.PAYPAL_PLAN_ID_PREMIUM) return "premium";
  if (planId === process.env.PAYPAL_PLAN_ID_VIP) return "vip";
  return null;
}
