import { apiClient } from "@/lib/utils/fetch-client";
import {
  ReferredCompany,
  CommissionSummary,
  ReferralFilterRequest,
} from "@/types/referral";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";

/**
 * Referral API functions cho Employee Tamabee
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Employee APIs - Dành cho EMPLOYEE_TAMABEE
// ============================================

/**
 * Lấy danh sách companies đã giới thiệu
 * @client-only
 */
export async function getReferredCompanies(
  filter?: ReferralFilterRequest,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<ReferredCompany>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filter?.search) {
    params.append("search", filter.search);
  }
  if (filter?.status) {
    params.append("status", filter.status);
  }
  if (filter?.commissionStatus) {
    params.append("commissionStatus", filter.commissionStatus);
  }

  return apiClient.get<PaginatedResponse<ReferredCompany>>(
    `/api/employee/referrals?${params.toString()}`,
  );
}

/**
 * Lấy thống kê commission của employee hiện tại
 * @client-only
 */
export async function getCommissionSummary(): Promise<CommissionSummary> {
  return apiClient.get<CommissionSummary>("/api/employee/commissions/summary");
}

// ============================================
// Referral API object - Export tất cả functions
// ============================================

export const referralApi = {
  getReferredCompanies,
  getCommissionSummary,
};
