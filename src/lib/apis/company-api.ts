import { apiClient } from "@/lib/utils/fetch-client";
import { Company } from "@/types/company";

/**
 * Lấy thông tin company của user đang đăng nhập
 * @client-only
 */
export async function getMyCompany(): Promise<Company> {
  return apiClient.get<Company>("/api/company/profile");
}
