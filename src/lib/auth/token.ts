import { API_URL } from "@/lib/constants";
import { getHasSession } from "./storage";

/**
 * Kiểm tra cookie có tồn tại không
 * @client-only - Chỉ sử dụng được ở client side
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * Kiểm tra có accessToken trong cookie không
 * @client-only - Chỉ sử dụng được ở client side
 */
export function hasAccessToken(): boolean {
  return getCookie("accessToken") !== null;
}

/**
 * Kiểm tra có refreshToken trong cookie không
 * Vì refreshToken là httpOnly nên dùng session flag từ localStorage
 * @client-only - Chỉ sử dụng được ở client side
 */
export function hasRefreshToken(): boolean {
  return getHasSession();
}

/**
 * Gọi API refresh token với cookie string (dùng cho middleware)
 * @server-only - Chỉ sử dụng được ở server side (middleware)
 */
export async function refreshAccessTokenWithCookie(
  refreshToken: string,
  locale?: string,
): Promise<{ success: boolean; cookies?: string[] }> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Cookie: `refreshToken=${refreshToken}`,
    };

    if (locale) {
      headers["Accept-Language"] = locale;
    }

    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers,
    });

    if (response.ok) {
      const setCookies = response.headers.getSetCookie();
      return { success: true, cookies: setCookies };
    }

    return { success: false };
  } catch {
    return { success: false };
  }
}
