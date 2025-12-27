import { apiClient } from "@/lib/utils/fetch-client";
import { Company } from "@/types/company";

/**
 * Cập nhật thông tin công ty
 * @client-only
 */
export async function updateCompany(
  id: number,
  data: Partial<Company>,
): Promise<Company> {
  return apiClient.put<Company>(`/api/admin/companies/${id}`, data);
}

/**
 * Upload logo công ty
 * @client-only
 */
export async function uploadCompanyLogo(
  id: number,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("logo", file);
  return apiClient.upload<string>(`/api/admin/companies/${id}/logo`, formData);
}
