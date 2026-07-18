"use client";

// Modal de inicio de sesión con Google — PRD §4.1.
// Glass centrado (desktop) / bottom sheet (móvil), foco atrapado, cierre por Esc/backdrop.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuthStore } from "@/hooks/useAuth";
import { signInWithGoogle } from "./authActions";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function LoginModal() {
  const open = useAuthStore((s) => s.loginModalOpen);
  const closeLogin = useAuthStore((s) => s.closeLogin);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      closeLogin();
      if (isNewUser) {
        router.push("/completar-perfil");
      } else {
        toastSuccess("¡Bienvenida de vuelta! 💜");
      }
    } catch (err) {
      console.error(err);
      toastError("No se pudo iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={closeLogin} title="Entrar a BTS Chile">
      <div className="aurora -mx-6 -mt-2 mb-4 px-6 py-6 text-center">
        <p className="text-2xl">💜</p>
        <p className="mt-1 text-text-muted">
          Únete a la comunidad ARMY más grande de Chile.
        </p>
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-button border border-[color-mix(in_srgb,var(--text)_12%,transparent)] bg-white font-medium text-[#1f1f1f] transition-colors hover:bg-[#f7f7f7] disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "Conectando…" : "Continuar con Google"}
      </button>
      <p className="mt-4 text-center text-xs text-text-muted">
        Solo usamos tu cuenta de Google para identificarte. Sin contraseñas.
      </p>
    </Modal>
  );
}

export default LoginModal;
