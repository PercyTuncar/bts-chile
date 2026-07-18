"use client";

// Navbar glass sticky — PRD §3.1, §3.3.
// En móvil (<md) solo muestra el logo; el resto vive en el Bottom Navigation.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { MessagesIcon } from "@/components/layout/MessagesIcon";
import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NAV_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils/cn";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="glass-nav sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
          <span>ARMY CHILE</span>
          <span aria-hidden>💜</span>
        </Link>

        {/* Nav desktop (≥ md) */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-soft text-brand" : "text-text-muted hover:text-text",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Acciones: notificaciones y mensajes visibles en todos los tamaños */}
        <div className="flex items-center gap-1">
          <NotificationsBell />
          <MessagesIcon />
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
