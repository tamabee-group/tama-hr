import { apiClient } from "@/lib/utils/fetch-client";

/**
 * Gửi mã reset password đến email
 * @client-only
 */
export async function sendResetCode(email: string): Promise<void> {
  return apiClient.post("/api/auth/forgot-password", { email });
}

/**
 * Xác thực mã reset password
 * @client-only
 */
export async function verifyResetCode(
  email: string,
  code: string,
): Promise<void> {
  return apiClient.post("/api/auth/verify-reset-code", { email, code });
}

/**
 * Đặt lại mật khẩu mới
 * @client-only
 */
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  return apiClient.post("/api/auth/reset-password", {
    email,
    code,
    newPassword,
  });
}
