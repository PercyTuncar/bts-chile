"use client";

// Shell del panel admin: sidebar glass + guard de rol — PRD §11.2.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PillButton } from "@/components/ui/PillButton";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/panel-admin", label: "📊 Overview" },
  { href: "/panel-admin/usuarios", label: "👥 Usuarios" },
  { href: "/panel-admin/entradas", label: "🎟 Entradas" },
  { href: "/panel-admin/tienda", label: "🛍 Tienda" },
  { href: "/panel-admin/noticias", label: "📝 Noticias" },
  { href: "/panel-admin/moderacion", label: "🗣 Moderación" },
  { href: "/panel-admin/membresias", label: "💜 Membresías" },
  { href: "/panel-admin/cumpleanos", label: "🎂 Cumpleaños" },
  { href: "/panel-admin/newsletter", label: "📧 Newsletter" },
  { href: "/panel-admin/sponsors", label: "🤝 Sponsors" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status, isAdmin } = useAuth();
  const openLogin = useAuthStore((s) => s.openLogin);

  if (status === "loading") {
    return <div className="p-10 text-center text-text-muted">Verificando acceso…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="mb-2 text-h2 font-semibold">Acceso restringido</h1>
        <p className="mb-6 text-text-muted">
          Esta sección es solo para administradores de BTS Chile.
        </p>
        {status !== "authenticated" ? (
          <PillButton onClick={openLogin}>Entrar</PillButton>
        ) : (
          <Link href="/">
            <PillButton variant="secondary">Volver al inicio</PillButton>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1280px] gap-6 px-4 py-8">
      <aside className="sticky top-24 hidden h-fit w-56 shrink-0 flex-col gap-1 rounded-card glass-card p-3 lg:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href ? "bg-brand text-white" : "hover:bg-brand-soft hover:text-brand",
            )}
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default AdminShell;
