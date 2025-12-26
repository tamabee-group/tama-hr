"use client";

import { API_URL } from "@/lib/constants";
import { refreshAccessToken } from "@/lib/auth/token";
import { getLocaleFromCookie } from "./locale";

/**
 * Fetch client cho môi trường client side
 * @client-only - Chỉ sử dụng được ở client side
 *
 * Tính năng:
 * - Tự động gửi cookies (credentials: include)
 * - Tự động refresh token khi accessToken hết hạn (401)
 * - Tự động gửi Accept-Language header từ NEXT_LOCALE cookie
 * - Tự động parse JSON response
 * - Xử lý lỗi thống nhất
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
 * Fetch client với tự động refresh token (dùng nội bộ)
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

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

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

  let response = await fetch(url, fetchOptions);

  // Nếu 401 và không phải skipAuth, thử refresh token
  if (response.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request sau khi refresh thành công
      response = await fetch(url, fetchOptions);
    }
  }

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
};
