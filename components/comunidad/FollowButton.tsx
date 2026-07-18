"use client";

// Botón seguir / dejar de seguir — PRD (red social, Etapa 1).
import { useEffect, useState } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { PillButton } from "@/components/ui/PillButton";
import { toastError } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { followUser, subscribeIsFollowing, unfollowUser } from "@/lib/firestore/follows";

export function FollowButton({
  targetUid,
  targetUsername,
}: {
  targetUid: string;
  targetUsername?: string;
}) {
  const { firebaseUser } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeIsFollowing(firebaseUser.uid, targetUid, setFollowing);
  }, [firebaseUser, targetUid]);

  // No mostrar el botón en el propio perfil.
  if (firebaseUser && firebaseUser.uid === targetUid) return null;

  async function toggle() {
    if (!firebaseUser) {
      openLogin();
      return;
    }
    setBusy(true);
    try {
      if (following) await unfollowUser(firebaseUser.uid, targetUid);
      else await followUser(firebaseUser.uid, targetUid);
    } catch (err) {
      console.error(err);
      toastError("No se pudo actualizar el seguimiento.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PillButton
      variant={following ? "secondary" : "primary"}
      size="sm"
      onClick={toggle}
      disabled={busy}
      aria-label={following ? `Dejar de seguir a ${targetUsername ?? ""}` : `Seguir a ${targetUsername ?? ""}`}
    >
      {following ? (
        <>
          <UserCheck className="h-4 w-4" aria-hidden /> Siguiendo
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" aria-hidden /> Seguir
        </>
      )}
    </PillButton>
  );
}

export default FollowButton;
