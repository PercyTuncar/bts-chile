// Acceso a datos: comunidad / posts — PRD §13.2, §8.
import {
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  limit as fbLimit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  type Query,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type WithFieldValue,
} from "firebase/firestore";
import {
  EMPTY_REACTION_COUNTS,
  type MembershipType,
  type Poll,
  type Post,
  type PostCategory,
  type PostType,
  type Role,
  type WithId,
} from "@/types";
import { postsCol } from "./collections";

export function postDoc(postId: string) {
  return doc(postsCol, postId);
}

export interface CreatePostInput {
  authorUid: string;
  authorNickname: string;
  authorUsername: string;
  authorPhotoURL: string;
  authorMembership: MembershipType;
  authorRole: Role;
  type: PostType;
  content: string;
  richContent: string | null;
  poll: Poll | null;
  images: string[] | null;
  imageURL: string | null;
  category: PostCategory;
}

/**
 * Crea un post. Los usuarios normales entran en moderación ("pending"); el admin
 * publica directo ("approved", sin revisión previa) — §4.3, §8.3. Devuelve el id.
 */
export async function createPost(input: CreatePostInput): Promise<string> {
  const ref = doc(postsCol);
  const autoApprove = input.authorRole === "admin";
  const payload: WithFieldValue<Post> = {
    ...input,
    postId: ref.id,
    status: autoApprove ? "approved" : "pending",
    rejectionReason: null,
    reactionCounts: { ...EMPTY_REACTION_COUNTS },
    commentsCount: 0,
    reportCount: 0,
    isReported: false,
    createdAt: serverTimestamp(),
    approvedAt: autoApprove ? serverTimestamp() : null,
    approvedBy: autoApprove ? input.authorUid : null,
  };
  await setDoc(ref, payload);
  return ref.id;
}

// -------------------------------------------------------------------------
// Moderación (admin) — §8.3, §11.1
// -------------------------------------------------------------------------
export async function getPostsByStatus(
  status: Post["status"],
  max = 100,
): Promise<WithId<Post>[]> {
  const q = query(
    postsCol,
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    fbLimit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getReportedPosts(max = 100): Promise<WithId<Post>[]> {
  const q = query(
    postsCol,
    where("isReported", "==", true),
    orderBy("reportCount", "desc"),
    fbLimit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Aprueba/rechaza un post (admin) — §8.3. */
export async function moderatePost(
  postId: string,
  status: "approved" | "rejected",
  adminUid: string,
  rejectionReason: string | null = null,
): Promise<void> {
  await setDoc(
    postDoc(postId),
    {
      status,
      approvedAt: status === "approved" ? serverTimestamp() : null,
      approvedBy: status === "approved" ? adminUid : null,
      rejectionReason: status === "rejected" ? rejectionReason : null,
    },
    { merge: true },
  );
}

/** Elimina un post (admin o autor) — §8.3. */
export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(postDoc(postId));
}

/** Query del feed público (aprobados, fecha desc) para onSnapshot en vivo. §8.1 */
export function feedQuery(
  category: PostCategory | "all",
  limitCount: number,
): Query<Post> {
  const constraints: QueryConstraint[] = [where("status", "==", "approved")];
  if (category !== "all") constraints.push(where("category", "==", category));
  constraints.push(orderBy("createdAt", "desc"), fbLimit(limitCount));
  return query(postsCol, ...constraints);
}

export async function getPost(postId: string): Promise<Post | null> {
  const snap = await getDoc(postDoc(postId));
  return snap.exists() ? snap.data() : null;
}

/** Posts aprobados de un autor, para el grid de su perfil (§4.2). */
export async function getApprovedPostsByAuthor(
  authorUid: string,
  max = 24,
): Promise<WithId<Post>[]> {
  const q = query(
    postsCol,
    where("authorUid", "==", authorUid),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
    fbLimit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export interface ApprovedPostsPage {
  posts: WithId<Post>[];
  cursor: QueryDocumentSnapshot<Post> | null;
}

/** Página del feed público (aprobados, fecha desc, paginación por cursor). §8.1 */
export async function getApprovedPosts(options?: {
  category?: PostCategory;
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<Post> | null;
}): Promise<ApprovedPostsPage> {
  const pageSize = options?.pageSize ?? 20;
  const constraints: QueryConstraint[] = [where("status", "==", "approved")];
  if (options?.category) constraints.push(where("category", "==", options.category));
  constraints.push(orderBy("createdAt", "desc"));
  if (options?.cursor) constraints.push(startAfter(options.cursor));
  constraints.push(fbLimit(pageSize));

  const snap = await getDocs(query(postsCol, ...constraints));
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const cursor = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;
  return { posts, cursor };
}
