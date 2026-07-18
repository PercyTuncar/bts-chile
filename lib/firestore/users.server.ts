// Lecturas de perfil para Server Components (SOLO SERVIDOR).
// Usa el Admin SDK, que bypassa las Firestore Rules: la regla de `users` exige
// `request.auth != null`, imposible de cumplir en un render de servidor (sin sesión),
// por lo que el SDK cliente sería denegado (permission-denied). El Admin SDK lee el
// documento y el server solo expone campos públicos en la página de perfil. §14.1
import "server-only";
import { getAdminDb } from "@/lib/firebaseAdmin";
import type { User } from "@/types";

/** Resuelve un perfil por username (Admin SDK); cae al uid por compatibilidad. */
export async function getUserByUsernameAdmin(param: string): Promise<User | null> {
  const db = getAdminDb();
  const lower = param.toLowerCase();

  const snap = await db
    .collection("users")
    .where("usernameLower", "==", lower)
    .limit(1)
    .get();
  if (!snap.empty) return snap.docs[0].data() as User;

  // Fallback: enlaces antiguos que apuntan al uid en vez del username.
  const byId = await db.collection("users").doc(param).get();
  return byId.exists ? (byId.data() as User) : null;
}
