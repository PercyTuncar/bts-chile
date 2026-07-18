"use client";

// Sheet "Más" del Bottom Navigation móvil — rutas dinámicas por rol + tema + logout.
// PRD §3.1, §3.3. Contiene las rutas que no están en la barra inferior.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck, ShoppingBag, Sparkles, UserSearch, Users } from "lucide-react";
import { signOutUser } from "@/components/auth/authActions";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Sheet } from "@/components/ui/Sheet";
import { toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

const EXTRA_LINKS = [
  { href: "/tienda", label: "Tienda BTS Chile", icon: ShoppingBag },
  { href: "/comunidad", label: "Comunidad ARMY", icon: Users },
  { href: "/comunidad/personas", label: "Buscar ARMY's", icon: UserSearch },
  { href: "/membresia", label: "Membresía ARMY Boom v4", icon: Sparkles },
];

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated } = useAuth();

  async function handleLogout() {
    onClose();
    await signOutUser();
    toastSuccess("Sesión cerrada 💜");
  }

  return (
    <Sheet open={open} onClose={onClose} title="Más opciones">
      <nav className="flex flex-col gap-1">
        {EXTRA_LINKS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                active ? "bg-brand-soft text-brand" : "hover:bg-brand-soft hover:text-brand",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden /> {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/panel-admin"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-brand-soft hover:text-brand"
          >
            <ShieldCheck className="h-5 w-5" aria-hidden /> Panel admin
          </Link>
        )}
      </nav>

      <div className="my-3 flex items-center justify-between border-t border-[color-mix(in_srgb,var(--text)_8%,transparent)] pt-4">
        <span className="text-sm font-medium">Tema claro / oscuro</span>
        <ThemeToggle />
      </div>

      {isAuthenticated && (
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-danger transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]"
        >
          <LogOut className="h-5 w-5" aria-hidden /> Cerrar sesión
        </button>
      )}
    </Sheet>
  );
}

export default MobileMenu;
