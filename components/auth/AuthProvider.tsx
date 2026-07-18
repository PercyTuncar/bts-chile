"use client";

// AuthProvider — inicializa el listener de Firebase Auth y sincroniza el perfil
// Firestore (users/{uid}) al store global. Monta el LoginModal global. PRD §4.1/§4.2.
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { subscribeToUser } from "@/lib/firestore/users";
import { useAuthStore } from "@/hooks/useAuth";
import { LoginModal } from "./LoginModal";

export function AuthProvider({ children }: { children: ReactNode }) {
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setStatus = useAuthStore((s) => s.setStatus);
  const setNeedsProfile = useAuthStore((s) => s.setNeedsProfile);
  const reset = useAuthStore((s) => s.reset);

  useEffect(() => {
    let unsubProfile: () => void = () => {};

    const unsubAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        unsubProfile();
        unsubProfile = () => {};

        if (!firebaseUser) {
          reset();
          return;
        }

        setFirebaseUser(firebaseUser);
        setStatus("authenticated");

        // Suscripción en vivo al perfil: refleja cambios de membresía al instante (§10.4).
        unsubProfile = subscribeToUser(firebaseUser.uid, (profile) => {
          setProfile(profile);
          setNeedsProfile(profile === null);
        });
      },
      (error) => {
        // Con credenciales mock (sin proyecto real) el listener puede fallar: se trata
        // como sesión cerrada para no romper la navegación.
        console.warn("Auth listener error (¿credenciales mock?):", error);
        reset();
      },
    );

    return () => {
      unsubProfile();
      unsubAuth();
    };
  }, [reset, setFirebaseUser, setStatus, setProfile, setNeedsProfile]);

  return (
    <>
      {children}
      <LoginModal />
    </>
  );
}

export default AuthProvider;
