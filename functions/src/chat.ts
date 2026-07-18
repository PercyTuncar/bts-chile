// ARMY Chat — envío de mensajes con enforcement en el servidor (§8.x).
// Único punto de escritura de mensajes: valida membresía, rate-limit + cooldown
// aleatorio por plan, límite de caracteres y sanitiza el HTML. Los clientes NO pueden
// escribir mensajes directamente (ver firestore.rules: create/update/delete = false).
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "./admin";
import { sanitizeChatHtml } from "./lib/sanitizeHtml";

const ROOM_ID = "army-chat";

// Límites por plan (espejo de lib/membership.ts del front).
const BURST: Record<string, number> = { basic: 5, premium: 8, vip: 12 };
const COOLDOWN: Record<string, { min: number; max: number }> = {
  basic: { min: 3000, max: 5000 },
  premium: { min: 2000, max: 3000 },
  vip: { min: 1000, max: 2000 },
};
const CHAR_LIMIT: Record<string, number> = { basic: 500, premium: 800, vip: 1200 };

interface SendData {
  text?: string;
  richContent?: string | null;
  imageURL?: string | null;
}

export const sendArmyChatMessage = onCall<SendData>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");

  // 1) Perfil, membresía y rol.
  const userSnap = await db.collection("users").doc(uid).get();
  if (!userSnap.exists) throw new HttpsError("failed-precondition", "Completa tu perfil primero.");
  const user = userSnap.data() as Record<string, unknown>;
  const role = String(user.role ?? "user");
  const membership = String(user.membershipType ?? "free");
  const isAdmin = role === "admin";

  if (!isAdmin && (membership === "free" || membership === undefined)) {
    throw new HttpsError("permission-denied", "Solo los miembros ARMY pueden escribir en el chat.");
  }

  // Moderación (Fase 2): ban, mute y chat cerrado (el admin nunca se bloquea).
  if (!isAdmin) {
    if (user.isBanned === true) {
      throw new HttpsError("permission-denied", "Has sido baneado del ARMY Chat.");
    }
    const mutedUntil = user.mutedUntil as Timestamp | undefined | null;
    if (mutedUntil && Timestamp.now().toMillis() < mutedUntil.toMillis()) {
      throw new HttpsError("permission-denied", "Estás silenciado en el chat.", {
        mutedUntil: mutedUntil.toMillis(),
      });
    }
    const roomSnap = await db.collection("chatRooms").doc(ROOM_ID).get();
    if (roomSnap.exists && roomSnap.get("isOpen") === false) {
      throw new HttpsError("failed-precondition", "El chat está cerrado por el momento.");
    }
  }

  // 2) Validar contenido.
  const text = (request.data.text ?? "").trim();
  const imageURL = request.data.imageURL ?? null;
  const richContent = request.data.richContent ? sanitizeChatHtml(request.data.richContent) : null;

  if (!text && !imageURL) {
    throw new HttpsError("invalid-argument", "El mensaje está vacío.");
  }
  if (imageURL && !/^https:\/\//i.test(imageURL)) {
    throw new HttpsError("invalid-argument", "Imagen inválida.");
  }
  const charLimit = isAdmin ? 2000 : (CHAR_LIMIT[membership] ?? 500);
  if (text.length > charLimit) {
    throw new HttpsError("invalid-argument", `Máximo ${charLimit} caracteres.`);
  }

  const now = Timestamp.now();
  const rateRef = db.collection("armyChatRate").doc(uid);

  // 3) Rate-limit por plan (el admin no tiene límite).
  let cooldownUntil: Timestamp | null = null;
  let burstRemaining = 0;
  if (!isAdmin) {
    const burstLimit = BURST[membership] ?? 5;
    const range = COOLDOWN[membership] ?? { min: 3000, max: 5000 };
    const rateSnap = await rateRef.get();
    const state = rateSnap.data() as Record<string, unknown> | undefined;

    const prevCooldown = state?.cooldownUntil as Timestamp | undefined | null;
    if (prevCooldown && now.toMillis() < prevCooldown.toMillis()) {
      throw new HttpsError("resource-exhausted", "Espera antes de enviar otro mensaje.", {
        cooldownUntil: prevCooldown.toMillis(),
      });
    }

    // Reinicia el burst si venía de un cooldown ya cumplido (o si no había estado).
    const hadCooldown = !!prevCooldown;
    let remaining =
      hadCooldown || state?.burstRemaining == null
        ? burstLimit
        : (state.burstRemaining as number);

    remaining -= 1; // consume este mensaje
    if (remaining <= 0) {
      const wait = range.min + Math.floor(Math.random() * (range.max - range.min + 1));
      cooldownUntil = Timestamp.fromMillis(now.toMillis() + wait);
      remaining = burstLimit; // listo para después del cooldown
    }
    burstRemaining = remaining;

    await rateRef.set(
      { burstRemaining, cooldownUntil, updatedAt: now },
      { merge: true },
    );
  }

  // 4) Escribir el mensaje (Admin SDK) + actualizar contadores del room.
  const photoURL =
    (user.customPhotoURL as string | null) || (user.photoURL as string | null) || null;
  const msgRef = db.collection("chatRooms").doc(ROOM_ID).collection("messages").doc();
  await msgRef.set({
    senderUid: uid,
    senderNickname: (user.nickname as string) || (user.displayName as string) || "ARMY",
    senderUsername: (user.username as string) || uid,
    senderPhotoURL: photoURL,
    senderMembership: membership,
    senderRole: role,
    text,
    richContent,
    imageURL,
    createdAt: now,
    editedAt: null,
    deleted: false,
    deletedBy: null,
    pinned: false,
  });

  await db.collection("chatRooms").doc(ROOM_ID).set(
    { messageCount: FieldValue.increment(1), lastMessageAt: now },
    { merge: true },
  );

  logger.info(`ARMY Chat: ${uid} envió mensaje ${msgRef.id}.`);
  return {
    id: msgRef.id,
    cooldownUntil: cooldownUntil ? cooldownUntil.toMillis() : null,
    burstRemaining,
  };
});

