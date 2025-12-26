import { cookies } from "next/headers";

/**
 * Fetch server cho môi trường server side (Server Components, Route Handlers, Server Actions)
 * @server-only - Chỉ sử dụng được ở server side
 *
 * Tính năng:
 * - Tự động đọc cookies từ request headers
 * - Tự động gửi Accept-Language header từ NEXT_LOCALE cookie
 * - Hỗ trợ Next.js caching và revalidation
 * - Tự động parse JSON response
 * - Xử lý lỗi thống nhất
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export interface FetchServerOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean; // Bỏ qua việc gửi cookies
  revalidate?: number | false; // Next.js revalidation (giây)
  tags?: string[]; // Next.js cache tags
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
 * Lấy cookie string từ request headers
 * @server-only - Chỉ sử dụng được ở server side
 */
async function getCookieString(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const cookieParts: string[] = [];
  if (accessToken) cookieParts.push(`accessToken=${accessToken}`);
  if (refreshToken) cookieParts.push(`refreshToken=${refreshToken}`);

  return cookieParts.join("; ");
}

/**
 * Lấy locale từ cookie NEXT_LOCALE
 * @server-only - Chỉ sử dụng được ở server side
 */
async function getLocaleFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value || null;
}

/**
 * Fetch server với hỗ trợ Next.js caching (dùng nội bộ)
 * @server-only - Chỉ sử dụng được ở server side
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

  // Lấy locale từ cookie để gửi trong header
  const locale = await getLocaleFromCookie();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(locale && { "Accept-Language": locale }),
    ...customHeaders,
  };

  // Thêm cookies nếu cần auth
  if (!skipAuth) {
    const cookieString = await getCookieString();
    if (cookieString) {
      (headers as Record<string, string>)["Cookie"] = cookieString;
    }
  }

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

  const response = await fetch(url, fetchOptions);
  const result: ApiResponse<T> = await response.json();

  // Kiểm tra status từ response body (ưu tiên) hoặc HTTP status
  const status = result.status || response.status;

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
 * @server-only - Chỉ sử dụng được ở server side
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
