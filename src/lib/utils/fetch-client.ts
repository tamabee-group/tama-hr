"use client";

import { getLocaleFromCookie } from "./locale";

/**
 * Fetch client cho môi trường client side
 * @client-only - Chỉ sử dụng được ở client side
 *
 * Tính năng:
 * - Gọi qua Next.js proxy (/api/*) để đảm bảo cookies được xử lý đúng
 * - Proxy tự động refresh token khi accessToken hết hạn (401)
 * - Tự động gửi Accept-Language header từ NEXT_LOCALE cookie
 * - Tự động parse JSON response
 * - Xử lý lỗi thống nhất
 * - Clear token và redirect về login khi 401 (sau khi proxy đã thử refresh)
 */

export interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean; // Bỏ qua việc gửi credentials
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
 * Clear tất cả auth cookies và redirect về login
 * Được gọi khi API trả về 401 (sau khi proxy đã thử refresh token)
 */
function handleUnauthorized(): void {
  // Clear cookies
  document.cookie =
    "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie =
    "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  // Clear localStorage
  localStorage.removeItem("currentUser");
  localStorage.removeItem("hasSession");

  // Lấy locale hiện tại từ URL hoặc cookie
  const locale = getLocaleFromCookie() || "en";
  const currentPath = window.location.pathname;

  // Redirect về login với redirect param
  const loginUrl = `/${locale}/login?redirect=${encodeURIComponent(currentPath)}`;
  window.location.href = loginUrl;
}

/**
 * Chuyển đổi endpoint thành URL qua proxy
 * /api/users -> /api/users (giữ nguyên)
 * /users -> /api/users (thêm /api prefix)
 */
function toProxyUrl(endpoint: string): string {
  // Nếu đã có /api prefix, giữ nguyên
  if (endpoint.startsWith("/api/")) {
    return endpoint;
  }
  // Nếu là full URL, bỏ qua proxy
  if (endpoint.startsWith("http")) {
    return endpoint;
  }
  // Thêm /api prefix để đi qua proxy
  return `/api${endpoint}`;
}

/**
 * Fetch client qua Next.js proxy (dùng nội bộ)
 * Proxy sẽ tự động xử lý refresh token và forward cookies
 * @client-only - Chỉ sử dụng được ở client side
 */
async function fetchClient<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    body,
    skipAuth = false,
    headers: customHeaders,
    ...restOptions
  } = options;

  // Gọi qua proxy để proxy xử lý refresh token
  const url = toProxyUrl(endpoint);

  // Lấy locale từ cookie để gửi trong header
  const locale = getLocaleFromCookie();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(locale && { "Accept-Language": locale }),
    ...customHeaders,
  };

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers,
    credentials: skipAuth ? "omit" : "include",
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  // Parse response
  const text = await response.text();

  if (!text) {
    // Response rỗng - tạo error dựa trên HTTP status
    const errorMessages: Record<number, string> = {
      401: "Phiên đăng nhập hết hạn",
      403: "Không có quyền truy cập",
      404: "Không tìm thấy tài nguyên",
      500: "Lỗi server",
    };
    throw new ApiError(
      errorMessages[response.status] || `Lỗi HTTP ${response.status}`,
      response.status,
    );
  }

  let result: ApiResponse<T>;
  try {
    result = JSON.parse(text);
  } catch {
    throw new ApiError(
      `Lỗi parse JSON: ${text.substring(0, 100)}`,
      response.status,
    );
  }

  // Kiểm tra status từ response body (ưu tiên) hoặc HTTP status
  const status = result.status || response.status;

  if (!result.success || status >= 400) {
    // Nếu 401, clear token và redirect về login
    // (Proxy đã thử refresh token rồi mà vẫn 401 nghĩa là session hết hạn hoàn toàn)
    if (status === 401) {
      handleUnauthorized();
      // Throw error để caller biết request failed
      throw new ApiError("Phiên đăng nhập hết hạn", 401, result.errorCode);
    }

    throw new ApiError(
      result.message || "Có lỗi xảy ra",
      status,
      result.errorCode,
    );
  }

  return result.data;
}

/**
 * Shorthand methods cho fetchClient
 * @client-only - Chỉ sử dụng được ở client side
 */
export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    fetchClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: FetchOptions,
  ) => fetchClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: FetchOptions,
  ) => fetchClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: FetchOptions,
  ) => fetchClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    fetchClient<T>(endpoint, { ...options, method: "DELETE" }),

  /**
   * Upload file với FormData
   * Gọi qua proxy để proxy xử lý refresh token
   * @client-only
   */
  upload: async <T = unknown>(
    endpoint: string,
    formData: FormData,
    options?: Omit<FetchOptions, "body">,
  ): Promise<T> => {
    const url = toProxyUrl(endpoint);
    const locale = getLocaleFromCookie();

    const headers: HeadersInit = {
      ...(locale && { "Accept-Language": locale }),
    };

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers,
      ...options,
    });

    // Parse response
    const text = await response.text();

    if (!text) {
      throw new ApiError(
        response.status === 401
          ? "Phiên đăng nhập hết hạn"
          : `Lỗi HTTP ${response.status}`,
        response.status,
      );
    }

    let result: ApiResponse<T>;
    try {
      result = JSON.parse(text);
    } catch {
      throw new ApiError(
        `Lỗi parse JSON: ${text.substring(0, 100)}`,
        response.status,
      );
    }

    const status = result.status || response.status;

    if (!result.success || status >= 400) {
      // Nếu 401, clear token và redirect về login
      if (status === 401) {
        handleUnauthorized();
        throw new ApiError("Phiên đăng nhập hết hạn", 401, result.errorCode);
      }

      throw new ApiError(
        result.message || "Có lỗi xảy ra",
        status,
        result.errorCode,
      );
    }

    return result.data;
  },
};
