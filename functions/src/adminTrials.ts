// Pruebas gratuitas otorgadas por el admin — PRD §10.4.
// Callable que valida role == "admin" y activa una prueba (por días o rango de fechas).
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "./admin";

type PlanType = "basic" | "premium" | "vip";

interface GrantAdminTrialData {
  targetUid: string;
  plan: PlanType;
  /** Modalidad por días: número de días desde ahora. */
  days?: number;
  /** Modalidad por rango: fecha fin en ms epoch. */
  endDateMs?: number;
}

export const grantAdminTrial = onCall<GrantAdminTrialData>(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  // Validar que el llamante es admin.
  const callerSnap = await db.collection("users").doc(callerUid).get();
  if (callerSnap.get("role") !== "admin") {
    throw new HttpsError("permission-denied", "Solo un administrador puede otorgar pruebas.");
  }

  const { targetUid, plan, days, endDateMs } = request.data;
  if (!targetUid || !plan) {
    throw new HttpsError("invalid-argument", "Faltan datos (usuario o plan).");
  }
  if (!["basic", "premium", "vip"].includes(plan)) {
    throw new HttpsError("invalid-argument", "Plan inválido.");
  }

  // Calcular fecha de expiración (por días o por rango).
  let expiry: Timestamp;
  if (typeof endDateMs === "number") {
    expiry = Timestamp.fromMillis(endDateMs);
  } else if (typeof days === "number" && days > 0) {
    expiry = Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000);
  } else {
    throw new HttpsError("invalid-argument", "Indica días o un rango de fechas.");
  }

  const now = Timestamp.now();
  await db.collection("users").doc(targetUid).update({
    membershipType: plan,
    membershipStatus: "trialing",
    isTrial: true,
    membershipSource: "admin_trial",
    trialGrantedBy: callerUid,
    membershipExpiry: expiry,
  });

  await db.collection("memberships").add({
    uid: targetUid,
    membershipType: plan,
    periodicity: "trial",
    priceUSD: 0,
    startDate: now,
    endDate: expiry,
    status: "trialing",
    source: "admin_trial",
    isTrial: true,
    grantedBy: callerUid,
    paypalSubscriptionId: null,
    paymentMethod: "trial",
    createdAt: now,
  });

  logger.info(
    `grantAdminTrial: ${callerUid} otorgó prueba ${plan} a ${targetUid} hasta ${expiry.toDate().toISOString()}.`,
  );
  return { ok: true, expiry: expiry.toMillis() };
});
