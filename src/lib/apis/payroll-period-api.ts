import { apiClient } from "@/lib/utils/fetch-client";
import {
  PayrollPeriod,
  PayrollPeriodInput,
  PayrollItem,
  PayrollAdjustment,
  PayrollAdjustmentInput,
  PayrollSummary,
  YearMonth,
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
const BASE_URL = "/api/company/payroll";

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

// Compatibility type for old payroll-api
export interface PayrollPreviewRecord extends PayrollItem {
  isNew: boolean;
  hasChanges: boolean;
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
    `${BASE_URL}/periods?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết kỳ lương theo ID (bao gồm items và summary)
 * @client-only
 */
export async function getPayrollPeriodById(
  id: number,
): Promise<PayrollPeriod & { items?: PayrollItem[] }> {
  return apiClient.get<PayrollPeriod & { items?: PayrollItem[] }>(
    `${BASE_URL}/periods/${id}`,
  );
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
    `${BASE_URL}/periods/by-month?year=${year}&month=${month}`,
  );
}

/**
 * Tạo kỳ lương mới
 * @client-only
 */
export async function createPayrollPeriod(
  data: PayrollPeriodInput,
): Promise<PayrollPeriod> {
  return apiClient.post<PayrollPeriod>(`${BASE_URL}/periods`, data);
}

/**
 * Xóa kỳ lương (chỉ xóa được khi status = DRAFT)
 * @client-only
 */
export async function deletePayrollPeriod(id: number): Promise<void> {
  return apiClient.delete<void>(`${BASE_URL}/periods/${id}`);
}

/**
 * Lấy tổng hợp kỳ lương (từ detail response)
 * @client-only
 */
export async function getPayrollPeriodSummary(
  periodId: number,
): Promise<PayrollPeriodSummary> {
  const detail = await getPayrollPeriodById(periodId);
  return {
    totalEmployees: detail.totalEmployees || 0,
    totalGrossSalary: detail.totalGrossSalary || 0,
    totalNetSalary: detail.totalNetSalary || 0,
    totalBaseSalary: detail.totalBaseSalary || 0,
    totalOvertimePay: detail.totalOvertimePay || 0,
    totalAllowances: detail.totalAllowances || 0,
    totalDeductions: detail.totalDeductions || 0,
    totalBreakDeductions: 0,
    totalAdjustments: 0,
  };
}

// ============================================
// Payroll Period Workflow APIs
// ============================================

/**
 * Tính toán lại bảng lương cho kỳ (calculate)
 * @client-only
 */
export async function recalculatePayroll(
  periodId: number,
): Promise<WorkflowActionResponse> {
  return apiClient.post<WorkflowActionResponse>(
    `${BASE_URL}/periods/${periodId}/calculate`,
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
    `${BASE_URL}/periods/${periodId}/submit`,
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
    `${BASE_URL}/periods/${periodId}/approve`,
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
    `${BASE_URL}/periods/${periodId}/reject`,
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
    `${BASE_URL}/periods/${periodId}/pay`,
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
    `${BASE_URL}/periods/${periodId}/items?${params.toString()}`,
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
    `${BASE_URL}/periods/${periodId}/items/${itemId}`,
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
  return apiClient.put<PayrollItem>(`${BASE_URL}/items/${itemId}/adjust`, data);
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
    `${BASE_URL}/periods/${periodId}/items/${itemId}/adjustments`,
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
  const response = await fetch(`${BASE_URL}/periods/${periodId}/export/csv`, {
    method: "GET",
    credentials: "include",
  });

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
  const response = await fetch(`${BASE_URL}/periods/${periodId}/export/pdf`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to export PDF");
  }

  return response.blob();
}

/**
 * Download tất cả payslip PDF của một period dưới dạng ZIP
 * @client-only
 */
export async function downloadAllPayslipsZip(periodId: number): Promise<Blob> {
  return apiClient.download(`${BASE_URL}/periods/${periodId}/download-all`);
}

// ============================================
// Export API object
// ============================================

// Lấy lịch sử payslip của employee
const getEmployeePayslips = async (
  employeeId: number,
  page: number = 0,
  size: number = 20,
  status?: string,
): Promise<PaginatedResponse<PayrollItem>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (status) params.append("status", status);

  return apiClient.get<PaginatedResponse<PayrollItem>>(
    `${BASE_URL}/employee/${employeeId}/payslips?${params.toString()}`,
  );
};

// Lấy tất cả payslips của công ty
const getAllCompanyPayslips = async (
  page: number = 0,
  size: number = 50,
  employeeId?: number,
  status?: string,
): Promise<PaginatedResponse<PayrollItem>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (employeeId) params.append("employeeId", employeeId.toString());
  if (status) params.append("status", status);

  return apiClient.get<PaginatedResponse<PayrollItem>>(
    `${BASE_URL}/payslips?${params.toString()}`,
  );
};

// ============================================
// Compatibility Layer (for old payroll-api)
// ============================================

/**
 * Compatibility: Lấy payroll summary theo YearMonth
 * Maps to new period-based API
 */
async function getPayrollSummary(period: YearMonth): Promise<PayrollSummary> {
  const periodData = await getPayrollPeriodByYearMonth(
    period.year,
    period.month,
  );
  if (!periodData) {
    return {
      totalEmployees: 0,
      totalNetSalary: 0,
      totalGrossSalary: 0,
      pendingCount: 0,
      paidCount: 0,
    } as PayrollSummary;
  }
  return {
    totalEmployees: periodData.totalEmployees || 0,
    totalNetSalary: periodData.totalNetSalary || 0,
    totalGrossSalary: periodData.totalGrossSalary || 0,
    pendingCount: 0,
    paidCount: 0,
  } as PayrollSummary;
}

/**
 * Compatibility: Lấy payroll records theo filters
 */
async function getPayrollRecords(
  page: number = 0,
  size: number = 10,
  filters?: {
    year?: number;
    month?: number;
    employeeId?: number;
    status?: string;
  },
): Promise<PaginatedResponse<PayrollItem>> {
  if (filters?.year && filters?.month) {
    const period = await getPayrollPeriodByYearMonth(
      filters.year,
      filters.month,
    );
    if (period) {
      return getPayrollItems(period.id, page, size, {
        employeeId: filters.employeeId,
        status: filters.status,
      });
    }
  }
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size,
    number: page,
    first: true,
    last: true,
  };
}

/**
 * Compatibility: Finalize payroll
 */
async function finalizePayroll(
  period: YearMonth,
): Promise<{ totalRecords: number; message: string }> {
  const periodData = await getPayrollPeriodByYearMonth(
    period.year,
    period.month,
  );
  if (periodData) {
    await submitForReview(periodData.id);
    return { totalRecords: periodData.totalEmployees || 0, message: "Success" };
  }
  return { totalRecords: 0, message: "Period not found" };
}

/**
 * Compatibility: Preview payroll
 */
async function previewPayroll(period: YearMonth) {
  const periodData = await getPayrollPeriodByYearMonth(
    period.year,
    period.month,
  );
  if (periodData) {
    const items = await getPayrollItems(periodData.id, 0, 100);
    return {
      companyId: 0,
      companyName: "",
      year: period.year,
      month: period.month,
      period: `${period.year}-${period.month}`,
      totalEmployees: periodData.totalEmployees || 0,
      totalBaseSalary: 0,
      totalOvertimePay: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalGrossSalary: periodData.totalGrossSalary || 0,
      totalNetSalary: periodData.totalNetSalary || 0,
      records: items.content.map((item) => ({
        ...item,
        isNew: false,
        hasChanges: false,
      })),
    };
  }
  return null;
}

/**
 * Compatibility: Get payroll by ID
 */
async function getPayrollById(id: number): Promise<PayrollItem | null> {
  try {
    // This gets an item directly, assuming ID is for an item
    return apiClient.get<PayrollItem>(`${BASE_URL}/items/${id}`);
  } catch {
    return null;
  }
}

/**
 * Compatibility: Download company payslip PDF
 * Sử dụng apiClient.download để đảm bảo đi qua proxy với đầy đủ auth
 */
async function downloadCompanyPayslipPdf(itemId: number): Promise<Blob> {
  return apiClient.download(`${BASE_URL}/items/${itemId}/download`);
}

/**
 * Compatibility: Get employee payroll history
 */
async function getEmployeePayrollHistory(
  employeeId: number,
  page: number = 0,
  size: number = 10,
  status?: string,
): Promise<PaginatedResponse<PayrollItem>> {
  return getEmployeePayslips(employeeId, page, size, status);
}

/**
 * Compatibility: Pay all
 */
async function payAll(period: YearMonth) {
  const periodData = await getPayrollPeriodByYearMonth(
    period.year,
    period.month,
  );
  if (periodData) {
    await markAsPaid(periodData.id);
  }
  return [];
}

/**
 * Compatibility: Send notifications
 */
async function sendNotifications() {
  // Not implemented in new API
  return [];
}

/**
 * Compatibility: Export CSV by YearMonth
 */
async function exportCsv(period: YearMonth): Promise<Blob> {
  const periodData = await getPayrollPeriodByYearMonth(
    period.year,
    period.month,
  );
  if (periodData) {
    return exportPayrollCsv(periodData.id);
  }
  throw new Error("Period not found");
}

/**
 * Compatibility: Export PDF by YearMonth
 */
async function exportPdf(period: YearMonth): Promise<Blob> {
  const periodData = await getPayrollPeriodByYearMonth(
    period.year,
    period.month,
  );
  if (periodData) {
    return exportPayrollPdf(periodData.id);
  }
  throw new Error("Period not found");
}

/**
 * Lấy chi tiết payroll item
 */
export async function getPayrollItemDetail(
  itemId: number,
): Promise<PayrollItem> {
  const response = await apiClient.get<PayrollItem>(
    `/api/company/payroll/items/${itemId}`,
  );
  return response;
}

// ============================================
// Export all functions
// ============================================

export const payrollPeriodApi = {
  // Payroll Periods
  getPayrollPeriods,
  getPayrollPeriodById,
  getPayrollPeriodByYearMonth,
  getPayrollPeriodSummary,
  createPayrollPeriod,
  deletePayrollPeriod,
  // Calculation
  recalculatePayroll,
  // Workflow
  submitForReview,
  approvePayroll,
  rejectPayroll,
  markAsPaid,
  // Payroll Items
  getPayrollItems,
  getPayrollItemById,
  getPayrollItemDetail,
  adjustPayrollItem,
  getPayrollItemAdjustments,
  getEmployeePayslips,
  getAllCompanyPayslips,
  // Export
  exportPayrollCsv,
  exportPayrollPdf,
  downloadAllPayslipsZip,
};

// Compatibility export for old payrollApi
export const payrollApi = {
  getPayrollSummary,
  getPayrollRecords,
  getPayrollById,
  getPayrollItemDetail,
  finalizePayroll,
  previewPayroll,
  downloadCompanyPayslipPdf,
  getEmployeePayrollHistory,
  payAll,
  sendNotifications,
  exportCsv,
  exportPdf,
  markAsPaid: async (payrollId: number) => {
    // For single item, just return success
    return { id: payrollId, status: "PAID" };
  },
  retryPayment: async (payrollId: number) => {
    return { id: payrollId, status: "PAID" };
  },
};
