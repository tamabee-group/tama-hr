import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  API_URL,
  LOCALES,
  PROTECTED_ROUTES,
  GUEST_ONLY_ROUTES,
} from "@/lib/constants";
import { refreshAccessTokenWithCookie } from "@/lib/auth/token";
import { parseAcceptLanguage } from "@/lib/utils/locale";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Kiểm tra path có match với routes không
 */
function matchRoute(pathname: string, routes: string[]): boolean {
  const localePattern = LOCALES.join("|");
  const pathWithoutLocale =
    pathname.replace(new RegExp(`^/(${localePattern})`), "") || "/";
  return routes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`),
  );
}

/**
 * Lấy locale từ request
 */
function getLocale(request: NextRequest): string {
  // Ưu tiên cookie đã lưu
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (
    cookieLocale &&
    LOCALES.includes(cookieLocale as (typeof LOCALES)[number])
  ) {
    return cookieLocale;
  }
  // Fallback: detect từ Accept-Language header
  return parseAcceptLanguage(request.headers.get("Accept-Language"));
}

/**
 * Forward request đến backend API
 */
async function forwardToApi(
  targetUrl: string,
  method: string,
  headers: Headers,
  body: BodyInit | null,
): Promise<Response> {
  return fetch(targetUrl, {
    method,
    headers,
    body: method !== "GET" && method !== "HEAD" ? body : undefined,
  });
}

/**
 * Parse accessToken từ Set-Cookie headers
 */
function parseAccessTokenFromCookies(cookies: string[]): string | null {
  for (const cookie of cookies) {
    const match = cookie.match(/accessToken=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Cập nhật cookie string với accessToken mới
 */
function updateCookieString(
  originalCookies: string,
  newAccessToken: string,
): string {
  const cookiesWithoutOldToken = originalCookies
    .split("; ")
    .filter((c) => !c.startsWith("accessToken="))
    .join("; ");

  return cookiesWithoutOldToken
    ? `${cookiesWithoutOldToken}; accessToken=${newAccessToken}`
    : `accessToken=${newAccessToken}`;
}

/**
 * Parse status từ JSON response body
 */
function parseStatusFromBody(body: string, defaultStatus: number): number {
  try {
    const json = JSON.parse(body);
    if (json.status && typeof json.status === "number") {
      return json.status;
    }
  } catch {
    // Không phải JSON
  }
  return defaultStatus;
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Middleware chính:
 * 1. Proxy API requests (với auto refresh token)
 * 2. Authentication & Protected routes
 * 3. i18n routing
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========== 1. PROXY API REQUESTS ==========
  if (pathname.startsWith("/api/")) {
    return handleApiProxy(request);
  }

  // ========== 2. AUTHENTICATION ==========
  const authResult = await handleAuthentication(request);
  if (authResult) return authResult;

  // ========== 3. I18N ROUTING ==========
  return handleI18nRouting(request);
}

/**
 * Xử lý proxy API requests với auto refresh token
 */
async function handleApiProxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const apiPath = pathname.replace("/api", "");
  const targetUrl = `${API_URL}/api${apiPath}${request.nextUrl.search}`;
  const locale = getLocale(request);

  const cookies = request.cookies.getAll();
  const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  // Kiểm tra có phải multipart/form-data không (file upload)
  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  // Đọc body: giữ nguyên ArrayBuffer cho file upload, text cho JSON
  let requestBody: BodyInit | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    if (isMultipart) {
      requestBody = await request.arrayBuffer();
    } else {
      requestBody = await request.text();
    }
  }

  // Tạo headers, giữ nguyên Content-Type cho multipart
  const createHeaders = (cookieStr: string): Headers => {
    const headers = new Headers();
    headers.set("Accept-Language", locale);
    headers.set("Cookie", cookieStr);

    // Copy Content-Type từ request gốc (quan trọng cho multipart boundary)
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    return headers;
  };

  try {
    let response = await forwardToApi(
      targetUrl,
      request.method,
      createHeaders(cookieString),
      requestBody,
    );

    // Nếu 401, thử refresh token
    if (response.status === 401) {
      const refreshToken = request.cookies.get("refreshToken")?.value;

      if (refreshToken) {
        const refreshResult = await refreshAccessTokenWithCookie(
          refreshToken,
          locale,
        );

        if (refreshResult.success && refreshResult.cookies) {
          const newAccessToken = parseAccessTokenFromCookies(
            refreshResult.cookies,
          );

          if (newAccessToken) {
            const updatedCookieString = updateCookieString(
              cookieString,
              newAccessToken,
            );

            // Retry request với token mới
            response = await forwardToApi(
              targetUrl,
              request.method,
              createHeaders(updatedCookieString),
              requestBody,
            );

            // Forward Set-Cookie headers
            const responseHeaders = new Headers(response.headers);
            refreshResult.cookies.forEach((cookie) => {
              responseHeaders.append("Set-Cookie", cookie);
            });

            const body = await response.text();
            const status = parseStatusFromBody(body, response.status);

            return new NextResponse(body, {
              status,
              statusText: response.statusText,
              headers: responseHeaders,
            });
          }
        }
      }
    }

    // Response bình thường
    const body = await response.text();
    const status = parseStatusFromBody(body, response.status);

    return new NextResponse(body, {
      status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "API không khả dụng", status: 502 },
      { status: 502 },
    );
  }
}

/**
 * Xử lý authentication và protected routes
 */
async function handleAuthentication(
  request: NextRequest,
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const locale = getLocale(request);
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Không có accessToken nhưng có refreshToken → thử refresh
  if (!accessToken && refreshToken && matchRoute(pathname, PROTECTED_ROUTES)) {
    const refreshResult = await refreshAccessTokenWithCookie(
      refreshToken,
      locale,
    );

    if (refreshResult.success && refreshResult.cookies) {
      // Redirect để browser nhận cookies mới (tránh infinite loop với _refreshed param)
      const hasRefreshed = request.nextUrl.searchParams.get("_refreshed");

      if (!hasRefreshed) {
        const redirectUrl = new URL(request.url);
        redirectUrl.searchParams.set("_refreshed", "1");

        const response = NextResponse.redirect(redirectUrl);
        refreshResult.cookies.forEach((cookie) => {
          response.headers.append("Set-Cookie", cookie);
        });

        return response;
      }
    } else {
      // Refresh thất bại → redirect về login
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Xóa _refreshed param để URL sạch
  if (request.nextUrl.searchParams.has("_refreshed")) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("_refreshed");
    return NextResponse.redirect(cleanUrl);
  }

  const authenticated = !!(accessToken || refreshToken);

  // Protected routes: redirect về login nếu chưa đăng nhập
  if (matchRoute(pathname, PROTECTED_ROUTES) && !authenticated) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Guest-only routes: redirect về dashboard nếu đã đăng nhập
  if (matchRoute(pathname, GUEST_ONLY_ROUTES) && authenticated) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return null;
}

/**
 * Xử lý i18n routing
 */
function handleI18nRouting(request: NextRequest): NextResponse {
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
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
