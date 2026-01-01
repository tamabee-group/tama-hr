import { apiClient } from "@/lib/utils/fetch-client";
import {
  ReportFilters,
  ReportData,
  ChartData,
  BreakReportData,
} from "@/types/attendance-records";

/**
 * Report API functions
 * Quản lý báo cáo chấm công và lương
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Types
// ============================================

export type ReportType = "attendance" | "payroll" | "leave" | "break";

export interface GenerateReportRequest {
  reportType: ReportType;
  filters: ReportFilters;
}

// ============================================
// Report Generation
// ============================================

/**
 * Tạo báo cáo
 * @client-only
 */
export async function generateReport(
  request: GenerateReportRequest,
): Promise<ReportData> {
  return apiClient.post<ReportData>("/api/company/reports/generate", request);
}

/**
 * Lấy báo cáo chấm công
 * @client-only
 */
export async function getAttendanceReport(
  filters: ReportFilters,
): Promise<ReportData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());
  if (filters.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters.status) params.append("status", filters.status);

  return apiClient.get<ReportData>(
    `/api/company/reports/attendance?${params.toString()}`,
  );
}

/**
 * Lấy báo cáo lương
 * @client-only
 */
export async function getPayrollReport(
  filters: ReportFilters,
): Promise<ReportData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());
  if (filters.employeeId)
    params.append("employeeId", filters.employeeId.toString());

  return apiClient.get<ReportData>(
    `/api/company/reports/payroll?${params.toString()}`,
  );
}

/**
 * Lấy báo cáo nghỉ phép
 * @client-only
 */
export async function getLeaveReport(
  filters: ReportFilters,
): Promise<ReportData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());
  if (filters.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters.status) params.append("status", filters.status);

  return apiClient.get<ReportData>(
    `/api/company/reports/leave?${params.toString()}`,
  );
}

/**
 * Lấy báo cáo giờ giải lao theo ngày
 * @client-only
 */
export async function getDailyBreakReport(
  date: string,
): Promise<BreakReportData> {
  return apiClient.get<BreakReportData>(
    `/api/company/reports/break/daily?date=${date}`,
  );
}

/**
 * Lấy báo cáo giờ giải lao theo tháng
 * @client-only
 */
export async function getMonthlyBreakReport(
  year: number,
  month: number,
): Promise<BreakReportData> {
  return apiClient.get<BreakReportData>(
    `/api/company/reports/break/monthly?year=${year}&month=${month}`,
  );
}

// ============================================
// Chart Data
// ============================================

/**
 * Lấy dữ liệu biểu đồ chấm công
 * @client-only
 */
export async function getAttendanceChartData(
  filters: ReportFilters,
): Promise<ChartData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());

  return apiClient.get<ChartData>(
    `/api/company/reports/attendance/chart?${params.toString()}`,
  );
}

/**
 * Lấy dữ liệu biểu đồ lương
 * @client-only
 */
export async function getPayrollChartData(
  filters: ReportFilters,
): Promise<ChartData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());

  return apiClient.get<ChartData>(
    `/api/company/reports/payroll/chart?${params.toString()}`,
  );
}

// ============================================
// Export Functions
// ============================================

/**
 * Xuất báo cáo ra CSV
 * @client-only
 */
export async function exportCsv(
  reportType: ReportType,
  filters: ReportFilters,
): Promise<Blob> {
  const params = new URLSearchParams();
  params.append("reportType", reportType);
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());
  if (filters.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters.status) params.append("status", filters.status);

  const response = await fetch(
    `/api/company/reports/export/csv?${params.toString()}`,
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
 * Xuất báo cáo ra PDF
 * @client-only
 */
export async function exportPdf(
  reportType: ReportType,
  filters: ReportFilters,
): Promise<Blob> {
  const params = new URLSearchParams();
  params.append("reportType", reportType);
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());
  if (filters.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters.status) params.append("status", filters.status);

  const response = await fetch(
    `/api/company/reports/export/pdf?${params.toString()}`,
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

/**
 * Xuất báo cáo giờ giải lao ra CSV
 * @client-only
 */
export async function exportBreakReportCsv(
  reportType: "daily" | "monthly",
  date?: string,
  year?: number,
  month?: number,
): Promise<Blob> {
  const params = new URLSearchParams();
  params.append("type", reportType);
  if (date) params.append("date", date);
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  const response = await fetch(
    `/api/company/reports/break/export/csv?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to export break report CSV");
  }

  return response.blob();
}

// ============================================
// Export API object
// ============================================

export const reportApi = {
  generateReport,
  getAttendanceReport,
  getPayrollReport,
  getLeaveReport,
  getDailyBreakReport,
  getMonthlyBreakReport,
  getAttendanceChartData,
  getPayrollChartData,
  exportCsv,
  exportPdf,
  exportBreakReportCsv,
};
