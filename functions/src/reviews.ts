// Reseñas: desnormalización de rating a products — PRD §13.12, §15.8.
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "./admin";

/**
 * `onReviewWrite`: actualiza products/{slug}.ratingAvg y .reviewCount usando
 * SOLO las reseñas aprobadas (nunca inventar ratings — política de Google). §13.12
 */
export const onReviewWrite = onDocumentWritten("reviews/{reviewId}", async (event) => {
  const after = event.data?.after?.data();
  const before = event.data?.before?.data();
  const slug = (after?.productSlug ?? before?.productSlug) as string | undefined;
  if (!slug) return;

  const approved = await db
    .collection("reviews")
    .where("productSlug", "==", slug)
    .where("status", "==", "approved")
    .get();

  let sum = 0;
  approved.forEach((doc) => {
    sum += Number(doc.data().rating) || 0;
  });
  const reviewCount = approved.size;
  const ratingAvg = reviewCount > 0 ? Math.round((sum / reviewCount) * 10) / 10 : 0;

  await db.collection("products").doc(slug).update({ ratingAvg, reviewCount });
  logger.info(
    `onReviewWrite: producto ${slug} → ${reviewCount} reseñas, rating ${ratingAvg}.`,
  );
});
