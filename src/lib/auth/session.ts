import { User } from "@/types/user";
import { API_URL } from "@/lib/constants";
import {
  getCurrentUser,
  removeCurrentUser,
  saveCurrentUser,
  setHasSession,
} from "./storage";
import { refreshAccessToken, hasAccessToken, hasRefreshToken } from "./token";
import { getLocaleFromCookie } from "@/lib/utils/locale";

/**
 * Fetch cơ bản cho auth (không có auto-refresh để tránh circular dependency)
 * @client-only - Chỉ sử dụng được ở client side
 */
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const locale = getLocaleFromCookie();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(locale && { "Accept-Language": locale }),
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Có lỗi xảy ra");
  }

  return result.data as T;
}

/**
 * Gọi API /me để lấy thông tin user hiện tại
 * @client-only - Chỉ sử dụng được ở client side
 */
export async function fetchCurrentUser(): Promise<User> {
  return authFetch<User>("/api/auth/me", { method: "GET" });
}

/**
 * Gọi API logout
 * @client-only - Chỉ sử dụng được ở client side
 */
export async function logoutApi(): Promise<void> {
  try {
    await authFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Bỏ qua lỗi khi logout
  }
}

export type SessionStatus = "authenticated" | "unauthenticated" | "loading";

export interface SessionResult {
  user: User | null;
  status: SessionStatus;
}

/**
 * Kiểm tra và khôi phục phiên đăng nhập
 * @client-only - Chỉ sử dụng được ở client side (do sử dụng localStorage và cookie)
 *
 * Logic:
 * 1. Không có cả accessToken và refreshToken -> unauthenticated (không gọi API)
 * 2. Có accessToken -> gọi API /me để kiểm tra
 * 3. Không có accessToken nhưng có refreshToken -> refresh token trước
 * 4. Nếu cả 2 token đều hết hạn -> xóa currentUser, trả về unauthenticated
 */
export async function validateSession(): Promise<SessionResult> {
  const cachedUser = getCurrentUser();
  const hasAccess = hasAccessToken();
  const hasRefresh = hasRefreshToken();

  // Không có token nào -> không cần gọi API
  if (!hasAccess && !hasRefresh) {
    removeCurrentUser();
    return { user: null, status: "unauthenticated" };
  }

  // Có accessToken -> thử gọi API /me
  if (hasAccess) {
    try {
      const user = await fetchCurrentUser();
      saveCurrentUser(user);
      return { user, status: "authenticated" };
    } catch {
      // accessToken không hợp lệ hoặc hết hạn, thử refresh
    }
  }

  // Có refreshToken -> thử refresh
  if (hasRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Refresh thành công, dùng cached user nếu có
      if (cachedUser) {
        return { user: cachedUser, status: "authenticated" };
      }
      // Không có cached user, gọi API /me
      try {
        const user = await fetchCurrentUser();
        saveCurrentUser(user);
        return { user, status: "authenticated" };
      } catch {
        // Không lấy được user
      }
    }
  }

  // Cả 2 token đều không hợp lệ, xóa cached user và session flag
  removeCurrentUser();
  setHasSession(false);
  return { user: null, status: "unauthenticated" };
}

/**
 * Đăng xuất: xóa localStorage và gọi API logout
 * @client-only - Chỉ sử dụng được ở client side (do sử dụng localStorage)
 */
export async function logout(): Promise<void> {
  removeCurrentUser();
  setHasSession(false);
  await logoutApi();
}
