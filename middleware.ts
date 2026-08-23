// Middleware: marca rutas privadas/transaccionales como noindex — PRD §11, §15.12.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Para rutas privadas: noindex
  const isPrivateRoute = [
    "/panel-admin",
    "/completar-perfil",
    "/perfil",
    "/entradas/comprar",
    "/buscar",
  ].some(path => url.pathname.startsWith(path));

  if (isPrivateRoute) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  return NextResponse.next();
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
