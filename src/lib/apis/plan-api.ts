import { apiClient } from "@/lib/utils/fetch-client";
import {
  PlanResponse,
  PlanCreateRequest,
  PlanUpdateRequest,
} from "@/types/plan";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";

/**
 * Plan API functions
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Public APIs - Không cần authentication
// ============================================

/**
 * Lấy danh sách plans đang active (cho landing page)
 * @client-only
 */
export async function getActivePlans(): Promise<PlanResponse[]> {
  return apiClient.get<PlanResponse[]>("/api/plans/active");
}

// ============================================
// Admin APIs - Dành cho ADMIN_TAMABEE
// ============================================

/**
 * Lấy danh sách tất cả plans (bao gồm inactive)
 * @client-only
 */
export async function getAll(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<PlanResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  return apiClient.get<PaginatedResponse<PlanResponse>>(
    `/api/admin/plans?${params.toString()}`,
  );
}

/**
 * Lấy thông tin chi tiết một plan
 * @client-only
 */
export async function getById(id: number): Promise<PlanResponse> {
  return apiClient.get<PlanResponse>(`/api/admin/plans/${id}`);
}

/**
 * Tạo plan mới
 * @client-only
 */
export async function create(data: PlanCreateRequest): Promise<PlanResponse> {
  return apiClient.post<PlanResponse>("/api/admin/plans", data);
}

/**
 * Cập nhật plan
 * @client-only
 */
export async function update(
  id: number,
  data: PlanUpdateRequest,
): Promise<PlanResponse> {
  return apiClient.put<PlanResponse>(`/api/admin/plans/${id}`, data);
}

/**
 * Xóa plan
 * @client-only
 */
export async function deletePlan(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/admin/plans/${id}`);
}

// ============================================
// Company APIs - Dành cho tenant users
// ============================================

/**
 * Lấy danh sách features của plan hiện tại
 * @client-only
 */
export async function getPlanFeatures(
  planId: number,
): Promise<{
  planId: number;
  planName: string;
  features: { code: string; enabled: boolean }[];
}> {
  return apiClient.get(`/api/plans/${planId}/features`);
}

// ============================================
// Plan API object - Export tất cả functions
// ============================================

export const planApi = {
  // Public APIs
  getActivePlans,

  // Admin APIs
  getAll,
  getById,
  create,
  update,
  delete: deletePlan,

  // Company APIs
  getPlanFeatures,
};
