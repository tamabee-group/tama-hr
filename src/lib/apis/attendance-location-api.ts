import { apiClient } from "@/lib/utils/fetch-client";
import { AttendanceLocation } from "@/types/attendance-config";
import { PaginatedResponse } from "@/types/api";

/**
 * Attendance Location API functions
 * Quản lý vị trí chấm công
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Constants
// ============================================

const BASE_URL = "/api/company/settings/locations";
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;

// ============================================
// Request Types
// ============================================

/** Request tạo vị trí chấm công mới */
export interface CreateAttendanceLocationRequest {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive?: boolean;
}

/** Request cập nhật vị trí chấm công */
export interface UpdateAttendanceLocationRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  isActive?: boolean;
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Lấy danh sách vị trí chấm công (có phân trang)
 * @client-only
 */
export async function getLocations(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_SIZE,
): Promise<PaginatedResponse<AttendanceLocation>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  return apiClient.get<PaginatedResponse<AttendanceLocation>>(
    `${BASE_URL}?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết vị trí chấm công theo ID
 * @client-only
 */
export async function getLocation(id: number): Promise<AttendanceLocation> {
  return apiClient.get<AttendanceLocation>(`${BASE_URL}/${id}`);
}

/**
 * Tạo vị trí chấm công mới
 * @client-only
 */
export async function createLocation(
  data: CreateAttendanceLocationRequest,
): Promise<AttendanceLocation> {
  return apiClient.post<AttendanceLocation>(BASE_URL, data);
}

/**
 * Cập nhật vị trí chấm công
 * @client-only
 */
export async function updateLocation(
  id: number,
  data: UpdateAttendanceLocationRequest,
): Promise<AttendanceLocation> {
  return apiClient.put<AttendanceLocation>(`${BASE_URL}/${id}`, data);
}

/**
 * Xóa vị trí chấm công (soft delete)
 * @client-only
 */
export async function deleteLocation(id: number): Promise<void> {
  return apiClient.delete<void>(`${BASE_URL}/${id}`);
}

// ============================================
// Export API object
// ============================================

export const attendanceLocationApi = {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
};
