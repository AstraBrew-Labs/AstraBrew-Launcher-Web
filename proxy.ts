import { NextResponse, type NextRequest } from "next/server";
import {
  getCountry,
  LOCALE_COOKIE,
  localeFromPath,
  localizedPath,
  REGION_COOKIE,
  resolveLocale,
  resolveRegion,
} from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/_vercel/insights/") ||
    pathname === "/cdn-cgi/rum" ||
    pathname === "/llms.txt" ||
    pathname.startsWith("/.well-known/") ||
    ["/icon.svg", "/file.svg", "/globe.svg", "/next.svg", "/vercel.svg", "/window.svg"].includes(pathname) ||
    localeFromPath(pathname)
  ) {
    return NextResponse.next();
  }

  const region = resolveRegion({
    country: getCountry(request.headers),
    browserRegion: request.cookies.get(REGION_COOKIE)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  });
  const locale = resolveLocale({
    preference: request.cookies.get(LOCALE_COOKIE)?.value,
    region,
  });
  const url = request.nextUrl.clone();
  url.pathname = localizedPath(locale, pathname);
  const response = NextResponse.redirect(url, 307);
  // Redirect destinations depend on user preferences and must not be shared-cached.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
