import { apiClient } from "@/lib/utils/fetch-client";
import {
  WorkSchedule,
  WorkScheduleInput,
  ScheduleAssignment,
} from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Work Schedule API functions
 * Quản lý lịch làm việc của công ty
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

// ============================================
// CRUD Operations
// ============================================

/**
 * Lấy danh sách lịch làm việc (có phân trang)
 * @client-only
 */
export async function getSchedules(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
): Promise<PaginatedResponse<WorkSchedule>> {
  return apiClient.get<PaginatedResponse<WorkSchedule>>(
    `/api/company/schedules?page=${page}&size=${size}`,
  );
}

/**
 * Lấy tất cả lịch làm việc (không phân trang)
 * @client-only
 */
export async function getAllSchedules(): Promise<WorkSchedule[]> {
  return apiClient.get<WorkSchedule[]>("/api/company/schedules/all");
}

/**
 * Lấy chi tiết lịch làm việc theo ID
 * @client-only
 */
export async function getScheduleById(id: number): Promise<WorkSchedule> {
  return apiClient.get<WorkSchedule>(`/api/company/schedules/${id}`);
}

/**
 * Tạo lịch làm việc mới
 * @client-only
 */
export async function createSchedule(
  data: WorkScheduleInput,
): Promise<WorkSchedule> {
  return apiClient.post<WorkSchedule>("/api/company/schedules", data);
}

/**
 * Cập nhật lịch làm việc
 * @client-only
 */
export async function updateSchedule(
  id: number,
  data: WorkScheduleInput,
): Promise<WorkSchedule> {
  return apiClient.put<WorkSchedule>(`/api/company/schedules/${id}`, data);
}

/**
 * Xóa lịch làm việc
 * @client-only
 */
export async function deleteSchedule(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/schedules/${id}`);
}

// ============================================
// Assignment Operations
// ============================================

/**
 * Gán lịch làm việc cho nhân viên
 * @client-only
 */
export async function assignSchedule(
  scheduleId: number,
  employeeIds: number[],
  effectiveFrom: string,
  effectiveTo?: string,
): Promise<ScheduleAssignment[]> {
  return apiClient.post<ScheduleAssignment[]>(
    `/api/company/schedules/${scheduleId}/assign`,
    {
      employeeIds,
      effectiveFrom,
      effectiveTo,
    },
  );
}

/**
 * Hủy gán lịch làm việc cho nhân viên
 * @client-only
 */
export async function unassignSchedule(
  scheduleId: number,
  employeeId: number,
): Promise<void> {
  return apiClient.delete<void>(
    `/api/company/schedules/${scheduleId}/assign/${employeeId}`,
  );
}

/**
 * Lấy danh sách nhân viên được gán lịch làm việc
 * @client-only
 */
export async function getScheduleAssignments(
  scheduleId: number,
): Promise<ScheduleAssignment[]> {
  return apiClient.get<ScheduleAssignment[]>(
    `/api/company/schedules/${scheduleId}/assignments`,
  );
}

/**
 * Lấy lịch làm việc hiệu lực của nhân viên tại ngày cụ thể
 * @client-only
 */
export async function getEffectiveSchedule(
  employeeId: number,
  date?: string,
): Promise<WorkSchedule | null> {
  const params = date ? `?date=${date}` : "";
  return apiClient.get<WorkSchedule | null>(
    `/api/company/employees/${employeeId}/effective-schedule${params}`,
  );
}

/**
 * Lấy lịch làm việc mặc định của công ty
 * @client-only
 */
export async function getDefaultSchedule(): Promise<WorkSchedule | null> {
  return apiClient.get<WorkSchedule | null>("/api/company/schedules/default");
}

/**
 * Đặt lịch làm việc làm mặc định
 * @client-only
 */
export async function setDefaultSchedule(scheduleId: number): Promise<void> {
  return apiClient.put<void>(`/api/company/schedules/${scheduleId}/default`);
}

// ============================================
// Export API object
// ============================================

export const workScheduleApi = {
  getSchedules,
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  assignSchedule,
  unassignSchedule,
  getScheduleAssignments,
  getEffectiveSchedule,
  getDefaultSchedule,
  setDefaultSchedule,
};
