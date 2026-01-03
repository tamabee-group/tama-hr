import { apiClient } from "@/lib/utils/fetch-client";
import {
  UnifiedAttendanceRecord,
  AdjustmentRequest,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Unified Attendance API functions
 * Quản lý chấm công thống nhất (attendance + break trong 1 view)
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

export interface StartBreakResponse {
  id: number;
  breakStart: string;
  breakNumber: number;
  message: string;
}

export interface EndBreakResponse {
  id: number;
  breakEnd: string;
  actualBreakMinutes: number;
  message: string;
}

export interface UnifiedAttendanceFilters {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  status?: string;
}

export interface AdjustmentRequestPayload {
  attendanceId: number;
  adjustmentType: "CHECK_IN" | "CHECK_OUT" | "BOTH";
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  requestedBreakStart?: string;
  requestedBreakEnd?: string;
  reason: string;
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
    data || {},
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

// ============================================
// Employee Break Management
// ============================================

/**
 * Bắt đầu giờ nghỉ
 * @client-only
 */
export async function startBreak(): Promise<StartBreakResponse> {
  return apiClient.post<StartBreakResponse>(
    "/api/employee/attendance/break/start",
    {},
  );
}

/**
 * Kết thúc giờ nghỉ
 * @client-only
 */
export async function endBreak(breakId: number): Promise<EndBreakResponse> {
  return apiClient.post<EndBreakResponse>(
    `/api/employee/attendance/break/${breakId}/end`,
    {},
  );
}

// ============================================
// Employee Unified Attendance
// ============================================

/**
 * Lấy chấm công hôm nay (unified với break records)
 * @client-only
 */
export async function getTodayAttendance(): Promise<UnifiedAttendanceRecord | null> {
  return apiClient.get<UnifiedAttendanceRecord | null>(
    "/api/employee/attendance/today",
  );
}

/**
 * Lấy chấm công theo ngày (unified với break records)
 * @client-only
 */
export async function getAttendanceByDate(
  date: string,
): Promise<UnifiedAttendanceRecord | null> {
  return apiClient.get<UnifiedAttendanceRecord | null>(
    `/api/employee/attendance/${date}`,
  );
}

/**
 * Lấy danh sách chấm công theo tháng (unified)
 * @client-only
 */
export async function getAttendanceByMonth(
  year: number,
  month: number,
): Promise<UnifiedAttendanceRecord[]> {
  // API trả về paginated response, cần extract content
  const response = await apiClient.get<
    PaginatedResponse<UnifiedAttendanceRecord>
  >(`/api/employee/attendance/month?year=${year}&month=${month}`);
  return response.content || [];
}

/**
 * Gửi yêu cầu điều chỉnh chấm công
 * @client-only
 */
export async function submitAdjustmentRequest(
  data: AdjustmentRequestPayload,
): Promise<void> {
  return apiClient.post<void>(
    "/api/employee/attendance/adjustment-request",
    data,
  );
}

// ============================================
// Company Unified Attendance (Admin/Manager)
// ============================================

/**
 * Lấy danh sách chấm công unified của tất cả nhân viên (có phân trang)
 * @client-only
 */
export async function getCompanyAttendance(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  filters?: UnifiedAttendanceFilters,
): Promise<PaginatedResponse<UnifiedAttendanceRecord>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.employeeId)
    params.append("employeeId", filters.employeeId.toString());
  if (filters?.status) params.append("status", filters.status);

  return apiClient.get<PaginatedResponse<UnifiedAttendanceRecord>>(
    `/api/company/attendance?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết chấm công unified theo ID
 * @client-only
 */
export async function getCompanyAttendanceById(
  id: number,
): Promise<UnifiedAttendanceRecord> {
  return apiClient.get<UnifiedAttendanceRecord>(
    `/api/company/attendance/${id}`,
  );
}

/**
 * Lấy chấm công unified của nhân viên cụ thể theo ngày
 * Sử dụng API company attendance với filter employeeId
 * @client-only
 */
export async function getEmployeeAttendanceByDate(
  employeeId: number,
  date: string,
): Promise<UnifiedAttendanceRecord | null> {
  // Sử dụng API list với filter theo employeeId và date
  const response = await apiClient.get<
    PaginatedResponse<UnifiedAttendanceRecord>
  >(
    `/api/company/attendance?employeeId=${employeeId}&startDate=${date}&endDate=${date}&page=0&size=1`,
  );
  return response.content?.[0] || null;
}

/**
 * Lấy lịch sử điều chỉnh của attendance record (company view)
 * @client-only
 */
export async function getCompanyAdjustmentHistory(
  attendanceId: number,
): Promise<AdjustmentRequest[]> {
  return apiClient.get<AdjustmentRequest[]>(
    `/api/company/attendance/${attendanceId}/adjustment-history`,
  );
}

// ============================================
// Export API object
// ============================================

export const unifiedAttendanceApi = {
  // Employee check-in/out
  checkIn,
  checkOut,
  // Employee break
  startBreak,
  endBreak,
  // Employee unified attendance
  getTodayAttendance,
  getAttendanceByDate,
  getAttendanceByMonth,
  submitAdjustmentRequest,
  // Company unified attendance
  getCompanyAttendance,
  getCompanyAttendanceById,
  getEmployeeAttendanceByDate,
  getCompanyAdjustmentHistory,
};
