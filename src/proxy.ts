import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  API_URL,
  LOCALES,
  FALLBACK_LOCALE,
  PROTECTED_ROUTES,
  GUEST_ONLY_ROUTES,
} from "@/lib/constants";
import { refreshAccessTokenWithCookie } from "@/lib/auth/token";
import { parseAcceptLanguage } from "@/lib/utils/locale";

/**
 * Kiểm tra xem path có match với pattern không
 */
function matchRoute(pathname: string, routes: string[]): boolean {
  // Loại bỏ locale prefix khỏi pathname
  const localePattern = LOCALES.join("|");
  const pathWithoutLocale =
    pathname.replace(new RegExp(`^/(${localePattern})`), "") || "/";
  return routes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`),
  );
}

/**
 * Lấy locale từ request (ưu tiên ngôn ngữ trình duyệt của user)
 */
function getLocale(request: NextRequest): string {
  // 1. Ưu tiên cookie NEXT_LOCALE (user đã chọn ngôn ngữ trước đó)
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (
    cookieLocale &&
    LOCALES.includes(cookieLocale as (typeof LOCALES)[number])
  ) {
    return cookieLocale;
  }

  // 2. Detect từ Accept-Language header (ngôn ngữ trình duyệt)
  const acceptLanguage = request.headers.get("Accept-Language");
  return parseAcceptLanguage(acceptLanguage);
}

/**
 * Forward request đến backend API
 */
async function forwardToApi(
  request: NextRequest,
  targetUrl: string,
  locale: string,
  cookieString: string,
): Promise<Response> {
  const headers = new Headers(request.headers);
  headers.set("Accept-Language", locale);
  headers.set("Cookie", cookieString);

  return fetch(targetUrl, {
    method: request.method,
    headers,
    body:
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.text()
        : undefined,
  });
}

/**
 * Middleware chính xử lý:
 * 1. Proxy API requests (với auto refresh token)
 * 2. Authentication & Protected routes
 * 3. Locale detection & i18n routing
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === 1. PROXY API REQUESTS ===
  // Forward các request /api/* đến backend
  if (pathname.startsWith("/api/")) {
    const apiPath = pathname.replace("/api", "");
    const targetUrl = `${API_URL}/api${apiPath}${request.nextUrl.search}`;

    // Lấy locale để gửi trong header
    const locale = getLocale(request);

    // Lấy cookies
    const cookies = request.cookies.getAll();
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    try {
      let response = await forwardToApi(
        request,
        targetUrl,
        locale,
        cookieString,
      );

      // Nếu 401 (Unauthorized), thử refresh token
      if (response.status === 401) {
        const refreshToken = request.cookies.get("refreshToken")?.value;

        if (refreshToken) {
          const refreshResult = await refreshAccessTokenWithCookie(
            refreshToken,
            locale,
          );

          if (refreshResult.success && refreshResult.cookies) {
            // Tạo cookie string mới với accessToken mới
            const newCookies = refreshResult.cookies
              .map((c) => c.split(";")[0])
              .join("; ");
            const updatedCookieString = `${cookieString}; ${newCookies}`;

            // Retry request với token mới
            response = await forwardToApi(
              request,
              targetUrl,
              locale,
              updatedCookieString,
            );

            // Tạo response và forward Set-Cookie headers
            const responseHeaders = new Headers(response.headers);
            refreshResult.cookies.forEach((cookie) => {
              responseHeaders.append("Set-Cookie", cookie);
            });

            // Đọc body và lấy status từ JSON nếu có
            const body = await response.text();
            let status = response.status;

            try {
              const json = JSON.parse(body);
              if (json.status && typeof json.status === "number") {
                status = json.status;
              }
            } catch {
              // Không phải JSON, giữ nguyên status
            }

            return new NextResponse(body, {
              status,
              statusText: response.statusText,
              headers: responseHeaders,
            });
          }
        }
      }

      // Đọc body và lấy status từ JSON nếu có
      const body = await response.text();
      let status = response.status;

      try {
        const json = JSON.parse(body);
        if (json.status && typeof json.status === "number") {
          status = json.status;
        }
      } catch {
        // Không phải JSON, giữ nguyên status
      }

      // Tạo response mới với headers từ backend
      const responseHeaders = new Headers(response.headers);

      return new NextResponse(body, {
        status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch {
      return NextResponse.json(
        { success: false, message: "API không khả dụng", status: 502 },
        { status: 502 },
      );
    }
  }

  // === 2. AUTHENTICATION & PROTECTED ROUTES ===
  const locale = getLocale(request);
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Nếu không có accessToken nhưng có refreshToken, thử refresh
  if (!accessToken && refreshToken && matchRoute(pathname, PROTECTED_ROUTES)) {
    const refreshResult = await refreshAccessTokenWithCookie(
      refreshToken,
      locale,
    );

    if (refreshResult.success && refreshResult.cookies) {
      // Refresh thành công, tiếp tục với i18n routing và set cookies mới
      const browserLocale = getLocale(request);
      const handleI18nRouting = createMiddleware({
        locales: LOCALES as unknown as string[],
        defaultLocale: browserLocale,
        localeDetection: true,
      });

      const response = handleI18nRouting(request);
      response.headers.set("x-locale", browserLocale);

      // Forward Set-Cookie headers
      refreshResult.cookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });

      return response;
    } else {
      // Refresh thất bại, redirect về login
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const authenticated = !!(accessToken || refreshToken);

  // Kiểm tra protected routes - redirect về login nếu chưa đăng nhập
  if (matchRoute(pathname, PROTECTED_ROUTES) && !authenticated) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Kiểm tra guest-only routes - redirect về dashboard nếu đã đăng nhập
  if (matchRoute(pathname, GUEST_ONLY_ROUTES) && authenticated) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // === 3. I18N ROUTING ===
  const browserLocale = getLocale(request);

  const handleI18nRouting = createMiddleware({
    locales: LOCALES as unknown as string[],
    defaultLocale: browserLocale,
    localeDetection: true,
  });

  const response = handleI18nRouting(request);
  response.headers.set("x-locale", browserLocale);

  return response;
}

export const config = {
  // Match tất cả các path trừ static files và _next
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
