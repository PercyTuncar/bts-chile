// Emails automáticos: cumpleaños y confirmación de pedido — PRD §4.6, §6.1.
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { db } from "./admin";
import { enqueueEmail } from "./lib/mail";

const TZ = "America/Santiago";

/** Cumpleaños del día en zona America/Santiago. */
function todayInSantiago(): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return {
    month: Number(parts.find((p) => p.type === "month")?.value),
    day: Number(parts.find((p) => p.type === "day")?.value),
  };
}

/**
 * `birthdayEmailsDaily` (§4.6): 08:00 America/Santiago, envía saludo de cumpleaños.
 */
export const birthdayEmailsDaily = onSchedule(
  { schedule: "0 8 * * *", timeZone: TZ },
  async () => {
    const { month, day } = todayInSantiago();
    const snap = await db
      .collection("users")
      .where("birthMonth", "==", month)
      .where("birthDay", "==", day)
      .get();

    let sent = 0;
    for (const doc of snap.docs) {
      const u = doc.data();
      if (!u.email) continue;
      await enqueueEmail(
        u.email,
        "¡Feliz cumpleaños de parte de BTS Chile! 🎂💜",
        `<p>Hola ${u.nickname ?? "ARMY"}, ¡todo el equipo de BTS Chile te desea un feliz cumpleaños! 💜</p>`,
      );
      sent++;
    }
    logger.info(`birthdayEmailsDaily: ${sent} saludos enviados (${day}/${month}).`);
  },
);

/**
 * `orderConfirmationEmail` (§6.1): al confirmarse o entregarse un pedido, envía
 * email con instrucciones de entrega.
 */
export const orderConfirmationEmail = onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!after) return;

    const changedTo = (status: string) =>
      before?.status !== status && after.status === status;

    if (changedTo("confirmed")) {
      await enqueueEmail(
        after.buyerEmail,
        "Pago confirmado — BTS Chile 🎟💜",
        `<p>Hola ${after.buyerName ?? "ARMY"}, confirmamos tu pago del pedido <b>${event.params.orderId}</b> (${after.zoneName}). Recibirás tus entradas por email dentro de 24-48 horas hábiles.</p>`,
      );
      logger.info(`orderConfirmationEmail: confirmación enviada (${event.params.orderId}).`);
    } else if (changedTo("delivered")) {
      await enqueueEmail(
        after.buyerEmail,
        "¡Tus entradas están listas! 🎟💜",
        `<p>Hola ${after.buyerName ?? "ARMY"}, tus entradas para BTS WORLD TOUR ARIRANG ya fueron enviadas. ¡Nos vemos en el Estadio Nacional! 💜</p>`,
      );
      logger.info(`orderConfirmationEmail: entrega enviada (${event.params.orderId}).`);
    }
  },
);
