// Contadores desnormalizados + notificaciones de comunidad — PRD §8.1.A, §8.2, §13.2.
import { onDocumentUpdated, onDocumentWritten } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "./admin";
import { createNotification } from "./lib/notifications";

const REACTION_TYPES = [
  "purple_heart",
  "moved",
  "laughing",
  "sad",
  "fire",
  "support",
] as const;

type ReactionType = (typeof REACTION_TYPES)[number];

/**
 * `onReactionWrite`: recalcula posts/{postId}.reactionCounts en cada escritura de
 * una reacción (evita lecturas costosas por render). §8.1.A
 */
export const onReactionWrite = onDocumentWritten(
  "posts/{postId}/reactions/{uid}",
  async (event) => {
    const postId = event.params.postId;
    const reactionsSnap = await db
      .collection("posts")
      .doc(postId)
      .collection("reactions")
      .get();

    const counts: Record<ReactionType | "total", number> = {
      purple_heart: 0,
      moved: 0,
      laughing: 0,
      sad: 0,
      fire: 0,
      support: 0,
      total: 0,
    };

    reactionsSnap.forEach((doc) => {
      const type = doc.data().type as ReactionType;
      if (REACTION_TYPES.includes(type)) {
        counts[type] += 1;
        counts.total += 1;
      }
    });

    await db.collection("posts").doc(postId).update({ reactionCounts: counts });
    logger.info(`onReactionWrite: post ${postId} → ${counts.total} reacciones.`);

    // Notificación al autor cuando alguien reacciona (solo en reacción NUEVA, no a sí mismo).
    const isNew = event.data?.after?.exists && !event.data?.before?.exists;
    if (isNew) {
      const reactorUid = event.params.uid;
      const post = (await db.collection("posts").doc(postId).get()).data();
      if (post?.authorUid && post.authorUid !== reactorUid) {
        await createNotification({
          recipientUid: post.authorUid,
          type: "reaction",
          actorUid: reactorUid,
          postId,
          message: "reaccionó a tu publicación 💜",
        });
      }
    }
  },
);

/**
 * `onCommentWrite`: recalcula posts/{postId}.commentsCount. §8.2 / §13.2
 * (El cliente no puede escribir el contador del post por las reglas de seguridad.)
 */
export const onCommentWrite = onDocumentWritten(
  "posts/{postId}/comments/{commentId}",
  async (event) => {
    const postId = event.params.postId;
    const commentsSnap = await db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .get();
    await db
      .collection("posts")
      .doc(postId)
      .update({ commentsCount: commentsSnap.size });
    logger.info(`onCommentWrite: post ${postId} → ${commentsSnap.size} comentarios.`);

    // Notificación al autor cuando alguien comenta (comentario nuevo, no a sí mismo).
    const isNew = event.data?.after?.exists && !event.data?.before?.exists;
    if (isNew) {
      const comment = event.data?.after?.data();
      const post = (await db.collection("posts").doc(postId).get()).data();
      if (post?.authorUid && comment?.authorUid && post.authorUid !== comment.authorUid) {
        await createNotification({
          recipientUid: post.authorUid,
          type: "comment",
          actorUid: comment.authorUid,
          postId,
          message: "comentó tu publicación",
        });
      }
    }
  },
);

/**
 * `onFollowWrite`: recomputa followersCount (del seguido) y followingCount (del seguidor).
 * Los contadores viven en users/{uid} y solo los cambian las Functions (Admin SDK).
 */
export const onFollowWrite = onDocumentWritten("follows/{id}", async (event) => {
  const after = event.data?.after?.data();
  const before = event.data?.before?.data();
  const followingUid = (after?.followingUid ?? before?.followingUid) as string | undefined;
  const followerUid = (after?.followerUid ?? before?.followerUid) as string | undefined;

  if (followingUid) {
    const c = await db.collection("follows").where("followingUid", "==", followingUid).count().get();
    await db.collection("users").doc(followingUid).update({ followersCount: c.data().count });
  }
  if (followerUid) {
    const c = await db.collection("follows").where("followerUid", "==", followerUid).count().get();
    await db.collection("users").doc(followerUid).update({ followingCount: c.data().count });
  }
  logger.info(`onFollowWrite: recomputados contadores (${followerUid} → ${followingUid}).`);

  // Notificación de nuevo seguidor (solo al crearse el follow).
  const isNew = event.data?.after?.exists && !event.data?.before?.exists;
  if (isNew && followingUid && followerUid) {
    await createNotification({
      recipientUid: followingUid,
      type: "follow",
      actorUid: followerUid,
      message: "empezó a seguirte 💜",
    });
  }
});

/**
 * `onPostStatusChange`: notifica al autor cuando su post pasa a aprobado o rechazado (§8.3).
 */
export const onPostStatusChange = onDocumentUpdated("posts/{postId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!after) return;
  if (
    before?.status !== after.status &&
    (after.status === "approved" || after.status === "rejected")
  ) {
    await createNotification({
      recipientUid: after.authorUid,
      type: after.status === "approved" ? "post_approved" : "post_rejected",
      actorUid: null,
      postId: event.params.postId,
      message:
        after.status === "approved"
          ? "Tu publicación fue aprobada 💜"
          : `Tu publicación fue rechazada${after.rejectionReason ? ": " + after.rejectionReason : ""}`,
    });
  }
});

/**
 * `onReportWrite`: recalcula reportCount / isReported. §8.2
 */
export const onReportWrite = onDocumentWritten(
  "posts/{postId}/reports/{uid}",
  async (event) => {
    const postId = event.params.postId;
    const reportsSnap = await db
      .collection("posts")
      .doc(postId)
      .collection("reports")
      .get();

    const reportCount = reportsSnap.size;
    await db
      .collection("posts")
      .doc(postId)
      .update({ reportCount, isReported: reportCount > 0 });
    logger.info(`onReportWrite: post ${postId} → ${reportCount} reportes.`);
  },
);
