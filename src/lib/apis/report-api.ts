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

export type ReportType =
  | "attendance"
  | "payroll"
  | "leave"
  | "break"
  | "overtime"
  | "break-compliance"
  | "payroll-summary"
  | "cost-analysis"
  | "shift-utilization";

export interface GenerateReportRequest {
  reportType: ReportType;
  filters: ReportFilters;
}

export interface OvertimeReportData {
  employees: {
    employeeId: number;
    employeeName: string;
    regularOvertimeMinutes: number;
    nightOvertimeMinutes: number;
    holidayOvertimeMinutes: number;
    weekendOvertimeMinutes: number;
    totalOvertimeMinutes: number;
    totalOvertimePay: number;
  }[];
  summary: {
    totalEmployees: number;
    totalRegularOvertime: number;
    totalNightOvertime: number;
    totalHolidayOvertime: number;
    totalWeekendOvertime: number;
    totalOvertimeMinutes: number;
    totalOvertimePay: number;
  };
}

export interface BreakComplianceReportData {
  employees: {
    employeeId: number;
    employeeName: string;
    totalDays: number;
    compliantDays: number;
    nonCompliantDays: number;
    complianceRate: number;
    averageBreakMinutes: number;
  }[];
  summary: {
    totalEmployees: number;
    overallComplianceRate: number;
    totalCompliantDays: number;
    totalNonCompliantDays: number;
  };
}

export interface PayrollSummaryReportData {
  periods: {
    year: number;
    month: number;
    totalEmployees: number;
    totalBaseSalary: number;
    totalOvertimePay: number;
    totalAllowances: number;
    totalDeductions: number;
    totalGrossSalary: number;
    totalNetSalary: number;
    status: string;
  }[];
  summary: {
    totalPeriods: number;
    grandTotalGross: number;
    grandTotalNet: number;
    averagePerEmployee: number;
  };
}

export interface CostAnalysisReportData {
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  trends: {
    period: string;
    baseSalary: number;
    overtime: number;
    allowances: number;
    total: number;
  }[];
  summary: {
    totalCost: number;
    baseSalaryPercentage: number;
    overtimePercentage: number;
    allowancesPercentage: number;
    costPerEmployee: number;
  };
}

export interface ShiftUtilizationReportData {
  shifts: {
    shiftId: number;
    shiftName: string;
    totalSlots: number;
    filledSlots: number;
    utilizationRate: number;
    averageAttendanceRate: number;
  }[];
  summary: {
    totalShifts: number;
    overallUtilizationRate: number;
    mostUtilizedShift: string;
    leastUtilizedShift: string;
  };
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
// New Report APIs (Flexible Workforce Management)
// ============================================

/**
 * Lấy báo cáo overtime breakdown
 * @client-only
 */
export async function getOvertimeReport(
  filters: ReportFilters,
): Promise<OvertimeReportData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());
  if (filters.employeeId)
    params.append("employeeId", filters.employeeId.toString());

  return apiClient.get<OvertimeReportData>(
    `/api/company/reports/overtime?${params.toString()}`,
  );
}

/**
 * Lấy báo cáo break compliance
 * @client-only
 */
export async function getBreakComplianceReport(
  filters: ReportFilters,
): Promise<BreakComplianceReportData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());
  if (filters.employeeId)
    params.append("employeeId", filters.employeeId.toString());

  return apiClient.get<BreakComplianceReportData>(
    `/api/company/reports/break-compliance?${params.toString()}`,
  );
}

/**
 * Lấy báo cáo payroll summary
 * @client-only
 */
export async function getPayrollSummaryReport(
  filters: ReportFilters,
): Promise<PayrollSummaryReportData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());

  return apiClient.get<PayrollSummaryReportData>(
    `/api/company/reports/payroll-summary?${params.toString()}`,
  );
}

/**
 * Lấy báo cáo cost analysis
 * @client-only
 */
export async function getCostAnalysisReport(
  filters: ReportFilters,
): Promise<CostAnalysisReportData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());

  return apiClient.get<CostAnalysisReportData>(
    `/api/company/reports/cost-analysis?${params.toString()}`,
  );
}

/**
 * Lấy báo cáo shift utilization
 * @client-only
 */
export async function getShiftUtilizationReport(
  filters: ReportFilters,
): Promise<ShiftUtilizationReportData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());

  return apiClient.get<ShiftUtilizationReportData>(
    `/api/company/reports/shift-utilization?${params.toString()}`,
  );
}

/**
 * Lấy dữ liệu biểu đồ overtime
 * @client-only
 */
export async function getOvertimeChartData(
  filters: ReportFilters,
): Promise<ChartData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());

  return apiClient.get<ChartData>(
    `/api/company/reports/overtime/chart?${params.toString()}`,
  );
}

/**
 * Lấy dữ liệu biểu đồ cost analysis
 * @client-only
 */
export async function getCostAnalysisChartData(
  filters: ReportFilters,
): Promise<ChartData> {
  const params = new URLSearchParams();
  params.append("startDate", filters.startDate);
  params.append("endDate", filters.endDate);
  if (filters.departmentId)
    params.append("departmentId", filters.departmentId.toString());

  return apiClient.get<ChartData>(
    `/api/company/reports/cost-analysis/chart?${params.toString()}`,
  );
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
  // New reports
  getOvertimeReport,
  getBreakComplianceReport,
  getPayrollSummaryReport,
  getCostAnalysisReport,
  getShiftUtilizationReport,
  getOvertimeChartData,
  getCostAnalysisChartData,
};
