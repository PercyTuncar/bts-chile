// ARMY Chat (grupal) — acceso a datos de lectura (cliente) — §8.x.
// Escritura de mensajes: SOLO vía Cloud Function (lib/functions.ts → sendArmyChatMessage).
// Aquí solo hay lecturas en tiempo real + carga progresiva por cursor.
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { makeConverter } from "./converters";
import type { ChatMessage, ChatRateState, ChatRoom, User, WithId } from "@/types";

export const ARMY_CHAT_ROOM_ID = "army-chat";
export const CHAT_PAGE_SIZE = 30;

const messageConverter = makeConverter<ChatMessage>();

function messagesCollection() {
  return collection(db, "chatRooms", ARMY_CHAT_ROOM_ID, "messages").withConverter(messageConverter);
}
function roomDoc() {
  return doc(db, "chatRooms", ARMY_CHAT_ROOM_ID).withConverter(makeConverter<ChatRoom>());
}
function rateDoc(uid: string) {
  return doc(db, "armyChatRate", uid).withConverter(makeConverter<ChatRateState>());
}

export type ChatCursor = QueryDocumentSnapshot<ChatMessage> | null;

/**
 * Suscribe a los últimos `pageSize` mensajes (los más recientes) en tiempo real.
 * Devuelve la lista en orden ascendente (viejo→nuevo) y el cursor al mensaje más
 * antiguo del lote (para cargar más hacia atrás). Cargas eficientes: solo la ventana viva.
 */
export function subscribeLatestMessages(
  cb: (items: WithId<ChatMessage>[], oldest: ChatCursor) => void,
  pageSize = CHAT_PAGE_SIZE,
): () => void {
  const q = query(messagesCollection(), orderBy("createdAt", "desc"), fbLimit(pageSize));
  return onSnapshot(q, (snap) => {
    const docs = snap.docs;
    const items = docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
    const oldest = docs.length > 0 ? docs[docs.length - 1] : null;
    cb(items, oldest);
  });
}

/** Carga una página de mensajes más antiguos (scroll hacia arriba). */
export async function loadOlderMessages(
  before: QueryDocumentSnapshot<ChatMessage>,
  pageSize = CHAT_PAGE_SIZE,
): Promise<{ items: WithId<ChatMessage>[]; oldest: ChatCursor }> {
  const q = query(
    messagesCollection(),
    orderBy("createdAt", "desc"),
    startAfter(before),
    fbLimit(pageSize),
  );
  const snap = await getDocs(q);
  const docs = snap.docs;
  const items = docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
  const oldest = docs.length === pageSize ? docs[docs.length - 1] : null;
  return { items, oldest };
}

export function subscribeChatRoom(cb: (room: ChatRoom | null) => void): () => void {
  return onSnapshot(roomDoc(), (snap) => cb(snap.exists() ? snap.data() : null));
}

/** Estado de rate-limit del propio usuario (para pintar el cooldown tras recargar). */
export function subscribeMyRate(
  uid: string,
  cb: (state: ChatRateState | null) => void,
): () => void {
  return onSnapshot(rateDoc(uid), (snap) => cb(snap.exists() ? snap.data() : null));
}

