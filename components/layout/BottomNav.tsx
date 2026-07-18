"use client";

// Bottom Navigation Bar móvil (estilo app) — glass, safe-area, md:hidden.
// 5 items: Inicio · Noticias · Perfil (avatar central) · Entradas · Más.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogIn, Menu, Newspaper, Ticket, UserRound } from "lucide-react";
import { useState } from "react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

const itemCls = (active: boolean) =>
  cn(
    "flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-transform active:scale-90",
    active ? "text-brand" : "text-text-muted",
  );

export function BottomNav() {
  const pathname = usePathname();
  const { status, firebaseUser, profile } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);
  const [menuOpen, setMenuOpen] = useState(false);

  const authed = status === "authenticated" && !!firebaseUser;
  const avatar =
    profile?.customPhotoURL || profile?.photoURL || firebaseUser?.photoURL || null;
  const profileActive = pathname.startsWith("/perfil");

  return (
    <>
      <nav
        aria-label="Navegación móvil"
        className="glass-nav fixed bottom-0 left-0 z-50 w-full border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={itemCls(pathname === "/")}
          >
            <Home className="h-6 w-6" aria-hidden />
            <span>Inicio</span>
          </Link>

          <Link
            href="/noticias"
            aria-current={pathname === "/noticias" ? "page" : undefined}
            className={itemCls(pathname === "/noticias")}
          >
            <Newspaper className="h-6 w-6" aria-hidden />
            <span>Noticias</span>
          </Link>

          {/* Perfil (centro): avatar si logueado, si no icono de ingresar */}
          {authed ? (
            <Link
              href={`/perfil/${profile?.username ?? firebaseUser.uid}`}
              aria-current={profileActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-transform active:scale-90",
                profileActive ? "text-brand" : "text-text-muted",
              )}
            >
              <span
                className={cn(
                  "relative h-9 w-9 overflow-hidden rounded-full shadow-lg ring-2",
                  profileActive ? "ring-brand" : "ring-brand/50",
                )}
              >
                {avatar ? (
                  <Image src={avatar} alt="Perfil" fill sizes="36px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-brand-soft text-brand">
                    <UserRound className="h-4 w-4" aria-hidden />
                  </span>
                )}
              </span>
              <span>Perfil</span>
            </Link>
          ) : (
            <button type="button" onClick={openLogin} className={itemCls(false)}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-lg">
                <LogIn className="h-4 w-4" aria-hidden />
              </span>
              <span>Entrar</span>
            </button>
          )}

          <Link
            href="/entradas"
            aria-current={pathname === "/entradas" ? "page" : undefined}
            className={itemCls(pathname === "/entradas")}
          >
            <Ticket className="h-6 w-6" aria-hidden />
            <span>Entradas</span>
          </Link>

          <button type="button" onClick={() => setMenuOpen(true)} className={itemCls(menuOpen)}>
            <Menu className="h-6 w-6" aria-hidden />
            <span>Más</span>
          </button>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

export default BottomNav;
