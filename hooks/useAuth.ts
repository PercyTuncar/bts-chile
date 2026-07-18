"use client";

// Estado global de autenticación (React Context + Zustand) — PRD §4.1.
// El AuthProvider alimenta este store con el usuario de Firebase y su perfil Firestore.
import type { User as FirebaseUser } from "firebase/auth";
import { create } from "zustand";
import type { User } from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthStore {
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  status: AuthStatus;
  /** Autenticado en Firebase pero sin documento users/{uid} → debe completar perfil. */
  needsProfile: boolean;
  loginModalOpen: boolean;

  setFirebaseUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  setNeedsProfile: (value: boolean) => void;
  openLogin: () => void;
  closeLogin: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  firebaseUser: null,
  profile: null,
  status: "loading",
  needsProfile: false,
  loginModalOpen: false,

  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setProfile: (profile) => set({ profile }),
  setStatus: (status) => set({ status }),
  setNeedsProfile: (needsProfile) => set({ needsProfile }),
  openLogin: () => set({ loginModalOpen: true }),
  closeLogin: () => set({ loginModalOpen: false }),
  reset: () =>
    set({
      firebaseUser: null,
      profile: null,
      status: "unauthenticated",
      needsProfile: false,
    }),
}));

/** Hook de conveniencia con derivados de negocio. */
export function useAuth() {
  const store = useAuthStore();
  const isAuthenticated = store.status === "authenticated";
  return {
    ...store,
    isAuthenticated,
    isAdmin: store.profile?.role === "admin",
    /** Publicar requiere membresía ≥ Basic; el admin puede publicar siempre (§8.1, §10.2). */
    canPublish:
      !!store.profile &&
      (store.profile.membershipType !== "free" || store.profile.role === "admin"),
  };
}
