import { apiClient } from "@/lib/utils/fetch-client";
import { SettingResponse, SettingUpdateRequest } from "@/types/setting";

/**
 * Setting API functions
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Admin APIs - Dành cho ADMIN_TAMABEE, MANAGER_TAMABEE (view)
// ============================================

/**
 * Lấy danh sách tất cả settings
 * Backend trả về List<SettingResponse> (không phân trang)
 * @client-only
 */
export async function getAll(): Promise<SettingResponse[]> {
  return apiClient.get<SettingResponse[]>(`/api/admin/settings`);
}

/**
 * Cập nhật setting theo key (chỉ ADMIN_TAMABEE)
 * @client-only
 */
export async function update(
  key: string,
  data: SettingUpdateRequest,
): Promise<SettingResponse> {
  return apiClient.put<SettingResponse>(`/api/admin/settings/${key}`, data);
}

// ============================================
// Setting API object - Export tất cả functions
// ============================================

export const settingApi = {
  getAll,
  update,
};
