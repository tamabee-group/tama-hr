import { apiClient } from "@/lib/utils/fetch-client";
import {
  DepositRequestResponse,
  DepositRequestCreateRequest,
  DepositFilterRequest,
  RejectRequest,
} from "@/types/deposit";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";

/**
 * Deposit API functions
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Company APIs - Dành cho ADMIN_COMPANY
// ============================================

/**
 * Tạo yêu cầu nạp tiền mới
 * @client-only
 */
export async function create(
  data: DepositRequestCreateRequest,
): Promise<DepositRequestResponse> {
  return apiClient.post<DepositRequestResponse>("/api/company/deposits", data);
}

/**
 * Lấy danh sách yêu cầu nạp tiền của công ty hiện tại
 * @client-only
 */
export async function getMyRequests(
  filter?: DepositFilterRequest,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<DepositRequestResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filter?.status) {
    params.append("status", filter.status);
  }
  if (filter?.startDate) {
    params.append("startDate", filter.startDate);
  }
  if (filter?.endDate) {
    params.append("endDate", filter.endDate);
  }

  return apiClient.get<PaginatedResponse<DepositRequestResponse>>(
    `/api/company/deposits?${params.toString()}`,
  );
}

// ============================================
// Admin APIs - Dành cho ADMIN_TAMABEE, MANAGER_TAMABEE
// ============================================

/**
 * Lấy danh sách tất cả yêu cầu nạp tiền
 * @client-only
 */
export async function getAll(
  filter?: DepositFilterRequest,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<DepositRequestResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filter?.status) {
    params.append("status", filter.status);
  }
  if (filter?.companyId !== undefined) {
    params.append("companyId", filter.companyId.toString());
  }
  if (filter?.startDate) {
    params.append("startDate", filter.startDate);
  }
  if (filter?.endDate) {
    params.append("endDate", filter.endDate);
  }

  return apiClient.get<PaginatedResponse<DepositRequestResponse>>(
    `/api/admin/deposits?${params.toString()}`,
  );
}

/**
 * Duyệt yêu cầu nạp tiền
 * @client-only
 */
export async function approve(id: number): Promise<DepositRequestResponse> {
  return apiClient.post<DepositRequestResponse>(
    `/api/admin/deposits/${id}/approve`,
  );
}

/**
 * Từ chối yêu cầu nạp tiền
 * @client-only
 */
export async function reject(
  id: number,
  data: RejectRequest,
): Promise<DepositRequestResponse> {
  return apiClient.post<DepositRequestResponse>(
    `/api/admin/deposits/${id}/reject`,
    data,
  );
}

// ============================================
// Deposit API object - Export tất cả functions
// ============================================

export const depositApi = {
  // Company APIs
  create,
  getMyRequests,

  // Admin APIs
  getAll,
  approve,
  reject,
};
