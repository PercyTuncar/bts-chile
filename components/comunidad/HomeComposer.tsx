"use client";

// Franja "¿Qué estás pensando?" estilo Facebook en el Home — abre el modal de crear post.
// Coherente con la plataforma: publicar requiere membresía ≥ Basic (§8.1, §4.3).
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, PenLine } from "lucide-react";
import { CreatePostSheet } from "@/components/comunidad/CreatePostSheet";
import { useAuth, useAuthStore } from "@/hooks/useAuth";

export function HomeComposer() {
  const { status, firebaseUser, profile, canPublish } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const firstName =
    profile?.nickname || firebaseUser?.displayName?.split(" ")[0] || "ARMY";
  const avatar =
    profile?.customPhotoURL || profile?.photoURL || firebaseUser?.photoURL || null;

  function handleOpen() {
    if (status !== "authenticated") {
      openLogin();
      return;
    }
    if (!canPublish) {
      // Free: publicar requiere membresía → lo llevamos a /membresia.
      router.push("/membresia");
      return;
    }
    setOpen(true);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass-card flex items-center gap-3 rounded-full p-2 pl-3">
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-brand/40">
          {avatar ? (
            <Image src={avatar} alt="" fill sizes="40px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-soft">💜</span>
          )}
        </span>

        <button
          type="button"
          onClick={handleOpen}
          className="h-11 flex-1 rounded-full bg-[color-mix(in_srgb,var(--text)_6%,transparent)] px-4 text-left text-sm text-text-muted/70 transition-colors hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)]"
        >
          ¿Qué estás pensando, {firstName}?
        </button>

        <button
          type="button"
          onClick={handleOpen}
          aria-label="Añadir imagen a tu publicación"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand transition-transform hover:scale-110 active:scale-95 sm:flex"
        >
          <ImagePlus className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Crear publicación"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-transform hover:scale-105 active:scale-95 sm:hidden"
        >
          <PenLine className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {canPublish && <CreatePostSheet open={open} onClose={() => setOpen(false)} />}
    </div>
  );
}

export default HomeComposer;
