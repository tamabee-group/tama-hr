import { apiClient } from "@/lib/utils/fetch-client";

/**
 * Gửi link reset password đến email
 * Backend tự lấy tenant từ Host header
 * @client-only
 */
export async function sendResetLink(
  email: string,
  language?: string,
): Promise<void> {
  return apiClient.post("/api/auth/forgot-password", {
    email,
    language,
  });
}

/**
 * Đặt lại mật khẩu mới với token từ email
 * @client-only
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  return apiClient.post("/api/auth/reset-password", {
    token,
    newPassword,
  });
}
