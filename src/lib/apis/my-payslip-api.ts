import { apiClient } from "@/lib/utils/fetch-client";
import { PayrollItem } from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";
import { PayslipFilters } from "@/types/employee-portal";

/**
 * My Payslip API functions
 * API cho nhân viên xem phiếu lương cá nhân
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;
const BASE_URL = "/api/users/me/payslips";

// ============================================
// API Functions
// ============================================

/**
 * Lấy danh sách phiếu lương của nhân viên đang đăng nhập
 * Hỗ trợ phân trang và lọc theo năm, status
 * @client-only
 */
export async function getMyPayslips(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_SIZE,
  filters?: PayslipFilters,
): Promise<PaginatedResponse<PayrollItem>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.year) {
    params.append("year", filters.year.toString());
  }
  if (filters?.status) {
    params.append("status", filters.status);
  }

  return apiClient.get<PaginatedResponse<PayrollItem>>(
    `${BASE_URL}?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết phiếu lương theo ID
 * @client-only
 */
export async function getPayslipDetail(itemId: number): Promise<PayrollItem> {
  return apiClient.get<PayrollItem>(`${BASE_URL}/${itemId}`);
}

/**
 * Download phiếu lương dạng PDF
 * @client-only
 */
export async function downloadPayslipPdf(itemId: number): Promise<Blob> {
  return apiClient.download(`${BASE_URL}/${itemId}/pdf`);
}

// ============================================
// Export API object
// ============================================

export const myPayslipApi = {
  getMyPayslips,
  getPayslipDetail,
  downloadPayslipPdf,
};
