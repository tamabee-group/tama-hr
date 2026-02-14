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
  latitude?: number;
  longitude?: number;
}

export interface EndBreakRequest {
  latitude?: number;
  longitude?: number;
}

export interface BreakRecordResponse {
  id: number;
  attendanceRecordId: number;
  breakStart: string;
  breakEnd: string | null;
  breakMinutes: number;
  note: string | null;
  breakStartLatitude?: number;
  breakStartLongitude?: number;
  breakEndLatitude?: number;
  breakEndLongitude?: number;
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
  request?: EndBreakRequest,
): Promise<BreakRecordResponse> {
  return apiClient.post<BreakRecordResponse>(
    `/api/employee/attendance/break/${breakRecordId}/end`,
    request,
  );
}

// ============================================
// Export API object
// ============================================

export const breakApi = {
  startBreak,
  endBreak,
};
