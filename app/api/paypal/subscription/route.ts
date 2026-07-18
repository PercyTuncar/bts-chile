// Guarda el subscriptionID provisional tras onApprove — PRD §10.5.
// La activación REAL la hace el webhook (fuente de verdad = PayPal).
import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const { subscriptionID } = (await req.json()) as { subscriptionID?: string };
    if (!subscriptionID) {
      return NextResponse.json({ error: "Falta subscriptionID" }, { status: 400 });
    }

    // Solo el propio usuario puede asociar su suscripción provisional.
    await getAdminDb().collection("users").doc(decoded.uid).update({
      paypalSubscriptionId: subscriptionID,
      membershipStatus: "pending",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("paypal/subscription:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
