"use client";

// Botón "Mensaje" en el perfil → abre/crea la conversación privada. Etapa 3.
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PillButton } from "@/components/ui/PillButton";
import { toastError } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { getOrCreateConversation } from "@/lib/firestore/messages";

export function MessageButton({
  target,
}: {
  target: { uid: string; username: string; nickname: string; photoURL: string | null };
}) {
  const { firebaseUser, profile } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // No mostrar en el propio perfil.
  if (firebaseUser && firebaseUser.uid === target.uid) return null;

  async function open() {
    if (!firebaseUser || !profile) {
      openLogin();
      return;
    }
    setBusy(true);
    try {
      const convId = await getOrCreateConversation(
        {
          uid: firebaseUser.uid,
          username: profile.username || firebaseUser.uid,
          nickname: profile.nickname || firebaseUser.displayName || "ARMY",
          photoURL: profile.customPhotoURL || profile.photoURL || null,
        },
        target,
      );
      router.push(`/mensajes/${convId}`);
    } catch (err) {
      console.error(err);
      toastError("No se pudo abrir el chat.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PillButton variant="secondary" size="sm" onClick={open} disabled={busy}>
      <MessageCircle className="h-4 w-4" aria-hidden /> Mensaje
    </PillButton>
  );
}

export default MessageButton;
