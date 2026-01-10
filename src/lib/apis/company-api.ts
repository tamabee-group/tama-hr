import { apiClient } from "@/lib/utils/fetch-client";
import { Company, UpdateCompanyProfileRequest } from "@/types/company";

/**
 * Lấy thông tin company của user đang đăng nhập
 * @client-only
 */
export async function getMyCompany(): Promise<Company> {
  return apiClient.get<Company>("/api/company/profile");
}

/**
 * Cập nhật thông tin company
 * @client-only
 */
export async function updateMyCompany(
  data: UpdateCompanyProfileRequest,
): Promise<Company> {
  return apiClient.put<Company>("/api/company/profile", data);
}

/**
 * Upload logo công ty
 * @client-only
 */
export async function uploadMyCompanyLogo(file: File): Promise<Company> {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.upload<Company>("/api/company/profile/logo", formData, {
    method: "PUT",
  });
}
