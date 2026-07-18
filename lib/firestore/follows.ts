// Seguidores — follows/{followerUid}_{followingUid}. PRD (red social, Etapa 1).
import {
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  setDoc,
  type WithFieldValue,
} from "firebase/firestore";
import type { Follow } from "@/types";
import { followsCol } from "./collections";

function followId(followerUid: string, followingUid: string): string {
  return `${followerUid}_${followingUid}`;
}

export async function followUser(followerUid: string, targetUid: string): Promise<void> {
  if (followerUid === targetUid) return;
  const payload: WithFieldValue<Follow> = {
    followerUid,
    followingUid: targetUid,
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(followsCol, followId(followerUid, targetUid)), payload);
}

export async function unfollowUser(followerUid: string, targetUid: string): Promise<void> {
  await deleteDoc(doc(followsCol, followId(followerUid, targetUid)));
}

/** Suscripción en vivo: ¿followerUid sigue a targetUid? */
export function subscribeIsFollowing(
  followerUid: string,
  targetUid: string,
  cb: (following: boolean) => void,
): () => void {
  return onSnapshot(doc(followsCol, followId(followerUid, targetUid)), (snap) =>
    cb(snap.exists()),
  );
}

/** UIDs a los que sigue `uid`. */
export async function getFollowing(uid: string): Promise<string[]> {
  const snap = await getDocs(query(followsCol, where("followerUid", "==", uid)));
  return snap.docs.map((d) => d.data().followingUid);
}

/** UIDs que siguen a `uid`. */
export async function getFollowers(uid: string): Promise<string[]> {
  const snap = await getDocs(query(followsCol, where("followingUid", "==", uid)));
  return snap.docs.map((d) => d.data().followerUid);
}
