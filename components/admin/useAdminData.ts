"use client";

// Hook de carga de datos para secciones admin (fetch + reload). setState solo en callbacks.
import { useEffect, useState } from "react";

export function useAdminData<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    fn()
      .then((d) => {
        if (active) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("admin data:", err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, reload: () => setNonce((n) => n + 1) };
}
