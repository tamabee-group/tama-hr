import { UserRole } from "@/types/user";

// JWT Payload structure từ backend
export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  companyId: number;
  tenantDomain: string; // "tamabee" | "acme" | "toyota" | ...
  planId: number;
  exp: number;
  iat: number;
}

/**
 * Decode JWT token để lấy payload
 * Chỉ decode, không verify signature (verification do backend xử lý)
 * @client-only
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Base64Url decode
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Lấy JWT token từ cookie
 * @client-only
 */
export function getAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split("; accessToken=");
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * Lấy tenant info từ JWT trong cookie
 * @client-only
 */
export function getTenantInfoFromJwt(): {
  tenantDomain: string | null;
  planId: number | null;
} {
  const token = getAccessTokenFromCookie();
  if (!token) return { tenantDomain: null, planId: null };

  const payload = decodeJwt(token);
  if (!payload) return { tenantDomain: null, planId: null };

  return {
    tenantDomain: payload.tenantDomain,
    planId: payload.planId,
  };
}
