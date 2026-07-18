import type { Metadata } from "next";
import CompletarPerfilForm from "./CompletarPerfilForm";

// Onboarding — noindex (§15.12).
export const metadata: Metadata = {
  title: "Completar perfil",
  robots: { index: false, follow: false },
};

export default function CompletarPerfilPage() {
  return <CompletarPerfilForm />;
}