const msgRef = (id: string) =>
  db.collection("chatRooms").doc(ROOM_ID).collection("messages").doc(id);

// Editar un mensaje propio (§8.x, Fase 2). El admin también puede editar para moderar.
export const editChatMessage = onCall<{ messageId: string; text?: string; richContent?: string | null }>(
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");

    const { messageId } = request.data;
    if (!messageId) throw new HttpsError("invalid-argument", "Falta el mensaje.");

    const snap = await msgRef(messageId).get();
    if (!snap.exists) throw new HttpsError("not-found", "El mensaje no existe.");
    const msg = snap.data() as Record<string, unknown>;
    if (msg.deleted === true) throw new HttpsError("failed-precondition", "El mensaje fue eliminado.");

    const userSnap = await db.collection("users").doc(uid).get();
    const isAdmin = userSnap.get("role") === "admin";
    if (msg.senderUid !== uid && !isAdmin) {
      throw new HttpsError("permission-denied", "Solo puedes editar tus mensajes.");
    }

    const membership = String(userSnap.get("membershipType") ?? "free");
    const text = (request.data.text ?? "").trim();
    const richContent = request.data.richContent ? sanitizeChatHtml(request.data.richContent) : null;
    if (!text) throw new HttpsError("invalid-argument", "El mensaje no puede quedar vacío.");
    const charLimit = isAdmin ? 2000 : (CHAR_LIMIT[membership] ?? 500);
    if (text.length > charLimit) throw new HttpsError("invalid-argument", `Máximo ${charLimit} caracteres.`);

    await msgRef(messageId).update({ text, richContent, editedAt: Timestamp.now() });
    return { ok: true };
  },
);

// Eliminar un mensaje (§8.x, Fase 2): autor o admin. Soft-delete: el contenido se
// mueve a una subcolección SOLO-admin (`deletedContent`) y se limpia del mensaje →
// "sin rastro" para el resto, pero el admin puede ver quién borró y el contenido.
export const deleteChatMessage = onCall<{ messageId: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");

  const { messageId } = request.data;
  if (!messageId) throw new HttpsError("invalid-argument", "Falta el mensaje.");

  const snap = await msgRef(messageId).get();
  if (!snap.exists) throw new HttpsError("not-found", "El mensaje no existe.");
  const msg = snap.data() as Record<string, unknown>;
  if (msg.deleted === true) return { ok: true }; // idempotente

  const userSnap = await db.collection("users").doc(uid).get();
  const isAdmin = userSnap.get("role") === "admin";
  if (msg.senderUid !== uid && !isAdmin) {
    throw new HttpsError("permission-denied", "No puedes eliminar este mensaje.");
  }

  const now = Timestamp.now();
  // Archivo solo-admin con el contenido original.
  await db
    .collection("chatRooms").doc(ROOM_ID)
    .collection("deletedContent").doc(messageId)
    .set({
      text: msg.text ?? "",
      richContent: msg.richContent ?? null,
      imageURL: msg.imageURL ?? null,
      senderUid: msg.senderUid ?? null,
      senderNickname: msg.senderNickname ?? "",
      deletedBy: uid,
      deletedByNickname: (userSnap.get("nickname") as string) || "Admin",
      byAdmin: isAdmin && msg.senderUid !== uid,
      deletedAt: now,
    });

  // Limpia el mensaje visible.
  await msgRef(messageId).update({
    deleted: true,
    deletedBy: uid,
    text: "",
    richContent: null,
    imageURL: null,
  });

  return { ok: true };
});
