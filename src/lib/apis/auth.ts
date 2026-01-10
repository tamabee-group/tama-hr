import { apiClient } from "@/lib/utils/fetch-client";
import { User } from "@/types/user";

/**
 * API gửi mã xác thực email
 * @client-only - Chỉ sử dụng được ở client side
 */
export async function sendVerificationCode(
  email: string,
  companyName: string,
  language?: string,
) {
  return apiClient.post("/api/auth/send-verification", {
    email,
    companyName,
    language,
  });
}

/**
 * API xác thực email với mã code
 * @client-only - Chỉ sử dụng được ở client side
 */
export async function verifyEmail(email: string, code: string) {
  return apiClient.post("/api/auth/verify-email", { email, code });
}

/**
 * API đăng nhập
 * @client-only - Chỉ sử dụng được ở client side
 * @param identifier - Email hoặc mã nhân viên
 * @param password - Mật khẩu
 * @param tenantDomain - Tenant domain (optional, dùng cho development)
 */
export async function login(
  identifier: string,
  password: string,
  tenantDomain?: string,
) {
  const headers: Record<string, string> = {};

  // Gửi tenant domain trong header để backend biết query đúng database
  if (tenantDomain) {
    headers["X-Tenant-Domain"] = tenantDomain;
  }

  return apiClient.post<User>(
    "/api/auth/login",
    {
      email: identifier,
      password,
    },
    { headers },
  );
}

/**
 * API đăng ký tài khoản công ty
 * @client-only - Chỉ sử dụng được ở client side
 */
export async function register(data: {
  companyName: string;
  ownerName: string;
  phone: string;
  address: string;
  industry: string;
  locale: string;
  language: string;
  email: string;
  password: string;
  zipcode?: string;
  referralCode?: string;
  tenantDomain: string;
}) {
  return apiClient.post("/api/auth/register", data);
}

/**
 * API gửi mã quên mật khẩu
 * @client-only - Chỉ sử dụng được ở client side
 */
export async function forgotPassword(email: string) {
  return apiClient.post("/api/auth/forgot-password", { email });
}

/**
 * API đặt lại mật khẩu
 * @client-only - Chỉ sử dụng được ở client side
 */
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  return apiClient.post("/api/auth/reset-password", {
    email,
    code,
    newPassword,
  });
}

/**
 * API kiểm tra tenant domain có khả dụng không
 * @client-only - Chỉ sử dụng được ở client side
 */
export async function checkTenantDomainAvailability(
  domain: string,
): Promise<{ available: boolean }> {
  return apiClient.get<{ available: boolean }>(
    `/api/auth/check-domain?domain=${encodeURIComponent(domain)}`,
  );
}
