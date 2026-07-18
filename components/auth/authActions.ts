"use client";

// Acciones de autenticación — PRD §4.1.
import {
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getUser } from "@/lib/firestore/users";

export interface SignInResult {
  uid: string;
  isNewUser: boolean; // sin documento users/{uid} → debe completar perfil
}

/** Login con Google (popup). Persistencia local. §4.1 */
export async function signInWithGoogle(): Promise<SignInResult> {
  await setPersistence(auth, browserLocalPersistence);
  const cred = await signInWithPopup(auth, googleProvider);
  const uid = cred.user.uid;
  const existing = await getUser(uid);
  return { uid, isNewUser: existing === null };
}

/** Cierre de sesión. §4.1 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
