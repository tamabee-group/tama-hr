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
 * Xóa auth cookies từ client side
 * Xóa cả có domain và không domain để đảm bảo xóa sạch
 * refreshToken là httpOnly nên chỉ backend mới xóa được (qua API logout)
 * @client-only
 */
function clearAuthCookies(): void {
  if (typeof document === "undefined") return;
  const hostname = window.location.hostname;
  // Xóa không chỉ định domain
  document.cookie =
    "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  // Xóa với domain hiện tại
  document.cookie = `accessToken=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  // Xóa với domain cha (ví dụ: .tamabee.local)
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const parentDomain = parts.slice(-2).join(".");
    document.cookie = `accessToken=; path=/; domain=.${parentDomain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

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
 * Gọi API logout - dùng fetch trực tiếp thay vì authFetch
 * để browser có thể apply Set-Cookie headers (xóa refreshToken httpOnly)
 * @client-only
 */
async function logoutApi(): Promise<void> {
  try {
    const locale = getLocaleFromCookie();
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(locale && { "Accept-Language": locale }),
      },
    });
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

  // Tất cả thất bại → xóa sạch session (localStorage + cookies)
  removeCurrentUser();
  setHasSession(false);
  clearAuthCookies();
  return { user: null, status: "unauthenticated" };
}

/**
 * Đăng xuất: gọi API logout để xóa refreshToken (httpOnly),
 * xóa localStorage và accessToken cookie
 * Dùng try/finally để đảm bảo cleanup luôn chạy dù API fail
 * @client-only
 */
export async function logout(): Promise<void> {
  try {
    // Gọi API logout để backend xóa refreshToken cookie (httpOnly)
    await logoutApi();
  } finally {
    // Luôn xóa client-side data dù API thành công hay thất bại
    removeCurrentUser();
    setHasSession(false);
    clearAuthCookies();
  }
}
