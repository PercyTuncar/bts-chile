// Middleware: marca rutas privadas/transaccionales como noindex — PRD §11, §15.12.
import { NextResponse } from "next/server";

export function middleware() {
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: [
    "/panel-admin/:path*",
    "/completar-perfil",
    "/perfil/:path*",
    "/entradas/comprar",
    "/buscar",
  ],
};
