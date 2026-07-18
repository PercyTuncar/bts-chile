"use client";

// Toast — notificaciones glass no intrusivas, esquina inferior derecha (PRD §3.3).
// Envuelve react-hot-toast con estilo del Design System.
import toast, { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        className: "glass",
        style: {
          background: "color-mix(in srgb, var(--surface) 75%, transparent)",
          color: "var(--text)",
          border: "1px solid color-mix(in srgb, var(--text) 10%, transparent)",
          borderRadius: "16px",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        },
        success: { iconTheme: { primary: "var(--brand)", secondary: "#fff" } },
        error: { iconTheme: { primary: "var(--danger)", secondary: "#fff" } },
      }}
    />
  );
}

export const toastSuccess = (message: string) => toast.success(message);
export const toastError = (message: string) => toast.error(message);
export const toastInfo = (message: string) => toast(message);

export { toast };
export default ToastProvider;
