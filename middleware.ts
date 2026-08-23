// Middleware: marca rutas privadas/transaccionales como noindex — PRD §11, §15.12.
// También maneja redirecciones canónicas (www, https)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Redirección canónica: siempre usar btschile.com (sin www)
  // Google prefiere una versión consistente
  if (hostname.startsWith("www.")) {
    url.hostname = hostname.replace("www.", "");
    return NextResponse.redirect(url, 301);
  }

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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).)*",
  ],
};
