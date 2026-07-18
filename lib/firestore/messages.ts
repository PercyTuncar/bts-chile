// Mensajería privada (cliente) — Etapa 3. conversations/{convId} + subcolección messages.
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type WithFieldValue,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { conversationsCol } from "./collections";
import { makeConverter } from "./converters";
import type { Conversation, Message, ParticipantInfo, WithId } from "@/types";

export interface Participant extends ParticipantInfo {
  uid: string;
}

/** Id determinista de la conversación entre dos usuarios. */
export function conversationId(a: string, b: string): string {
  return [a, b].sort().join("_");
}

function messagesCollection(convId: string) {
  return collection(db, "conversations", convId, "messages").withConverter(
    makeConverter<Message>(),
  );
}

function toInfo(p: Participant): ParticipantInfo {
  return { username: p.username, nickname: p.nickname, photoURL: p.photoURL };
}

/** Crea la conversación si no existe; devuelve su id. */
export async function getOrCreateConversation(
  me: Participant,
  other: Participant,
): Promise<string> {
  const convId = conversationId(me.uid, other.uid);
  const ref = doc(conversationsCol, convId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: WithFieldValue<Conversation> = {
      participants: [me.uid, other.uid],
      participantInfo: { [me.uid]: toInfo(me), [other.uid]: toInfo(other) },
      lastMessage: "",
      lastSenderUid: null,
      unread: { [me.uid]: 0, [other.uid]: 0 },
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
  }
  return convId;
}

export async function getConversation(convId: string): Promise<Conversation | null> {
  const snap = await getDoc(doc(conversationsCol, convId));
  return snap.exists() ? snap.data() : null;
}

export async function sendMessage(
  convId: string,
  senderUid: string,
  otherUid: string,
  data: { text: string; imageURL: string | null },
): Promise<void> {
  await addDoc(messagesCollection(convId), {
    senderUid,
    text: data.text,
    imageURL: data.imageURL,
    createdAt: serverTimestamp() as never,
  });
  await updateDoc(doc(conversationsCol, convId), {
    lastMessage: data.imageURL ? "📷 Imagen" : data.text,
    lastSenderUid: senderUid,
    updatedAt: serverTimestamp(),
    [`unread.${otherUid}`]: increment(1),
  });
}

/** Bandeja: conversaciones del usuario (más recientes primero). */
export function subscribeConversations(
  uid: string,
  cb: (items: WithId<Conversation>[]) => void,
): () => void {
  const q = query(
    conversationsCol,
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export function subscribeMessages(
  convId: string,
  cb: (items: WithId<Message>[]) => void,
): () => void {
  const q = query(messagesCollection(convId), orderBy("createdAt", "asc"), fbLimit(200));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function markConversationRead(convId: string, uid: string): Promise<void> {
  await updateDoc(doc(conversationsCol, convId), { [`unread.${uid}`]: 0 });
}
