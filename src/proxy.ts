import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Gate de todo /admin. Corre en el Edge runtime → usa auth.ts (Web Crypto), que es
// Edge-safe. Protege las navegaciones a las páginas; el guard real de las escrituras
// (Server Actions) vive dentro de cada action con requireAuth().
// Convención Next 16: proxy.ts reemplaza al deprecado middleware.ts.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await verifySessionToken(req.cookies.get(COOKIE_NAME)?.value);

  // La página de login es pública. Si ya hay sesión, saltea el login → panel.
  if (pathname === "/admin/login") {
    if (authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Todo el resto de /admin exige sesión válida.
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
