import { apiClient } from "@/lib/utils/fetch-client";
import { Holiday, HolidayInput } from "@/types/attendance-records";
import { PaginatedResponse } from "@/types/api";

/**
 * Holiday API functions
 * Quản lý ngày nghỉ lễ
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
 * Lấy danh sách ngày nghỉ lễ (có phân trang)
 * @client-only
 */
export async function getHolidays(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_LIMIT,
  year?: number,
): Promise<PaginatedResponse<Holiday>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (year) params.append("year", year.toString());

  return apiClient.get<PaginatedResponse<Holiday>>(
    `/api/company/holidays?${params.toString()}`,
  );
}

/**
 * Lấy tất cả ngày nghỉ lễ trong năm (không phân trang)
 * @client-only
 */
export async function getHolidaysByYear(year: number): Promise<Holiday[]> {
  return apiClient.get<Holiday[]>(`/api/company/holidays/year/${year}`);
}

/**
 * Lấy ngày nghỉ lễ theo khoảng thời gian
 * @client-only
 */
export async function getHolidaysByDateRange(
  startDate: string,
  endDate: string,
): Promise<Holiday[]> {
  return apiClient.get<Holiday[]>(
    `/api/company/holidays/range?startDate=${startDate}&endDate=${endDate}`,
  );
}

/**
 * Lấy chi tiết ngày nghỉ lễ theo ID
 * @client-only
 */
export async function getHolidayById(id: number): Promise<Holiday> {
  return apiClient.get<Holiday>(`/api/company/holidays/${id}`);
}

/**
 * Tạo ngày nghỉ lễ mới
 * @client-only
 */
export async function createHoliday(data: HolidayInput): Promise<Holiday> {
  return apiClient.post<Holiday>("/api/company/holidays", data);
}

/**
 * Cập nhật ngày nghỉ lễ
 * @client-only
 */
export async function updateHoliday(
  id: number,
  data: HolidayInput,
): Promise<Holiday> {
  return apiClient.put<Holiday>(`/api/company/holidays/${id}`, data);
}

/**
 * Xóa ngày nghỉ lễ
 * @client-only
 */
export async function deleteHoliday(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/holidays/${id}`);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Kiểm tra ngày có phải ngày nghỉ lễ không
 * @client-only
 */
export async function isHoliday(date: string): Promise<boolean> {
  return apiClient.get<boolean>(`/api/company/holidays/check?date=${date}`);
}

/**
 * Lấy ngày nghỉ lễ quốc gia (national holidays)
 * @client-only
 */
export async function getNationalHolidays(year: number): Promise<Holiday[]> {
  return apiClient.get<Holiday[]>(
    `/api/company/holidays/national?year=${year}`,
  );
}

// ============================================
// Export API object
// ============================================

export const holidayApi = {
  getHolidays,
  getHolidaysByYear,
  getHolidaysByDateRange,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  isHoliday,
  getNationalHolidays,
};
