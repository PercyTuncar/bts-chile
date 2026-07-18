"use client";

// Reclamo de username: los usuarios existentes sin `username` son enviados a
// completar-perfil para elegir uno (decisión de producto: reclamar al entrar).
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function UsernameGate() {
  const { status, profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      status === "authenticated" &&
      profile &&
      !profile.username &&
      pathname !== "/completar-perfil"
    ) {
      router.push("/completar-perfil");
    }
  }, [status, profile, pathname, router]);

  return null;
}

export default UsernameGate;
