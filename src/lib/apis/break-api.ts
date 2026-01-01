import { apiClient } from "@/lib/utils/fetch-client";
import type { BreakRecord } from "@/types/attendance-records";

/**
 * Break API functions
 * Quản lý giờ giải lao của nhân viên
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Request/Response Types
// ============================================

export interface StartBreakRequest {
  attendanceRecordId: number;
  note?: string;
}

export interface BreakRecordResponse {
  id: number;
  attendanceRecordId: number;
  breakStart: string;
  breakEnd: string | null;
  breakMinutes: number;
  note: string | null;
}

export interface BreakSummaryResponse {
  employeeId: number;
  employeeName: string;
  workDate: string;
  totalActualBreakMinutes: number;
  totalEffectiveBreakMinutes: number;
  breakCount: number;
  breakType: string;
  breakCompliant: boolean;
  minimumBreakRequired: number;
  breakRecords: BreakRecord[];
}

// ============================================
// Break Operations
// ============================================

/**
 * Bắt đầu giờ giải lao
 * @client-only
 */
export async function startBreak(
  request: StartBreakRequest,
): Promise<BreakRecordResponse> {
  return apiClient.post<BreakRecordResponse>(
    "/api/employee/attendance/break/start",
    request,
  );
}

/**
 * Kết thúc giờ giải lao
 * @client-only
 */
export async function endBreak(
  breakRecordId: number,
): Promise<BreakRecordResponse> {
  return apiClient.post<BreakRecordResponse>(
    `/api/employee/attendance/break/${breakRecordId}/end`,
  );
}

/**
 * Lấy danh sách giờ giải lao theo ngày
 * @client-only
 */
export async function getBreaksByDate(
  date: string,
): Promise<BreakSummaryResponse> {
  return apiClient.get<BreakSummaryResponse>(
    `/api/employee/attendance/${date}/breaks`,
  );
}

/**
 * Lấy giờ giải lao hôm nay
 * @client-only
 */
export async function getTodayBreaks(): Promise<BreakSummaryResponse> {
  // Sử dụng local date thay vì UTC để tránh lệch timezone
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;
  return getBreaksByDate(today);
}

// ============================================
// Break Adjustment Types
// ============================================

export interface CreateBreakAdjustmentRequest {
  breakRecordId: number;
  requestedBreakStart?: string;
  requestedBreakEnd?: string;
  reason: string;
}

// ============================================
// Break Adjustment Operations
// ============================================

/**
 * Tạo yêu cầu điều chỉnh giờ giải lao
 * @client-only
 */
export async function createBreakAdjustment(
  request: CreateBreakAdjustmentRequest,
): Promise<BreakRecordResponse> {
  return apiClient.post<BreakRecordResponse>(
    "/api/employee/attendance/break/adjustment",
    request,
  );
}

// ============================================
// Export API object
// ============================================

export const breakApi = {
  startBreak,
  endBreak,
  getBreaksByDate,
  getTodayBreaks,
  createBreakAdjustment,
};
