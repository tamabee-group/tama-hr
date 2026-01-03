import { apiClient } from "@/lib/utils/fetch-client";

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

// ============================================
// Export API object
// ============================================

export const breakApi = {
  startBreak,
  endBreak,
};
