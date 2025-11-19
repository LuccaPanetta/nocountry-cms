import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Aquí va la lógica para validar token y roles

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Ejemplo: "/dashboard/:path*"
  ],
};
