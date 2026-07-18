// Acceso a datos: reseñas de tienda — PRD §13.12, §7.5.
import {
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type WithFieldValue,
} from "firebase/firestore";
import type { Review, ReviewStatus, WithId } from "@/types";
import { reviewsCol } from "./collections";

export interface CreateReviewInput {
  productSlug: string;
  authorUid: string;
  authorNickname: string;
  authorPhotoURL: string;
  rating: number;
  title: string | null;
  comment: string;
}

/** Crea una reseña con status "pending" (moderación admin) — §7.5, §13.12. */
export async function createReview(input: CreateReviewInput): Promise<void> {
  const ref = doc(reviewsCol);
  const payload: WithFieldValue<Review> = {
    ...input,
    reviewId: ref.id,
    status: "pending",
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, payload);
}

/** Cambia el estado de moderación de una reseña (admin). §11.1 */
export async function setReviewStatus(
  reviewId: string,
  status: ReviewStatus,
): Promise<void> {
  await updateDoc(doc(reviewsCol, reviewId), { status });
}

/** Reseñas aprobadas de un producto (fecha desc). §7.5 / §15.8 */
export async function getApprovedReviews(
  productSlug: string,
): Promise<WithId<Review>[]> {
  const q = query(
    reviewsCol,
    where("productSlug", "==", productSlug),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Reseñas pendientes de moderación (dashboard admin). §11.1 */
export async function getPendingReviews(): Promise<WithId<Review>[]> {
  const q = query(
    reviewsCol,
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
