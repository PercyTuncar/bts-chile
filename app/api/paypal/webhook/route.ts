// Webhook de PayPal — activa/renueva/degrada la membresía en automático. PRD §10.5.
// Verifica firma, aplica idempotencia (paypalEvents), mapea subscription→uid y actúa por evento.
import { NextResponse, type NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { planIdToTier, verifyWebhookSignature } from "@/lib/paypal";
import type { MembershipStatus, MembershipType } from "@/types";

export const runtime = "nodejs";

function addOneMonth(from: Date): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d;
}

interface PayPalResource {
  id?: string;
  billing_agreement_id?: string;
  custom_id?: string;
  plan_id?: string;
}

async function resolveUid(
  resource: PayPalResource,
  subscriptionId: string | null,
): Promise<string | null> {
  if (resource.custom_id) return resource.custom_id;
  if (!subscriptionId) return null;
  const snap = await getAdminDb()
    .collection("users")
    .where("paypalSubscriptionId", "==", subscriptionId)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0].id;
}

async function logMembership(
  uid: string,
  type: MembershipType,
  status: string,
  subscriptionId: string | null,
  priceUSD: number,
) {
  const now = Timestamp.now();
  await getAdminDb().collection("memberships").add({
    uid,
    membershipType: type,
    periodicity: "monthly",
    priceUSD,
    startDate: now,
    endDate: null,
    status,
    source: "paypal",
    isTrial: false,
    grantedBy: null,
    paypalSubscriptionId: subscriptionId,
    paymentMethod: "paypal",
    createdAt: now,
  });
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  let event: { id?: string; event_type?: string; resource?: PayPalResource };
  try {
    event = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // 1) Verificación de firma.
  const verified = await verifyWebhookSignature(
    {
      transmissionId: req.headers.get("paypal-transmission-id") ?? "",
      transmissionTime: req.headers.get("paypal-transmission-time") ?? "",
      transmissionSig: req.headers.get("paypal-transmission-sig") ?? "",
      certUrl: req.headers.get("paypal-cert-url") ?? "",
      authAlgo: req.headers.get("paypal-auth-algo") ?? "",
    },
    event,
  );
  if (!verified) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const eventId = event.id;
  const eventType = event.event_type ?? "";
  if (!eventId) return NextResponse.json({ error: "Sin event.id" }, { status: 400 });

  // 2) Idempotencia: si ya se procesó este event.id, ignorar.
  const eventRef = getAdminDb().collection("paypalEvents").doc(eventId);
  const existing = await eventRef.get();
  if (existing.exists) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const resource = event.resource ?? {};
  const subscriptionId = resource.id ?? resource.billing_agreement_id ?? null;
  const uid = await resolveUid(resource, subscriptionId);

  // 3) Acciones por evento (§10.5).
  if (uid) {
    const userRef = getAdminDb().collection("users").doc(uid);
    const now = new Date();

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const tier = planIdToTier(resource.plan_id) ?? "basic";
        await userRef.update({
          membershipType: tier,
          membershipStatus: "active" satisfies MembershipStatus,
          isTrial: false,
          membershipSource: "paypal",
          paypalSubscriptionId: subscriptionId,
          membershipExpiry: Timestamp.fromDate(addOneMonth(now)),
        });
        await logMembership(uid, tier, "active", subscriptionId, 0);
        break;
      }
      case "PAYMENT.SALE.COMPLETED": {
        // Renovación: expiry = max(actual, ahora) + 1 mes.
        const snap = await userRef.get();
        const current = snap.get("membershipExpiry") as Timestamp | null;
        const base =
          current && current.toMillis() > now.getTime() ? current.toDate() : now;
        await userRef.update({
          membershipStatus: "active" satisfies MembershipStatus,
          membershipExpiry: Timestamp.fromDate(addOneMonth(base)),
        });
        await logMembership(
          uid,
          (snap.get("membershipType") as MembershipType) ?? "basic",
          "active",
          subscriptionId,
          0,
        );
        break;
      }
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        await userRef.update({ membershipStatus: "past_due" satisfies MembershipStatus });
        break;
      }
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        await userRef.update({ membershipStatus: "suspended" satisfies MembershipStatus });
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        await userRef.update({ membershipStatus: "cancelled" satisfies MembershipStatus });
        break;
      }
      default:
        // Evento no accionable; se registra igual para auditoría.
        break;
    }
  }

  // 4) Registro de auditoría / idempotencia.
  await eventRef.set({
    eventType,
    subscriptionId,
    uidResolved: uid,
    rawResource: resource as Record<string, unknown>,
    processed: true,
    receivedAt: Timestamp.now(),
  });

  return NextResponse.json({ ok: true });
}