export async function getChatMessage(id: string): Promise<WithId<ChatMessage> | null> {
  const snap = await getDoc(doc(messagesCollection(), id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// --------------------------------------------------------------------------
// Moderación (Fase 2) — acciones de admin. Las reglas permiten escribir room/users
// solo a isAdmin(); el enforcement de mute/ban/cerrado vive en la Cloud Function.
// --------------------------------------------------------------------------
function roomWriteRef() {
  return doc(db, "chatRooms", ARMY_CHAT_ROOM_ID);
}
function userWriteRef(uid: string) {
  return doc(db, "users", uid);
}

/** Abrir/cerrar el chat para todos (admin). */
export async function setChatOpen(isOpen: boolean): Promise<void> {
  await setDoc(roomWriteRef(), { isOpen }, { merge: true });
}

/** Fijar (o desfijar con null) un mensaje (admin). */
export async function setPinnedMessage(messageId: string | null): Promise<void> {
  await setDoc(roomWriteRef(), { pinnedMessageId: messageId }, { merge: true });
}

/** Silenciar a un usuario N minutos (admin). */
export async function muteUser(uid: string, minutes: number): Promise<void> {
  await updateDoc(userWriteRef(uid), {
    isMuted: true,
    mutedUntil: Timestamp.fromMillis(Date.now() + minutes * 60_000),
  });
}
export async function unmuteUser(uid: string): Promise<void> {
  await updateDoc(userWriteRef(uid), { isMuted: false, mutedUntil: null });
}

/** Banear / desbanear a un usuario del chat (admin). */
export async function banUser(uid: string): Promise<void> {
  await updateDoc(userWriteRef(uid), { isBanned: true });
}
export async function unbanUser(uid: string): Promise<void> {
  await updateDoc(userWriteRef(uid), { isBanned: false });
}

export interface DeletedArchive {
  text: string;
  richContent: string | null;
  imageURL: string | null;
  senderNickname: string;
  deletedByNickname: string;
  byAdmin: boolean;
}

/** Suscripción al contenido de mensajes borrados (SOLO admin lo puede leer). */
export function subscribeDeletedContent(
  cb: (map: Record<string, DeletedArchive>) => void,
): () => void {
  const col = collection(db, "chatRooms", ARMY_CHAT_ROOM_ID, "deletedContent");
  return onSnapshot(col, (snap) => {
    const map: Record<string, DeletedArchive> = {};
    snap.forEach((d) => {
      map[d.id] = d.data() as DeletedArchive;
    });
    cb(map);
  });
}

/** Usuarios silenciados y baneados (para el mini-panel admin). */
export async function getModeratedUsers(): Promise<{
  muted: WithId<User>[];
  banned: WithId<User>[];
}> {
  const usersCol = collection(db, "users").withConverter(makeConverter<User>());
  const [mutedSnap, bannedSnap] = await Promise.all([
    getDocs(query(usersCol, where("isMuted", "==", true))),
    getDocs(query(usersCol, where("isBanned", "==", true))),
  ]);
  return {
    muted: mutedSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    banned: bannedSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
}

// --------------------------------------------------------------------------
// Fase 3 — presencia de escritura ("@X escribiendo…").
// --------------------------------------------------------------------------
export interface TypingEntry {
  uid: string;
  nickname: string;
  username: string;
  updatedAt: Timestamp;
}

function typingDoc(uid: string) {
  return doc(db, "chatRooms", ARMY_CHAT_ROOM_ID, "typing", uid);
}

export async function setTyping(uid: string, nickname: string, username: string): Promise<void> {
  await setDoc(typingDoc(uid), { nickname, username, updatedAt: serverTimestamp() });
}
export async function clearTyping(uid: string): Promise<void> {
  await deleteDoc(typingDoc(uid)).catch(() => {});
}
export function subscribeTyping(cb: (entries: TypingEntry[]) => void): () => void {
  const col = collection(db, "chatRooms", ARMY_CHAT_ROOM_ID, "typing");
  return onSnapshot(col, (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<TypingEntry, "uid">) })));
  });
}

// --------------------------------------------------------------------------
// Fase 3 — lecturas del chat (badge de nuevos + silenciar notificaciones).
// --------------------------------------------------------------------------
export interface ChatReadState {
  lastReadCount: number;
  notifMuted: boolean;
}

function readsDoc(uid: string) {
  return doc(db, "armyChatReads", uid);
}

export function subscribeMyReads(
  uid: string,
  cb: (state: ChatReadState | null) => void,
): () => void {
  return onSnapshot(readsDoc(uid), (snap) =>
    cb(snap.exists() ? (snap.data() as ChatReadState) : null),
  );
}
export async function setChatRead(uid: string, lastReadCount: number): Promise<void> {
  await setDoc(readsDoc(uid), { lastReadCount, updatedAt: serverTimestamp() }, { merge: true });
}
export async function setChatNotifMuted(uid: string, notifMuted: boolean): Promise<void> {
  await setDoc(readsDoc(uid), { notifMuted, updatedAt: serverTimestamp() }, { merge: true });
}
