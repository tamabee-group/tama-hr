import { User } from "@/types/user";
import {
  getCurrentUser,
  removeCurrentUser,
  saveCurrentUser,
  setHasSession,
  getHasSession,
} from "./storage";
import { hasAccessToken } from "./token";
import { getLocaleFromCookie } from "@/lib/utils/locale";

/**
 * Gọi API refresh token qua proxy
 * @client-only
 */
async function refreshTokenViaProxy(): Promise<boolean> {
  try {
    const locale = getLocaleFromCookie();
    const response = await fetch("/api/auth/refresh-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(locale && { "Accept-Language": locale }),
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch cơ bản cho auth - gọi qua Next.js proxy
 * @client-only
 */
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const locale = getLocaleFromCookie();

  const response = await fetch(endpoint, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(locale && { "Accept-Language": locale }),
      ...options.headers,
    },
  });

  const text = await response.text();

  if (!text) {
    throw new Error(
      response.status === 401
        ? "Phiên đăng nhập hết hạn"
        : "Response rỗng từ server",
    );
  }

  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error("Lỗi parse JSON");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Có lỗi xảy ra");
  }

  return result.data as T;
}

/**
 * Gọi API /me để lấy thông tin user hiện tại
 * @client-only
 */
export async function fetchCurrentUser(): Promise<User> {
  return authFetch<User>("/api/auth/me", { method: "GET" });
}

/**
 * Gọi API logout
 * @client-only
 */
async function logoutApi(): Promise<void> {
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
 * @client-only
 *
 * Flow xử lý:
 * 1. Có accessToken + cachedUser → dùng cache
 * 2. Có accessToken, không có cache → fetch /me
 * 3. Không có accessToken + có hasSession → refresh token rồi fetch /me
 * 4. Không có gì → thử fetch /me (middleware có thể đã refresh)
 */
export async function validateSession(): Promise<SessionResult> {
  const cachedUser = getCurrentUser();
  const hasAccess = hasAccessToken();
  const hasSession = getHasSession();

  // Case 1: Có token và cache → dùng cache
  if (hasAccess && cachedUser) {
    setHasSession(true);
    return { user: cachedUser, status: "authenticated" };
  }

  // Case 2: Có token, không có cache → fetch user
  if (hasAccess) {
    try {
      const user = await fetchCurrentUser();
      saveCurrentUser(user);
      setHasSession(true);
      return { user, status: "authenticated" };
    } catch {
      // Token không hợp lệ, tiếp tục xử lý
    }
  }

  // Case 3: Không có token nhưng có session → thử refresh
  if (!hasAccess && hasSession) {
    const refreshed = await refreshTokenViaProxy();
    if (refreshed) {
      try {
        const user = await fetchCurrentUser();
        saveCurrentUser(user);
        return { user, status: "authenticated" };
      } catch {
        // Refresh thành công nhưng fetch thất bại
      }
    }
  }

  // Case 4: Không có gì → thử fetch (middleware có thể đã refresh)
  if (!hasAccess && !hasSession && !cachedUser) {
    try {
      const user = await fetchCurrentUser();
      saveCurrentUser(user);
      setHasSession(true);
      return { user, status: "authenticated" };
    } catch {
      // Không có session
    }
  }

  // Tất cả thất bại → xóa session
  removeCurrentUser();
  setHasSession(false);
  return { user: null, status: "unauthenticated" };
}

/**
 * Đăng xuất: xóa localStorage và gọi API logout
 * @client-only
 */
export async function logout(): Promise<void> {
  removeCurrentUser();
  setHasSession(false);
  await logoutApi();
}
