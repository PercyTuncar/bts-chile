// Subcolecciones de comunidad (reacciones, comentarios, reportes) + grupos WhatsApp.
// PRD §8.1.A, §8.2, §4.4, §13.2, §13.10.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { whatsappGroupsCol } from "./collections";
import { makeConverter } from "./converters";
import type {
  Comment,
  ReactionType,
  ReportReason,
  WhatsappGroup,
  WithId,
} from "@/types";

// --------------------------------------------------------------------------
// Reacciones — posts/{postId}/reactions/{uid}
// --------------------------------------------------------------------------
function reactionDoc(postId: string, uid: string) {
  return doc(db, "posts", postId, "reactions", uid);
}

export async function setReaction(
  postId: string,
  uid: string,
  type: ReactionType,
): Promise<void> {
  await setDoc(reactionDoc(postId, uid), { uid, type, reactedAt: serverTimestamp() });
}

export async function removeReaction(postId: string, uid: string): Promise<void> {
  await deleteDoc(reactionDoc(postId, uid));
}

export function subscribeMyReaction(
  postId: string,
  uid: string,
  cb: (type: ReactionType | null) => void,
): () => void {
  return onSnapshot(reactionDoc(postId, uid), (snap) =>
    cb(snap.exists() ? (snap.data().type as ReactionType) : null),
  );
}

// --------------------------------------------------------------------------
// Votos de encuesta — posts/{postId}/votes/{uid}
// Mismo patrón que las reacciones: un doc por usuario (editable). El recuento
// se hace en el cliente sobre la subcolección (sin Cloud Function). §8.1
// --------------------------------------------------------------------------
function voteDoc(postId: string, uid: string) {
  return doc(db, "posts", postId, "votes", uid);
}

export interface VoteTally {
  counts: number[]; // votos por índice de opción
  total: number;
}

export async function setVote(
  postId: string,
  uid: string,
  optionIndex: number,
): Promise<void> {
  await setDoc(voteDoc(postId, uid), { uid, optionIndex, votedAt: serverTimestamp() });
}

export async function removeVote(postId: string, uid: string): Promise<void> {
  await deleteDoc(voteDoc(postId, uid));
}

export function subscribeMyVote(
  postId: string,
  uid: string,
  cb: (optionIndex: number | null) => void,
): () => void {
  return onSnapshot(voteDoc(postId, uid), (snap) =>
    cb(snap.exists() ? (snap.data().optionIndex as number) : null),
  );
}

/** Recuento en vivo de todos los votos de la encuesta (agregado en cliente). */
export function subscribeVoteTally(
  postId: string,
  optionCount: number,
  cb: (tally: VoteTally) => void,
): () => void {
  const col = collection(db, "posts", postId, "votes");
  return onSnapshot(col, (snap) => {
    const counts = new Array(optionCount).fill(0) as number[];
    let total = 0;
    snap.forEach((d) => {
      const idx = d.data().optionIndex as number;
      if (typeof idx === "number" && idx >= 0 && idx < optionCount) {
        counts[idx] += 1;
        total += 1;
      }
    });
    cb({ counts, total });
  });
}

// --------------------------------------------------------------------------
// Comentarios — posts/{postId}/comments/{commentId}
// --------------------------------------------------------------------------
const commentConverter = makeConverter<Comment>();

function commentsCollection(postId: string) {
  return collection(db, "posts", postId, "comments").withConverter(commentConverter);
}

export async function addComment(
  postId: string,
  author: { uid: string; nickname: string; username: string; photoURL: string },
  content: string,
): Promise<void> {
  await addDoc(commentsCollection(postId), {
    commentId: "",
    authorUid: author.uid,
    authorNickname: author.nickname,
    authorUsername: author.username,
    authorPhotoURL: author.photoURL,
    content,
    createdAt: serverTimestamp() as never,
    editedAt: null,
    status: "approved",
  });
  // El contador commentsCount lo mantiene la Cloud Function onCommentWrite (§13.2).
}

export function subscribeComments(
  postId: string,
  cb: (comments: WithId<Comment>[]) => void,
): () => void {
  const q = query(commentsCollection(postId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
  );
}

/** Edita el contenido de un comentario. Reglas: solo el autor (o admin). §8.2 */
export async function updateComment(
  postId: string,
  commentId: string,
  content: string,
): Promise<void> {
  await updateDoc(doc(commentsCollection(postId), commentId), {
    content,
    editedAt: serverTimestamp(),
  });
}

/**
 * Elimina un comentario. Reglas: el autor o el admin (moderación) — §8.2.
 * El contador commentsCount lo ajusta la Cloud Function onCommentWrite.
 */
export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await deleteDoc(doc(commentsCollection(postId), commentId));
}

// --------------------------------------------------------------------------
// Reportes — posts/{postId}/reports/{uid}
// --------------------------------------------------------------------------
export async function reportPost(
  postId: string,
  uid: string,
  reason: ReportReason,
): Promise<void> {
  await setDoc(doc(db, "posts", postId, "reports", uid), {
    uid,
    reason,
    reportedAt: serverTimestamp(),
  });
}

// --------------------------------------------------------------------------
// Grupos de WhatsApp — §4.4, §13.10
// --------------------------------------------------------------------------
export async function getWhatsappGroups(): Promise<WithId<WhatsappGroup>[]> {
  const snap = await getDocs(query(whatsappGroupsCol, orderBy("region", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Crea/edita un grupo de WhatsApp (admin) — §11.1. */
export async function saveWhatsappGroup(
  id: string | null,
  data: Omit<WhatsappGroup, "updatedAt">,
): Promise<void> {
  const ref = id ? doc(whatsappGroupsCol, id) : doc(whatsappGroupsCol);
  await setDoc(
    ref,
    { ...data, isFull: data.currentMembers >= data.maxMembers, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function deleteWhatsappGroup(id: string): Promise<void> {
  await deleteDoc(doc(whatsappGroupsCol, id));
}
