"use client";

// AuthButton — botón "Entrar" o menú de avatar (perfil / panel-admin / cerrar sesión).
// PRD §3.1, §4.1.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { PillButton } from "@/components/ui/PillButton";
import { toastSuccess } from "@/components/ui/Toast";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { signOutUser } from "./authActions";

export function AuthButton() {
  const { status, firebaseUser, profile, isAdmin } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  if (status !== "authenticated" || !firebaseUser) {
    return <PillButton onClick={openLogin}>Entrar</PillButton>;
  }

  const uid = profile?.username || firebaseUser.uid;
  const avatar = profile?.customPhotoURL || profile?.photoURL || firebaseUser.photoURL;
  const label = profile?.nickname || firebaseUser.displayName || "Mi cuenta";

  async function handleSignOut() {
    setMenuOpen(false);
    await signOutUser();
    toastSuccess("Sesión cerrada 💜");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="flex items-center gap-2 rounded-full glass p-1 pr-3 transition-transform hover:scale-[1.02]"
      >
        <span className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-brand">
          {avatar ? (
            <Image src={avatar} alt={label} fill sizes="32px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-soft text-brand">
              <UserRound className="h-4 w-4" aria-hidden />
            </span>
          )}
        </span>
        <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
          {label}
        </span>
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="glass-modal absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl p-1.5"
        >
          <Link
            role="menuitem"
            href={`/perfil/${uid}`}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-brand-soft hover:text-brand"
          >
            <UserRound className="h-4 w-4" aria-hidden /> Mi perfil
          </Link>
          {isAdmin && (
            <Link
              role="menuitem"
              href="/panel-admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-brand-soft hover:text-brand"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden /> Panel admin
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)]"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthButton;
