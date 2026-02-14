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
 * Clear tất cả auth cookies và localStorage, redirect về login
 * Được gọi khi API trả về 401 (sau khi proxy đã thử refresh token)
 * hoặc 502 (backend không khả dụng)
 */
function handleUnauthorized(): void {
  // Clear cookies - xóa với nhiều domain variants để đảm bảo
  document.cookie =
    "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const hostname = window.location.hostname;
  document.cookie = `accessToken=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const parentDomain = parts.slice(-2).join(".");
    document.cookie = `accessToken=; path=/; domain=.${parentDomain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  // Clear localStorage
  localStorage.removeItem("currentUser");
  localStorage.removeItem("hasSession");

  // Lấy locale hiện tại từ URL hoặc cookie
  const locale = getLocaleFromCookie() || "en";
  const currentPath = window.location.pathname;

  // Không redirect nếu đang ở guest-only routes (login, register, forgot-password)
  const guestOnlyRoutes = ["/login", "/register", "/forgot-password"];
  const isGuestRoute = guestOnlyRoutes.some((route) =>
    currentPath.includes(route),
  );
  if (isGuestRoute) {
    return;
  }

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
      502: "API không khả dụng",
      503: "API đang bảo trì",
    };
    throw new ApiError(
      errorMessages[response.status] || `Lỗi HTTP ${response.status}`,
      response.status,
    );
  }

  // Kiểm tra response có phải HTML không (502/503 từ nginx trả HTML)
  const trimmed = text.trimStart();
  if (trimmed.startsWith("<") || trimmed.startsWith("<!")) {
    throw new ApiError(
      response.status === 503 ? "API đang bảo trì" : "API không khả dụng",
      response.status || 502,
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
    options?: Omit<FetchOptions, "body"> & { method?: string },
  ): Promise<T> => {
    const url = toProxyUrl(endpoint);
    const locale = getLocaleFromCookie();

    const headers: HeadersInit = {
      ...(locale && { "Accept-Language": locale }),
    };

    const response = await fetch(url, {
      method: options?.method || "POST",
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

  /**
   * Download file (trả về Blob thay vì JSON)
   * Gọi qua proxy để proxy xử lý refresh token
   * @client-only
   */
  download: async (
    endpoint: string,
    options?: Omit<FetchOptions, "body">,
  ): Promise<Blob> => {
    const url = toProxyUrl(endpoint);
    const locale = getLocaleFromCookie();

    const headers: HeadersInit = {
      ...(locale && { "Accept-Language": locale }),
    };

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers,
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
        throw new ApiError("Phiên đăng nhập hết hạn", 401);
      }
      throw new ApiError(`Lỗi download: ${response.status}`, response.status);
    }

    return response.blob();
  },
};
