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
import { decodeJwt } from "@/lib/utils/jwt";
import {
  isAdminRoute,
  isDashboardRoute,
  isSupportRoute,
  checkAdminRouteAccess,
  checkDashboardRouteAccess,
  checkSupportRouteAccess,
} from "@/lib/utils/route-protection";

console.log("[Proxy] File loaded");

// Routes chỉ được phép truy cập từ domain chính (không phải tenant)
// Register chỉ được dùng để tạo company/tenant mới, không phải từ tenant subdomain
const MASTER_ONLY_GUEST_ROUTES = ["/register"];

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
 * Extract tenant domain từ request host.
 * "tenant-japan.tamabee.local" → "tenant-japan"
 * "tamabee.local" → "tamabee" (master)
 * "localhost" → "tamabee" (master)
 */
function extractTenantFromHost(request: NextRequest): string {
  const host = request.headers.get("host") || "";

  // localhost hoặc 127.0.0.1 → master domain
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return "tamabee";
  }

  // Lấy subdomain đầu tiên
  const parts = host.split(".");
  if (parts.length >= 3) {
    return parts[0]; // tenant-japan, tenant-vietnam, etc.
  } else if (parts.length === 2) {
    return parts[0]; // tamabee từ tamabee.local
  }

  return "tamabee";
}

/**
 * Kiểm tra có phải master domain không (tamabee hoặc localhost)
 */
