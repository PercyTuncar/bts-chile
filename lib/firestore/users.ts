// Acceso a datos: usuarios — PRD §13.1, §4.2, §4.6.
import {
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type WithFieldValue,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MembershipStatus, MembershipType, User, WithId } from "@/types";
import { usernamesCol, usersCol } from "./collections";

export function userDoc(uid: string) {
  return doc(usersCol, uid);
}

export interface ProfileData {
  email: string;
  displayName: string;
  nickname: string;
  username: string;
  photoURL: string;
  customPhotoURL: string | null;
  birthDate: Date;
  city: string;
  country: string;
}

/** Normaliza un texto a un handle válido: [a-z0-9_], 3-20 chars. */
export function slugifyUsername(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
}

/** ¿El username está libre? (o pertenece al mismo uid). */
export async function isUsernameAvailable(
  username: string,
  forUid?: string,
): Promise<boolean> {
  const snap = await getDoc(doc(usernamesCol, username.toLowerCase()));
  if (!snap.exists()) return true;
  return forUid ? snap.data().uid === forUid : false;
}

/** Resuelve un perfil por username; si no existe, cae al uid (compatibilidad). */
export async function getUserByUsername(param: string): Promise<User | null> {
  const lower = param.toLowerCase();
  const snap = await getDocs(
    query(usersCol, where("usernameLower", "==", lower), fbLimit(1)),
  );
  if (!snap.empty) return snap.docs[0].data();
  return getUser(param);
}

/** Lista usuarios recientes (buscador de personas, filtro cliente). */
export async function listUsers(max = 100): Promise<WithId<User>[]> {
  const snap = await getDocs(query(usersCol, orderBy("joinedAt", "desc"), fbLimit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Crea el documento users/{uid} al completar el perfil (§4.2).
 * Nota: la membresía arranca en `free`; la Cloud Function `grantWelcomeTrial`
 * (Fase 4) otorga el mes gratis de ARMY Basic vía onCreate (lógica no manipulable).
 */
export async function createUserProfile(
  uid: string,
  data: ProfileData,
): Promise<void> {
  const birthDate = Timestamp.fromDate(data.birthDate);
  const usernameLower = data.username.toLowerCase();
  const payload: WithFieldValue<User> = {
    uid,
    email: data.email,
    displayName: data.displayName,
    nickname: data.nickname || data.displayName,
    username: data.username,
    usernameLower,
    photoURL: data.photoURL,
    customPhotoURL: data.customPhotoURL,
    birthDate,
    birthMonth: data.birthDate.getMonth() + 1,
    birthDay: data.birthDate.getDate(),
    city: data.city,
    country: data.country,
    role: "user",
    membershipType: "free",
    membershipStatus: "none",
    membershipExpiry: null,
    membershipSource: null,
    isTrial: false,
    hasUsedWelcomeTrial: false,
    trialGrantedBy: null,
    paypalSubscriptionId: null,
    membershipHistory: [],
    joinedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
    postsCount: 0,
    reactionsGiven: 0,
    totalPurchases: 0,
    followersCount: 0,
    followingCount: 0,
    isActive: true,
    newsletter: false,
  };
  // Reserva de username + creación de perfil en un batch atómico:
  // el `create` de usernames/{lower} falla si ya está tomado → unicidad garantizada.
  const batch = writeBatch(db);
  batch.set(doc(usernamesCol, usernameLower), { uid });
  batch.set(userDoc(uid), payload);
  await batch.commit();
}

/** Actualiza campos de perfil editables por el dueño (§4.2). No toca membresía/rol. */
export async function updateUserProfile(
  uid: string,
  data: Pick<ProfileData, "nickname" | "city" | "country" | "customPhotoURL"> & {
    birthDate?: Date;
    username?: string;
  },
): Promise<void> {
  const patch: Record<string, unknown> = {
    nickname: data.nickname,
    city: data.city,
    country: data.country,
    customPhotoURL: data.customPhotoURL,
    lastSeenAt: serverTimestamp(),
  };
  if (data.birthDate) {
    patch.birthDate = Timestamp.fromDate(data.birthDate);
    patch.birthMonth = data.birthDate.getMonth() + 1;
    patch.birthDay = data.birthDate.getDate();
  }

  if (data.username) {
    const newLower = data.username.toLowerCase();
    const current = await getDoc(userDoc(uid));
    const oldLower = current.data()?.usernameLower;
    if (oldLower !== newLower) {
      // Cambio (o primer reclamo) de username → mover la reserva atómicamente.
      const batch = writeBatch(db);
      if (oldLower) batch.delete(doc(usernamesCol, oldLower));
      batch.set(doc(usernamesCol, newLower), { uid });
      batch.update(userDoc(uid), { ...patch, username: data.username, usernameLower: newLower });
      await batch.commit();
      return;
    }
    patch.username = data.username;
    patch.usernameLower = newLower;
  }

  await updateDoc(userDoc(uid), patch);
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(userDoc(uid));
  return snap.exists() ? snap.data() : null;
}

/** Suscripción en vivo al propio documento (refresca membresía en el contexto). §4.2/§10.4 */
export function subscribeToUser(
  uid: string,
  cb: (user: User | null) => void,
): () => void {
  return onSnapshot(userDoc(uid), (snap) => cb(snap.exists() ? snap.data() : null));
}

// -------------------------------------------------------------------------
// Operaciones de admin (§11.1) — permitidas por reglas cuando role == "admin".
// -------------------------------------------------------------------------

/** Todos los usuarios (admin), orden por registro desc. */
export async function getAllUsers(max = 500): Promise<WithId<User>[]> {
  const q = query(usersCol, orderBy("joinedAt", "desc"), fbLimit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setUserRole(uid: string, role: "user" | "admin"): Promise<void> {
  await updateDoc(userDoc(uid), { role });
}

export async function setUserActive(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(userDoc(uid), { isActive });
}

/** Activación/cambio manual de membresía por el admin (§10.5 respaldo). */
export async function setUserMembershipManual(
  uid: string,
  membershipType: MembershipType,
  expiryDate: Date | null,
): Promise<void> {
  const status: MembershipStatus = membershipType === "free" ? "expired" : "active";
  await updateDoc(userDoc(uid), {
    membershipType,
    membershipStatus: status,
    membershipExpiry: expiryDate ? Timestamp.fromDate(expiryDate) : null,
    membershipSource: membershipType === "free" ? null : "manual",
    isTrial: false,
  });
}

/** Cumpleaños del día (admin / Cloud Function). §4.6 */
export async function getBirthdays(
  month: number,
  day: number,
): Promise<WithId<User>[]> {
  const q = query(
    usersCol,
    where("birthMonth", "==", month),
    where("birthDay", "==", day),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
