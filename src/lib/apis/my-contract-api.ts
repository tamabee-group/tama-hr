import { apiClient } from "@/lib/utils/fetch-client";
import { PortalContractResponse } from "@/types/employee-portal";

/**
 * My Contract API functions
 * API cho nhân viên xem hợp đồng lao động cá nhân
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Constants
// ============================================

const BASE_URL = "/api/users/me/contracts";

// ============================================
// API Functions
// ============================================

/**
 * Lấy hợp đồng hiện tại của nhân viên đang đăng nhập
 * Trả về null nếu không có hợp đồng đang hoạt động
 * @client-only
 */
export async function getMyCurrentContract(): Promise<PortalContractResponse | null> {
  try {
    return await apiClient.get<PortalContractResponse>(`${BASE_URL}/current`);
  } catch {
    // Trả về null nếu không có hợp đồng hiện tại
    return null;
  }
}

/**
 * Lấy lịch sử hợp đồng của nhân viên đang đăng nhập
 * Danh sách được sắp xếp theo ngày bắt đầu (mới nhất trước)
 * @client-only
 */
export async function getMyContractHistory(): Promise<
  PortalContractResponse[]
> {
  return apiClient.get<PortalContractResponse[]>(`${BASE_URL}/history`);
}

// ============================================
// Export API object
// ============================================

export const myContractApi = {
  getMyCurrentContract,
  getMyContractHistory,
};