function isMasterDomain(request: NextRequest): boolean {
  const tenant = extractTenantFromHost(request);
  return tenant === "tamabee";
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
 * 2. Proxy WebSocket requests
 * 3. Authentication & Protected routes
 * 4. i18n routing
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
  const isLogoutRequest = apiPath === "/auth/logout";

  console.log("[Proxy] API request:", request.method, targetUrl);
  console.log(
    "[Proxy] Cookies:",
    request.cookies
      .getAll()
      .map((c) => c.name)
      .join(", "),
  );

  const cookies = request.cookies.getAll();
  let cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  // Nếu không có accessToken nhưng có refreshToken, thử refresh trước
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  let refreshedCookies: string[] | undefined;
  const host = request.headers.get("host") || "";

  if (!accessToken && refreshToken) {
    console.log("[Proxy] No accessToken, attempting refresh...");
    const refreshResult = await refreshAccessTokenWithCookie(
      refreshToken,
      locale,
      host,
    );

    if (refreshResult.success && refreshResult.cookies) {
      console.log("[Proxy] Refresh successful, got new cookies");
      refreshedCookies = refreshResult.cookies;
      const newAccessToken = parseAccessTokenFromCookies(refreshResult.cookies);

      if (newAccessToken) {
        cookieString = updateCookieString(cookieString, newAccessToken);
      }
    } else {
      console.log("[Proxy] Refresh failed");
    }
  }

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

    // Forward Host header để backend xác định tenant từ subdomain
    const host = request.headers.get("Host");
    if (host) {
      headers.set("X-Forwarded-Host", host);
    }

    // Forward X-Tenant-Domain header nếu có (cho login từ tenant domain)
    const tenantDomain = request.headers.get("X-Tenant-Domain");
    if (tenantDomain) {
      headers.set("X-Tenant-Domain", tenantDomain);
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
      console.log("[Proxy] 401 received, refreshToken exists:", !!refreshToken);

      if (refreshToken) {
        const refreshResult = await refreshAccessTokenWithCookie(
          refreshToken,
          locale,
          host,
        );
        console.log(
          "[Proxy] Refresh result:",
          refreshResult.success,
          "cookies:",
          refreshResult.cookies?.length,
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

      // Refresh thất bại hoặc không có refreshToken → xóa cookies để client biết cần đăng nhập lại
      const body401 = await response.text();
      const status401 = parseStatusFromBody(body401, response.status);
      const clearResponse = new NextResponse(body401, {
        status: status401,
        statusText: response.statusText,
      });
      clearResponse.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
      clearResponse.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
      return clearResponse;
    }

    // Response bình thường
    // Kiểm tra Content-Type để xử lý binary response (PDF, ZIP, images, etc.)
    const responseContentType = response.headers.get("content-type") || "";
    const isBinaryResponse =
      responseContentType.includes("application/pdf") ||
      responseContentType.includes("application/zip") ||
      responseContentType.includes("application/octet-stream") ||
      responseContentType.includes("image/");

    let responseBody: BodyInit;
    let status: number;

    if (isBinaryResponse) {
      // Binary response: giữ nguyên ArrayBuffer
      responseBody = await response.arrayBuffer();
      status = response.status;
      console.log(
        "[Proxy] Binary response, size:",
        (responseBody as ArrayBuffer).byteLength,
      );
    } else {
      // Text/JSON response
      const body = await response.text();
      status = parseStatusFromBody(body, response.status);
      responseBody = body;
    }

    console.log("[Proxy] Response status:", status, "for", targetUrl);

    // Forward response với Set-Cookie headers
    const responseHeaders = new Headers();

    // Copy tất cả headers từ backend response (trừ set-cookie, xử lý riêng)
    response.headers.forEach((value, key) => {
      if (
        ![
          "content-encoding",
          "transfer-encoding",
          "content-length",
          "set-cookie",
        ].includes(key.toLowerCase())
      ) {
        responseHeaders.append(key, value);
      }
    });

    // Forward Set-Cookie riêng bằng getSetCookie() để giữ đúng format
    const setCookies = response.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
      console.log("[Proxy] Forwarding Set-Cookie headers:", setCookies.length);
      setCookies.forEach((cookie) => {
        responseHeaders.append("Set-Cookie", cookie);
      });
    }

    // Forward cookies từ refresh token (nếu có)
    if (refreshedCookies && refreshedCookies.length > 0) {
      console.log(
        "[Proxy] Forwarding refreshed cookies:",
        refreshedCookies.length,
      );
      refreshedCookies.forEach((cookie) => {
        responseHeaders.append("Set-Cookie", cookie);
      });
    }

    // Logout request thành công → proxy chủ động xóa cookies
    if (isLogoutRequest && status === 200) {
      console.log("[Proxy] Logout successful, clearing auth cookies via proxy");
      const logoutResponse = new NextResponse(responseBody, {
        status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
      logoutResponse.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
      logoutResponse.cookies.set("refreshToken", "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
      });
      return logoutResponse;
    }

    return new NextResponse(responseBody, {
      status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    // Backend không khả dụng → xóa sạch auth cookies để tránh state không nhất quán
    // Khi backend khởi động lại, user sẽ đăng nhập lại từ trạng thái sạch
    const errorResponse = NextResponse.json(
      { success: false, message: "API không khả dụng", status: 502 },
      { status: 502 },
    );
    errorResponse.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
    errorResponse.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
    return errorResponse;
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

  // ========== MASTER-ONLY GUEST ROUTES CHECK ==========
  // Chặn truy cập /register từ domain tenant (subdomain)
  // Register chỉ được dùng từ domain chính (tamabee.local hoặc localhost)
  if (
    matchRoute(pathname, MASTER_ONLY_GUEST_ROUTES) &&
    !isMasterDomain(request)
  ) {
    const tenantDomain = extractTenantFromHost(request);
    console.log(
      "[Proxy] Blocked access to master-only route from tenant domain:",
      tenantDomain,
      pathname,
    );
    // Redirect về trang login của tenant
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // ========== GUEST-ONLY ROUTES CHECK ==========
  // Nếu đã đăng nhập (có accessToken hoặc refreshToken) → redirect về dashboard
  // Kiểm tra này phải thực hiện TRƯỚC khi skip authentication
  if (matchRoute(pathname, GUEST_ONLY_ROUTES)) {
    const authenticated = !!(accessToken || refreshToken);
    if (authenticated) {
      console.log(
        "[Proxy] User already authenticated, redirecting to dashboard from:",
        pathname,
      );
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, request.url),
      );
    }
    // Chưa đăng nhập → cho phép truy cập guest-only routes
    return null;
  }

  // Kiểm tra accessToken có hết hạn không
  let isAccessTokenExpired = false;
  if (accessToken) {
    const decoded = decodeJwt(accessToken);
    if (decoded) {
      isAccessTokenExpired = decoded.exp * 1000 < Date.now();
      if (isAccessTokenExpired) {
        console.log(
          "[Proxy] AccessToken expired at:",
          new Date(decoded.exp * 1000).toISOString(),
        );
      }
    } else {
      // Không decode được = token invalid = coi như hết hạn
      isAccessTokenExpired = true;
      console.log("[Proxy] Failed to decode accessToken, treating as expired");
    }
  }

  // Không có accessToken HOẶC accessToken hết hạn, nhưng có refreshToken → thử refresh
  if (
    (!accessToken || isAccessTokenExpired) &&
    refreshToken &&
    matchRoute(pathname, PROTECTED_ROUTES)
  ) {
    console.log("[Proxy] Attempting to refresh token...");
    const host = request.headers.get("host") || "";
    const refreshResult = await refreshAccessTokenWithCookie(
      refreshToken,
      locale,
      host,
    );

    if (refreshResult.success && refreshResult.cookies) {
      // Redirect để browser nhận cookies mới (tránh infinite loop với _refreshed param)
      const hasRefreshed = request.nextUrl.searchParams.get("_refreshed");

      if (!hasRefreshed) {
        console.log(
          "[Proxy] Refresh successful, redirecting to set new cookies",
        );
        const redirectUrl = new URL(request.url);
        redirectUrl.searchParams.set("_refreshed", "1");

        const response = NextResponse.redirect(redirectUrl);
        refreshResult.cookies.forEach((cookie) => {
          response.headers.append("Set-Cookie", cookie);
        });

        return response;
      }
    } else {
      // Refresh thất bại → xóa sạch cookies và redirect về login
      console.log(
        "[Proxy] Refresh failed, clearing all auth cookies and redirecting to login",
      );
      const loginUrl = new URL(`/${locale}/login`, request.url);
      if (!matchRoute(pathname, GUEST_ONLY_ROUTES)) {
        loginUrl.searchParams.set("redirect", pathname);
      }
      const response = NextResponse.redirect(loginUrl);
      // Xóa sạch cả accessToken và refreshToken để tránh state không nhất quán
      response.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
      response.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
      return response;
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

  // Guest-only routes đã được xử lý ở trên, không cần check lại ở đây

  // ========== ROLE-BASED ROUTE PROTECTION ==========
  // Chỉ check khi có accessToken hợp lệ (chưa hết hạn)
  // Nếu token hết hạn, đã được xử lý ở trên (refresh hoặc redirect)
  if (accessToken && !isAccessTokenExpired) {
    const decoded = decodeJwt(accessToken);

    console.log("[Proxy] Checking role-based protection for:", pathname);

    if (decoded) {
      const { role, tenantDomain } = decoded;
      console.log("[Proxy] User role:", role, "tenantDomain:", tenantDomain);

      // /admin/* routes - chỉ Tamabee admin (ADMIN_TAMABEE hoặc MANAGER_TAMABEE)
      if (isAdminRoute(pathname)) {
        const accessResult = checkAdminRouteAccess(role);
        if (!accessResult.allowed) {
          console.log("[Proxy] Unauthorized access to /admin/* - role:", role);
          return NextResponse.redirect(
            new URL(`/${locale}/unauthorized`, request.url),
          );
        }
      }

      // /support/* routes - chỉ Tamabee employees
      if (isSupportRoute(pathname)) {
        const accessResult = checkSupportRouteAccess(role);
        if (!accessResult.allowed) {
          console.log(
            "[Proxy] Unauthorized access to /support/* - role:",
            role,
          );
          return NextResponse.redirect(
            new URL(`/${locale}/unauthorized`, request.url),
          );
        }
      }

      // /dashboard/* routes - cần tenantDomain (kể cả "tamabee")
      if (isDashboardRoute(pathname)) {
        const accessResult = checkDashboardRouteAccess(tenantDomain);
        console.log(
          "[Proxy] Dashboard access check - tenantDomain:",
          tenantDomain,
          "allowed:",
          accessResult.allowed,
        );
        if (!accessResult.allowed) {
          console.log(
            "[Proxy] Unauthorized access to /dashboard/* - no tenantDomain, decoded:",
            JSON.stringify({ role, tenantDomain, exp: decoded.exp }),
          );
          return NextResponse.redirect(
            new URL(`/${locale}/unauthorized`, request.url),
          );
        }

        // EMPLOYEE_TAMABEE không được truy cập dashboard, redirect sang /support
        if (role === "EMPLOYEE_TAMABEE") {
          console.log(
            "[Proxy] EMPLOYEE_TAMABEE accessing /dashboard - redirecting to /support",
          );
          return NextResponse.redirect(
            new URL(`/${locale}/support`, request.url),
          );
        }
      }
    } else {
      // Không decode được token - đã được xử lý ở trên
      console.log("[Proxy] Failed to decode accessToken in role check");
    }
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
