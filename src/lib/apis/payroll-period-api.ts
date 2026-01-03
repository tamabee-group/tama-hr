import { apiClient } from "@/lib/utils/fetch-client";
import {
  PayrollPeriod,
  PayrollPeriodInput,
  PayrollItem,
  PayrollAdjustment,
  PayrollAdjustmentInput,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Payroll Period API functions
 * Quản lý kỳ lương với workflow: DRAFT -> REVIEWING -> APPROVED -> PAID
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

// ============================================
// Request/Response Types
// ============================================

export interface PayrollPeriodFilters {
  year?: number;
  month?: number;
  status?: string;
}

export interface PayrollItemFilters {
  employeeId?: number;
  status?: string;
}

export interface PayrollPeriodSummary {
  totalEmployees: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalBaseSalary: number;
  totalOvertimePay: number;
  totalAllowances: number;
  totalDeductions: number;
  totalBreakDeductions: number;
  totalAdjustments: number;
}

export interface WorkflowActionResponse {
  success: boolean;
  message: string;
  period: PayrollPeriod;
}

// ============================================
// Payroll Period APIs
// ============================================

/**
 * Lấy danh sách kỳ lương
 * @client-only
 */
export async function getPayrollPeriods(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: PayrollPeriodFilters,
): Promise<PaginatedResponse<PayrollPeriod>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.year) params.append("year", filters.year.toString());
  if (filters?.month) params.append("month", filters.month.toString());
  if (filters?.status) params.append("status", filters.status);

  return apiClient.get<PaginatedResponse<PayrollPeriod>>(
    `/api/company/payroll-periods?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết kỳ lương theo ID
 * @client-only
 */
export async function getPayrollPeriodById(id: number): Promise<PayrollPeriod> {
  return apiClient.get<PayrollPeriod>(`/api/company/payroll-periods/${id}`);
}

/**
 * Lấy kỳ lương theo năm/tháng
 * @client-only
 */
export async function getPayrollPeriodByYearMonth(
  year: number,
  month: number,
): Promise<PayrollPeriod | null> {
  return apiClient.get<PayrollPeriod | null>(
    `/api/company/payroll-periods/by-month?year=${year}&month=${month}`,
  );
}

/**
 * Tạo kỳ lương mới
 * @client-only
 */
export async function createPayrollPeriod(
  data: PayrollPeriodInput,
): Promise<PayrollPeriod> {
  return apiClient.post<PayrollPeriod>("/api/company/payroll-periods", data);
}

/**
 * Xóa kỳ lương (chỉ xóa được khi status = DRAFT)
 * @client-only
 */
export async function deletePayrollPeriod(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/payroll-periods/${id}`);
}

/**
 * Lấy tổng hợp kỳ lương
 * @client-only
 */
export async function getPayrollPeriodSummary(
  periodId: number,
): Promise<PayrollPeriodSummary> {
  return apiClient.get<PayrollPeriodSummary>(
    `/api/company/payroll-periods/${periodId}/summary`,
  );
}

// ============================================
// Payroll Period Workflow APIs
// ============================================

/**
 * Tính toán lại bảng lương cho kỳ (recalculate)
 * @client-only
 */
export async function recalculatePayroll(
  periodId: number,
): Promise<WorkflowActionResponse> {
  return apiClient.post<WorkflowActionResponse>(
    `/api/company/payroll-periods/${periodId}/recalculate`,
    {},
  );
}

/**
 * Gửi kỳ lương để review (DRAFT -> REVIEWING)
 * @client-only
 */
export async function submitForReview(
  periodId: number,
): Promise<WorkflowActionResponse> {
  return apiClient.post<WorkflowActionResponse>(
    `/api/company/payroll-periods/${periodId}/submit`,
    {},
  );
}

/**
 * Duyệt kỳ lương (REVIEWING -> APPROVED)
 * @client-only
 */
export async function approvePayroll(
  periodId: number,
): Promise<WorkflowActionResponse> {
  return apiClient.post<WorkflowActionResponse>(
    `/api/company/payroll-periods/${periodId}/approve`,
    {},
  );
}

/**
 * Từ chối kỳ lương (REVIEWING -> DRAFT)
 * @client-only
 */
export async function rejectPayroll(
  periodId: number,
  reason: string,
): Promise<WorkflowActionResponse> {
  return apiClient.post<WorkflowActionResponse>(
    `/api/company/payroll-periods/${periodId}/reject`,
    { reason },
  );
}

/**
 * Đánh dấu đã thanh toán (APPROVED -> PAID)
 * @client-only
 */
export async function markAsPaid(
  periodId: number,
  paymentReference?: string,
): Promise<WorkflowActionResponse> {
  return apiClient.post<WorkflowActionResponse>(
    `/api/company/payroll-periods/${periodId}/pay`,
    { paymentReference },
  );
}

// ============================================
// Payroll Item APIs
// ============================================

/**
 * Lấy danh sách payroll items của kỳ lương
 * @client-only
 */
export async function getPayrollItems(
  periodId: number,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: PayrollItemFilters,
): Promise<PaginatedResponse<PayrollItem>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.status) params.append("status", filters.status);

  return apiClient.get<PaginatedResponse<PayrollItem>>(
    `/api/company/payroll-periods/${periodId}/items?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết payroll item theo ID
 * @client-only
 */
export async function getPayrollItemById(
  periodId: number,
  itemId: number,
): Promise<PayrollItem> {
  return apiClient.get<PayrollItem>(
    `/api/company/payroll-periods/${periodId}/items/${itemId}`,
  );
}

/**
 * Điều chỉnh payroll item
 * @client-only
 */
export async function adjustPayrollItem(
  periodId: number,
  itemId: number,
  data: PayrollAdjustmentInput,
): Promise<PayrollItem> {
  return apiClient.post<PayrollItem>(
    `/api/company/payroll-periods/${periodId}/items/${itemId}/adjust`,
    data,
  );
}

/**
 * Lấy lịch sử điều chỉnh của payroll item
 * @client-only
 */
export async function getPayrollItemAdjustments(
  periodId: number,
  itemId: number,
): Promise<PayrollAdjustment[]> {
  return apiClient.get<PayrollAdjustment[]>(
    `/api/company/payroll-periods/${periodId}/items/${itemId}/adjustments`,
  );
}

// ============================================
// Export APIs
// ============================================

/**
 * Xuất bảng lương ra CSV
 * @client-only
 */
export async function exportPayrollCsv(periodId: number): Promise<Blob> {
  const response = await fetch(
    `/api/company/payroll-periods/${periodId}/export/csv`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to export CSV");
  }

  return response.blob();
}

/**
 * Xuất bảng lương ra PDF
 * @client-only
 */
export async function exportPayrollPdf(periodId: number): Promise<Blob> {
  const response = await fetch(
    `/api/company/payroll-periods/${periodId}/export/pdf`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to export PDF");
  }

  return response.blob();
}

// ============================================
// Export API object
// ============================================

export const payrollPeriodApi = {
  // Payroll Periods
  getPayrollPeriods,
  getPayrollPeriodById,
  getPayrollPeriodByYearMonth,
  createPayrollPeriod,
  deletePayrollPeriod,
  getPayrollPeriodSummary,
  // Workflow
  recalculatePayroll,
  submitForReview,
  approvePayroll,
  rejectPayroll,
  markAsPaid,
  // Payroll Items
  getPayrollItems,
  getPayrollItemById,
  adjustPayrollItem,
  getPayrollItemAdjustments,
  // Export
  exportPayrollCsv,
  exportPayrollPdf,
};
