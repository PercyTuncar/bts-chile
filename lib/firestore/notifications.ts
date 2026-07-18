// Notificaciones (cliente) — Etapa 2.
import {
  doc,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Notification, WithId } from "@/types";
import { notificationsCol } from "./collections";

/** Suscripción realtime a mis notificaciones (recientes primero). */
export function subscribeNotifications(
  uid: string,
  cb: (items: WithId<Notification>[]) => void,
  max = 30,
): () => void {
  const q = query(
    notificationsCol,
    where("recipientUid", "==", uid),
    orderBy("createdAt", "desc"),
    fbLimit(max),
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(notificationsCol, id), { read: true });
}

export async function markAllNotificationsRead(
  items: WithId<Notification>[],
): Promise<void> {
  await Promise.all(items.filter((n) => !n.read).map((n) => markNotificationRead(n.id)));
}
