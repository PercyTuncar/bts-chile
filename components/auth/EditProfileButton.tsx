"use client";

// Botón "Editar perfil" — visible solo para el dueño del perfil (PRD §4.2).
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function EditProfileButton({ profileUid }: { profileUid: string }) {
  const { firebaseUser } = useAuth();
  if (!firebaseUser || firebaseUser.uid !== profileUid) return null;

  return (
    <Link
      href="/completar-perfil"
      className="inline-flex h-11 items-center rounded-button glass px-5 text-sm font-semibold transition-transform hover:scale-[1.02]"
    >
      Editar perfil
    </Link>
  );
}

export default EditProfileButton;
