import { apiClient } from "@/lib/utils/fetch-client";
import {
  ReferredCompany,
  CommissionSummary,
  CommissionSettings,
} from "@/types/employee-detail";
import { PaginatedResponse } from "@/types/api";

/**
 * Lấy danh sách công ty đã giới thiệu của employee (dành cho admin/manager)
 * @client-only
 */
export async function getEmployeeReferrals(
  employeeId: number,
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<ReferredCompany>> {
  return apiClient.get<PaginatedResponse<ReferredCompany>>(
    `/api/admin/employees/${employeeId}/referrals?page=${page}&size=${size}`,
  );
}

/**
 * Lấy thống kê hoa hồng của employee (dành cho admin/manager)
 * @client-only
 */
export async function getEmployeeCommissionSummary(
  employeeId: number,
): Promise<CommissionSummary> {
  return apiClient.get<CommissionSummary>(
    `/api/admin/employees/${employeeId}/commission-summary`,
  );
}

/**
 * Lấy cấu hình hoa hồng từ Tamabee settings
 * @client-only
 */
export async function getCommissionSettings(): Promise<CommissionSettings> {
  return apiClient.get<CommissionSettings>(`/api/admin/commission-settings`);
}
