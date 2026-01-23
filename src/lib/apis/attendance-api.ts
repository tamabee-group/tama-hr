import { apiClient } from "@/lib/utils/fetch-client";
import {
  AttendanceRecord,
  AttendanceSummary,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Attendance API functions
 * Quản lý chấm công của nhân viên
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

export interface CheckInRequest {
  latitude?: number;
  longitude?: number;
  deviceId?: string;
}

export interface CheckInResponse {
  id: number;
  checkInTime: string;
  message: string;
}

export interface CheckOutRequest {
  latitude?: number;
  longitude?: number;
  deviceId?: string;
}

export interface CheckOutResponse {
  id: number;
  checkOutTime: string;
  workingMinutes: number;
  message: string;
}

export interface AttendanceFilters {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  status?: string;
}

// ============================================
// Employee Check-in/Check-out
// ============================================

/**
 * Chấm công vào
 * @client-only
 */
export async function checkIn(data?: CheckInRequest): Promise<CheckInResponse> {
  return apiClient.post<CheckInResponse>(
    "/api/employee/attendance/check-in",
    data,
  );
}

/**
 * Chấm công ra
 * @client-only
 */
export async function checkOut(
  data?: CheckOutRequest,
): Promise<CheckOutResponse> {
  return apiClient.post<CheckOutResponse>(
    "/api/employee/attendance/check-out",
    data || {},
  );
}

/**
 * Lấy trạng thái chấm công hôm nay của nhân viên
 * @client-only
 */
export async function getTodayStatus(): Promise<AttendanceRecord | null> {
  return apiClient.get<AttendanceRecord | null>(
    "/api/employee/attendance/today",
  );
}

// ============================================
// Employee Attendance Records
// ============================================

/**
 * Lấy danh sách chấm công của nhân viên (có phân trang)
 * @client-only
 */
export async function getMyAttendanceRecords(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: AttendanceFilters,
): Promise<PaginatedResponse<AttendanceRecord>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.status) params.append("status", filters.status);

  return apiClient.get<PaginatedResponse<AttendanceRecord>>(
    `/api/employee/attendance?${params.toString()}`,
  );
}

/**
 * Lấy chấm công của nhân viên theo tháng (cho calendar view)
 * @client-only
 */
export async function getMyAttendanceByMonth(
  year: number,
  month: number,
): Promise<AttendanceRecord[]> {
  const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>(
    `/api/employee/attendance/month?year=${year}&month=${month}`,
  );
  return response.content;
}

/**
 * Lấy chi tiết chấm công của nhân viên theo ngày
 * @client-only
 */
export async function getMyAttendanceByDate(
  date: string,
): Promise<AttendanceRecord | null> {
  return apiClient.get<AttendanceRecord | null>(
    `/api/employee/attendance/${date}`,
  );
}

/**
 * Lấy tổng hợp chấm công của nhân viên theo khoảng thời gian
 * @client-only
 */
export async function getMyAttendanceSummary(
  startDate: string,
  endDate: string,
): Promise<AttendanceSummary> {
  return apiClient.get<AttendanceSummary>(
    `/api/employee/attendance/summary?startDate=${startDate}&endDate=${endDate}`,
  );
}

// ============================================
// Company Attendance Records (Admin/Manager)
// ============================================

/**
 * Lấy danh sách chấm công của tất cả nhân viên (có phân trang)
 * @client-only
 */
export async function getAttendanceRecords(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: AttendanceFilters,
): Promise<PaginatedResponse<AttendanceRecord>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.status) params.append("status", filters.status);

  return apiClient.get<PaginatedResponse<AttendanceRecord>>(
    `/api/company/attendance?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết chấm công theo ID
 * @client-only
 */
export async function getAttendanceById(id: number): Promise<AttendanceRecord> {
  return apiClient.get<AttendanceRecord>(`/api/company/attendance/${id}`);
}

/**
 * Lấy chấm công của nhân viên cụ thể theo tháng
 * @client-only
 */
export async function getEmployeeAttendanceByMonth(
  employeeId: number,
  year: number,
  month: number,
): Promise<AttendanceRecord[]> {
  const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>(
    `/api/company/employees/${employeeId}/attendance/month?year=${year}&month=${month}`,
  );
  return response.content || [];
}

/**
 * Lấy tổng hợp chấm công của nhân viên cụ thể
 * @client-only
 */
export async function getEmployeeAttendanceSummary(
  employeeId: number,
  period?: string, // format: yyyy-MM
): Promise<AttendanceSummary> {
  const params = new URLSearchParams();
  if (period) params.append("period", period);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiClient.get<AttendanceSummary>(
    `/api/company/employees/${employeeId}/attendance/summary${queryString}`,
  );
}

/**
 * Lấy tổng hợp chấm công của toàn công ty
 * @client-only
 */
export async function getCompanyAttendanceSummary(
  startDate: string,
  endDate: string,
): Promise<AttendanceSummary> {
  return apiClient.get<AttendanceSummary>(
    `/api/company/attendance/summary?startDate=${startDate}&endDate=${endDate}`,
  );
}

// ============================================
// Export API object
// ============================================

export const attendanceApi = {
  // Employee
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendanceRecords,
  getMyAttendanceByMonth,
  getMyAttendanceByDate,
  getMyAttendanceSummary,
  // Company
  getAttendanceRecords,
  getAttendanceById,
  getEmployeeAttendanceByMonth,
  getEmployeeAttendanceSummary,
  getCompanyAttendanceSummary,
};
