import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Optimistic gate in front of the admin UI. It only checks that a valid session
 * cookie exists; every data read still re-verifies through the DAL. Keeping it
 * cheap means no database round trip on every navigation.
 */
const PROTECTED_PAGE_PREFIXES = ["/admin"];
const PUBLIC_ADMIN_PAGES = ["/admin/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isPublicAdminPage = PUBLIC_ADMIN_PAGES.includes(pathname);

  if (!isProtectedPage) return NextResponse.next();

  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isPublicAdminPage) {
    // Signed in and sitting on the login screen: send them to the panel.
    if (session) return NextResponse.redirect(new URL("/admin", request.nextUrl));
    // Signed out: the login page has to render here. Redirecting would point
    // the browser back at this same URL and spin in a redirect loop.
    return NextResponse.next();
  }

  if (!session) {
    // Preserve where they were headed so login can bounce them back.
    const loginUrl = new URL("/admin/login", request.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
