// Membresías: prueba de bienvenida, expiración y recordatorio — PRD §10.3, §10.6.
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db, THIRTY_DAYS_MS } from "./admin";
import { enqueueEmail } from "./lib/mail";

const TZ = "America/Santiago";

/**
 * 🎁 Prueba gratuita de bienvenida (§10.3).
 * onCreate de users/{uid}: otorga 1 mes de ARMY Basic si no la ha usado.
 * Toda la lógica vive en el servidor (no manipulable por el cliente).
 */
export const grantWelcomeTrial = onDocumentCreated("users/{uid}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const data = snap.data();
  if (data?.hasUsedWelcomeTrial === true) {
    logger.info(`grantWelcomeTrial: ${event.params.uid} ya usó la prueba, se omite.`);
    return;
  }

  const now = Timestamp.now();
  const expiry = Timestamp.fromMillis(now.toMillis() + THIRTY_DAYS_MS);

  await snap.ref.update({
    membershipType: "basic",
    membershipStatus: "trialing",
    isTrial: true,
    membershipSource: "welcome_trial",
    membershipExpiry: expiry,
    hasUsedWelcomeTrial: true,
  });

  await db.collection("memberships").add({
    uid: event.params.uid,
    membershipType: "basic",
    periodicity: "trial",
    priceUSD: 0,
    startDate: now,
    endDate: expiry,
    status: "trialing",
    source: "welcome_trial",
    isTrial: true,
    grantedBy: null,
    paypalSubscriptionId: null,
    paymentMethod: "trial",
    createdAt: now,
  });

  logger.info(`grantWelcomeTrial: mes gratis de ARMY Basic otorgado a ${event.params.uid}.`);
});

/**
 * ⏰ Expiración y desactivación automática (§10.6).
 * Diaria 00:15 America/Santiago: degrada a `free` a quien venció sin PayPal activo.
 */
export const membershipExpiryCron = onSchedule(
  { schedule: "15 0 * * *", timeZone: TZ },
  async () => {
    const now = Timestamp.now();
    // membershipExpiry <= now (los `free` con expiry null quedan excluidos del rango).
    const snap = await db
      .collection("users")
      .where("membershipExpiry", "<=", now)
      .get();

    let degraded = 0;
    const batch = db.batch();

    for (const doc of snap.docs) {
      const u = doc.data();
      if (u.membershipType === "free") continue;
      const hasActivePaypal =
        u.membershipStatus === "active" && !!u.paypalSubscriptionId;
      if (hasActivePaypal) continue; // la renovación llega por webhook PAYMENT.SALE.COMPLETED

      batch.update(doc.ref, {
        membershipType: "free",
        membershipStatus: "expired",
        isTrial: false,
        membershipExpiry: null,
      });
      batch.set(db.collection("memberships").doc(), {
        uid: doc.id,
        membershipType: u.membershipType,
        periodicity: "trial",
        priceUSD: 0,
        startDate: u.membershipExpiry ?? now,
        endDate: now,
        status: "expired",
        source: u.membershipSource ?? "manual",
        isTrial: !!u.isTrial,
        grantedBy: null,
        paypalSubscriptionId: u.paypalSubscriptionId ?? null,
        paymentMethod: null,
        createdAt: now,
      });
      degraded++;

      if (u.email) {
        await enqueueEmail(
          u.email,
          "Tu acceso ARMY terminó 💜",
          `<p>Hola ${u.nickname ?? "ARMY"}, tu membresía terminó. Renueva por solo $1 USD/mes para seguir publicando en la comunidad.</p>`,
        );
      }
    }

    await batch.commit();
    logger.info(`membershipExpiryCron: ${degraded} usuarios degradados a free.`);
  },
);

/**
 * Recordatorio previo (§10.6): 3 días antes de vencer, email con CTA a renovar.
 * Diaria 09:30 America/Santiago.
 */
export const membershipExpiryReminder = onSchedule(
  { schedule: "30 9 * * *", timeZone: TZ },
  async () => {
    const now = Timestamp.now();
    const in3Days = Timestamp.fromMillis(now.toMillis() + 3 * 24 * 60 * 60 * 1000);

    const snap = await db
      .collection("users")
      .where("membershipExpiry", ">", now)
      .where("membershipExpiry", "<=", in3Days)
      .get();

    let sent = 0;
    for (const doc of snap.docs) {
      const u = doc.data();
      if (u.membershipType === "free") continue;
      if (u.membershipStatus === "active" && u.paypalSubscriptionId) continue;
      if (u.email) {
        await enqueueEmail(
          u.email,
          "Tu membresía ARMY vence pronto ⏰💜",
          `<p>Hola ${u.nickname ?? "ARMY"}, tu acceso vence en pocos días. Mantén tu membresía por solo $1 USD/mes con PayPal.</p>`,
        );
        sent++;
      }
    }
    logger.info(`membershipExpiryReminder: ${sent} recordatorios enviados.`);
  },
);
