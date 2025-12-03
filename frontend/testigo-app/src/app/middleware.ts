import { NextResponse, NextRequest } from "next/server";

const VALID_ROLES = ["admin", "editor", "contributor"];

export function middleware(request: NextRequest) {
  // Leer la cookie persistida por Zustand (user-storage)
  const cookie = request.cookies.get("user-storage");
  if (!cookie) {
    // Si no hay cookie, redirigir a login
    return NextResponse.redirect("/login");
  }
  // Decodificar el valor de la cookie (Zustand persist usa JSON.stringify)
  let userData: any = {};
  try {
    userData = JSON.parse(decodeURIComponent(cookie.value));
  } catch {
    return NextResponse.redirect("/login");
  }
  // Validar token y rol
  const { token, rol } = userData;
  if (!token || !rol) {
    return NextResponse.redirect("/login");
  }
  if (!VALID_ROLES.includes(rol)) {
    // Si el rol no es válido, redirigir a 404
    return NextResponse.redirect("/404");
  }
  // Si todo está bien, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};