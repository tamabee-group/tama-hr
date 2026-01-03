import { apiClient } from "@/lib/utils/fetch-client";
import {
  PayrollRecord,
  PayrollSummary,
  YearMonth,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Payroll API functions
 * Quản lý bảng lương
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

export interface PayrollFilters {
  year?: number;
  month?: number;
  employeeId?: number;
  status?: string;
  paymentStatus?: string;
}

export interface PayrollPreviewResponse {
  companyId: number;
  companyName: string;
  year: number;
  month: number;
  period: string;
  totalEmployees: number;
  totalBaseSalary: number;
  totalOvertimePay: number;
  totalAllowances: number;
  totalDeductions: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  records: PayrollPreviewRecord[];
}

export interface PayrollPreviewRecord extends PayrollRecord {
  isNew: boolean;
  hasChanges: boolean;
}

export interface FinalizePayrollResponse {
  totalRecords: number;
  message: string;
}

export interface PaymentResult {
  employeeId: number;
  employeeName: string;
  success: boolean;
  message?: string;
}

export interface NotificationResult {
  employeeId: number;
  employeeName: string;
  sent: boolean;
  message?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format YearMonth thành string YYYY-MM
 */
function formatPeriod(period: YearMonth): string {
  return `${period.year}-${String(period.month).padStart(2, "0")}`;
}

// ============================================
// Company Payroll APIs
// ============================================

/**
 * Lấy tổng hợp bảng lương theo kỳ
 * GET /api/company/payroll/{period}/summary
 * @client-only
 */
export async function getPayrollSummary(
  period: YearMonth,
): Promise<PayrollSummary> {
  const periodStr = formatPeriod(period);
  return apiClient.get<PayrollSummary>(
    `/api/company/payroll/${periodStr}/summary`,
  );
}

/**
 * Xem trước bảng lương (tính toán nhưng chưa lưu)
 * GET /api/company/payroll/preview?period=YYYY-MM
 * @client-only
 */
export async function previewPayroll(
  period: YearMonth,
): Promise<PayrollPreviewResponse> {
  const periodStr = formatPeriod(period);
  return apiClient.get<PayrollPreviewResponse>(
    `/api/company/payroll/preview?period=${periodStr}`,
  );
}

/**
 * Chốt bảng lương
 * POST /api/company/payroll/finalize?period=YYYY-MM
 * @client-only
 */
export async function finalizePayroll(
  period: YearMonth,
): Promise<FinalizePayrollResponse> {
  const periodStr = formatPeriod(period);
  return apiClient.post<FinalizePayrollResponse>(
    `/api/company/payroll/finalize?period=${periodStr}`,
    {},
  );
}

/**
 * Lấy danh sách bảng lương (có phân trang)
 * GET /api/company/payroll?period=YYYY-MM
 * @client-only
 */
export async function getPayrollRecords(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: PayrollFilters,
): Promise<PaginatedResponse<PayrollRecord>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  // Backend expects period in YYYY-MM format
  if (filters?.year && filters?.month) {
    const periodStr = `${filters.year}-${String(filters.month).padStart(2, "0")}`;
    params.append("period", periodStr);
  }
  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.status) params.append("status", filters.status);
  if (filters?.paymentStatus)
    params.append("paymentStatus", filters.paymentStatus);

  return apiClient.get<PaginatedResponse<PayrollRecord>>(
    `/api/company/payroll?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết bảng lương theo ID
 * GET /api/company/payroll/records/{id}
 * @client-only
 */
export async function getPayrollById(id: number): Promise<PayrollRecord> {
  return apiClient.get<PayrollRecord>(`/api/company/payroll/records/${id}`);
}

/**
 * Lấy bảng lương của nhân viên theo kỳ
 * @client-only
 */
export async function getEmployeePayroll(
  employeeId: number,
  period: YearMonth,
): Promise<PayrollRecord | null> {
  return apiClient.get<PayrollRecord | null>(
    `/api/company/employees/${employeeId}/payroll?year=${period.year}&month=${period.month}`,
  );
}

/**
 * Lấy lịch sử bảng lương của nhân viên (phân trang)
 * GET /api/company/employees/{id}/payroll
 * @client-only
 */
export async function getEmployeePayrollHistory(
  employeeId: number,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<PayrollRecord>> {
  return apiClient.get<PaginatedResponse<PayrollRecord>>(
    `/api/company/employees/${employeeId}/payroll?page=${page}&size=${size}`,
  );
}

// ============================================
// Payment APIs
// ============================================

/**
 * Đánh dấu đã thanh toán cho một nhân viên
 * POST /api/company/payroll/records/{id}/pay
 * @client-only
 */
export async function markAsPaid(payrollId: number): Promise<PayrollRecord> {
  return apiClient.post<PayrollRecord>(
    `/api/company/payroll/records/${payrollId}/pay`,
    {},
  );
}

/**
 * Thanh toán cho tất cả nhân viên trong kỳ
 * POST /api/company/payroll/pay?period=YYYY-MM
 * @client-only
 */
export async function payAll(period: YearMonth): Promise<PaymentResult[]> {
  const periodStr = formatPeriod(period);
  return apiClient.post<PaymentResult[]>(
    `/api/company/payroll/pay?period=${periodStr}`,
    {},
  );
}

/**
 * Thử lại thanh toán cho nhân viên bị lỗi
 * POST /api/company/payroll/records/{id}/retry
 * @client-only
 */
export async function retryPayment(payrollId: number): Promise<PayrollRecord> {
  return apiClient.post<PayrollRecord>(
    `/api/company/payroll/records/${payrollId}/retry`,
    {},
  );
}

// ============================================
// Notification APIs
// ============================================

/**
 * Gửi thông báo lương cho tất cả nhân viên trong kỳ
 * POST /api/company/payroll/notify?period=YYYY-MM
 * @client-only
 */
export async function sendNotifications(
  period: YearMonth,
): Promise<NotificationResult[]> {
  const periodStr = formatPeriod(period);
  return apiClient.post<NotificationResult[]>(
    `/api/company/payroll/notify?period=${periodStr}`,
    {},
  );
}

/**
 * Gửi thông báo lương cho một nhân viên
 * @client-only
 */
export async function sendNotification(payrollId: number): Promise<void> {
  return apiClient.post<void>(
    `/api/company/payroll/${payrollId}/send-notification`,
    {},
  );
}

// ============================================
// Export APIs
// ============================================

/**
 * Xuất bảng lương ra CSV
 * GET /api/company/payroll/export/csv?period=YYYY-MM
 * @client-only
 */
export async function exportCsv(period: YearMonth): Promise<Blob> {
  const periodStr = formatPeriod(period);
  const response = await fetch(
    `/api/company/payroll/export/csv?period=${periodStr}`,
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
 * GET /api/company/payroll/export/pdf?period=YYYY-MM
 * @client-only
 */
export async function exportPdf(period: YearMonth): Promise<Blob> {
  const periodStr = formatPeriod(period);
  const response = await fetch(
    `/api/company/payroll/export/pdf?period=${periodStr}`,
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
// Employee Payslip APIs
// ============================================

/**
 * Lấy danh sách phiếu lương của nhân viên (có phân trang)
 * @client-only
 */
export async function getMyPayslips(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<PayrollRecord>> {
  return apiClient.get<PaginatedResponse<PayrollRecord>>(
    `/api/employee/payroll?page=${page}&size=${size}`,
  );
}

/**
 * Lấy phiếu lương của nhân viên theo kỳ
 * @client-only
 */
export async function getMyPayslipByPeriod(
  period: YearMonth,
): Promise<PayrollRecord | null> {
  const periodStr = `${period.year}-${String(period.month).padStart(2, "0")}`;
  return apiClient.get<PayrollRecord | null>(
    `/api/employee/payroll/${periodStr}`,
  );
}

/**
 * Tải phiếu lương PDF
 * @client-only
 */
export async function downloadPayslipPdf(recordId: number): Promise<Blob> {
  const response = await fetch(`/api/employee/payroll/${recordId}/download`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to download payslip PDF");
  }

  return response.blob();
}

/**
 * Tải phiếu lương PDF cho company (dùng recordId)
 * @client-only
 */
export async function downloadCompanyPayslipPdf(
  recordId: number,
): Promise<Blob> {
  const response = await fetch(`/api/company/payroll/${recordId}/download`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to download payslip PDF");
  }

  return response.blob();
}

// ============================================
// Export API object
// ============================================

export const payrollApi = {
  // Company
  getPayrollSummary,
  previewPayroll,
  finalizePayroll,
  getPayrollRecords,
  getPayrollById,
  getEmployeePayroll,
  getEmployeePayrollHistory,
  // Payment
  markAsPaid,
  payAll,
  retryPayment,
  // Notification
  sendNotifications,
  sendNotification,
  // Export
  exportCsv,
  exportPdf,
  downloadCompanyPayslipPdf,
  // Employee
  getMyPayslips,
  getMyPayslipByPeriod,
  downloadPayslipPdf,
};
