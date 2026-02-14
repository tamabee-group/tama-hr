import { cookies } from "next/headers";
import { refreshAccessTokenWithCookie } from "@/lib/auth/token";

/**
 * Fetch server cho Server Components, Route Handlers, Server Actions
 * @server-only
 *
 * Tính năng:
 * - Tự động đọc cookies từ request
 * - Tự động refresh token khi 401
 * - Hỗ trợ Next.js caching
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export interface FetchServerOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
  revalidate?: number | false;
  tags?: string[];
}

export interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  errorCode?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Lấy tokens từ cookies
 * @server-only
 */
async function getTokens(): Promise<{
  accessToken?: string;
  refreshToken?: string;
}> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("accessToken")?.value,
    refreshToken: cookieStore.get("refreshToken")?.value,
  };
}

/**
 * Tạo cookie string từ tokens
 */
function buildCookieString(
  accessToken?: string,
  refreshToken?: string,
): string {
  const parts: string[] = [];
  if (accessToken) parts.push(`accessToken=${accessToken}`);
  if (refreshToken) parts.push(`refreshToken=${refreshToken}`);
  return parts.join("; ");
}

/**
 * Lấy locale từ cookie
 * @server-only
 */
async function getLocaleFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value || null;
}

/**
 * Parse response text thành ApiResponse
 * Xử lý cả trường hợp backend trả HTML (502/503 từ nginx)
 */
function parseResponse<T>(
  text: string,
  httpStatus: number,
): { result: ApiResponse<T>; status: number } {
  if (!text) {
    const errorMessages: Record<number, string> = {
      401: "Phiên đăng nhập hết hạn",
      403: "Không có quyền truy cập",
      404: "Không tìm thấy tài nguyên",
      500: "Lỗi server",
      502: "API không khả dụng",
      503: "API đang bảo trì",
    };
    throw new ApiError(
      errorMessages[httpStatus] || `Lỗi HTTP ${httpStatus}`,
      httpStatus || 500,
    );
  }

  // Kiểm tra response có phải HTML không (502/503 từ nginx trả HTML)
  const trimmed = text.trimStart();
  if (trimmed.startsWith("<") || trimmed.startsWith("<!")) {
    const errorMessages: Record<number, string> = {
      502: "API không khả dụng",
      503: "API đang bảo trì",
    };
    throw new ApiError(
      errorMessages[httpStatus] || `API không khả dụng (HTTP ${httpStatus})`,
      httpStatus || 502,
    );
  }

  let result: ApiResponse<T>;
  try {
    result = JSON.parse(text);
  } catch {
    throw new ApiError(
      `Lỗi parse JSON: ${text.substring(0, 100)}`,
      httpStatus || 500,
    );
  }

  return { result, status: result.status || httpStatus };
}

/**
 * Thực hiện fetch request
 */
async function doFetch(
  url: string,
  fetchOptions: RequestInit,
  cookieString: string,
): Promise<Response> {
  const headers = { ...(fetchOptions.headers as Record<string, string>) };
  if (cookieString) {
    headers["Cookie"] = cookieString;
  }
  return fetch(url, { ...fetchOptions, headers });
}

/**
 * Fetch server với auto refresh token
 * @server-only
 */
async function fetchServer<T = unknown>(
  endpoint: string,
  options: FetchServerOptions = {},
): Promise<T> {
  const {
    body,
    skipAuth = false,
    revalidate,
    tags,
    headers: customHeaders,
    ...restOptions
  } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const locale = await getLocaleFromCookie();
  const { accessToken, refreshToken } = await getTokens();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(locale && { "Accept-Language": locale }),
    ...(customHeaders as Record<string, string>),
  };

  // Cấu hình Next.js caching
  const nextOptions: { revalidate?: number | false; tags?: string[] } = {};
  if (revalidate !== undefined) nextOptions.revalidate = revalidate;
  if (tags) nextOptions.tags = tags;

  const fetchOptions: RequestInit & { next?: typeof nextOptions } = {
    ...restOptions,
    headers,
  };

  if (Object.keys(nextOptions).length > 0) {
    fetchOptions.next = nextOptions;
  }

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  let cookieString = skipAuth
    ? ""
    : buildCookieString(accessToken, refreshToken);

  // Thực hiện request
  let response = await doFetch(url, fetchOptions, cookieString);
  let text = await response.text();

  // Nếu 401 và có refreshToken → thử refresh
  if (response.status === 401 && refreshToken && !skipAuth) {
    const refreshResult = await refreshAccessTokenWithCookie(
      refreshToken,
      locale || undefined,
    );

    if (refreshResult.success && refreshResult.cookies) {
      // Parse accessToken mới
      let newAccessToken: string | undefined;
      for (const cookie of refreshResult.cookies) {
        const match = cookie.match(/accessToken=([^;]+)/);
        if (match) {
          newAccessToken = match[1];
          break;
        }
      }

      if (newAccessToken) {
        // Retry với token mới
        cookieString = buildCookieString(newAccessToken, refreshToken);
        response = await doFetch(url, fetchOptions, cookieString);
        text = await response.text();
      }
    }
  }

  // Parse response
  const { result, status } = parseResponse<T>(text, response.status);

  if (!result.success || status >= 400) {
    throw new ApiError(
      result.message || "Có lỗi xảy ra",
      status,
      result.errorCode,
    );
  }

  return result.data;
}

/**
 * Shorthand methods cho fetchServer
 * @server-only
 */
export const apiServer = {
  get: <T = unknown>(endpoint: string, options?: FetchServerOptions) =>
    fetchServer<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: FetchServerOptions,
  ) =>
    fetchServer<T>(endpoint, {
      ...options,
      method: "POST",
      body,
      cache: "no-store",
    }),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: FetchServerOptions,
  ) =>
    fetchServer<T>(endpoint, {
      ...options,
      method: "PUT",
      body,
      cache: "no-store",
    }),

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: FetchServerOptions,
  ) =>
    fetchServer<T>(endpoint, {
      ...options,
      method: "PATCH",
      body,
      cache: "no-store",
    }),

  delete: <T = unknown>(endpoint: string, options?: FetchServerOptions) =>
    fetchServer<T>(endpoint, {
      ...options,
      method: "DELETE",
      cache: "no-store",
    }),
};
