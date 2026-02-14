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
// Helpers - chuyển đổi giữa frontend (isNational) và backend (type)
// ============================================

interface BackendHoliday {
  id: number;
  companyId: number;
  name: string;
  date: string;
  type: "NATIONAL" | "COMPANY";
  isPaid: boolean;
  description?: string;
}

/** Chuyển response backend → frontend Holiday */
function toHoliday(h: BackendHoliday): Holiday {
  return {
    id: h.id,
    companyId: h.companyId,
    name: h.name,
    date: h.date,
    isNational: h.type === "NATIONAL",
    description: h.description,
  };
}

/** Chuyển frontend HolidayInput → backend request */
function toBackendInput(data: HolidayInput) {
  return {
    name: data.name,
    date: data.date,
    type: data.isNational ? "NATIONAL" : "COMPANY",
    description: data.description,
  };
}

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

  const res = await apiClient.get<PaginatedResponse<BackendHoliday>>(
    `/api/company/holidays?${params.toString()}`,
  );
  return { ...res, content: res.content.map(toHoliday) };
}

/**
 * Lấy tất cả ngày nghỉ lễ trong năm (không phân trang)
 * @client-only
 */
export async function getHolidaysByYear(year: number): Promise<Holiday[]> {
  const res = await apiClient.get<BackendHoliday[]>(
    `/api/company/holidays/year/${year}`,
  );
  return res.map(toHoliday);
}

/**
 * Lấy ngày nghỉ lễ theo khoảng thời gian
 * @client-only
 */
export async function getHolidaysByDateRange(
  startDate: string,
  endDate: string,
): Promise<Holiday[]> {
  const res = await apiClient.get<BackendHoliday[]>(
    `/api/company/holidays/range?startDate=${startDate}&endDate=${endDate}`,
  );
  return res.map(toHoliday);
}

/**
 * Lấy chi tiết ngày nghỉ lễ theo ID
 * @client-only
 */
export async function getHolidayById(id: number): Promise<Holiday> {
  const res = await apiClient.get<BackendHoliday>(
    `/api/company/holidays/${id}`,
  );
  return toHoliday(res);
}

/**
 * Tạo ngày nghỉ lễ mới
 * @client-only
 */
export async function createHoliday(data: HolidayInput): Promise<Holiday> {
  const res = await apiClient.post<BackendHoliday>(
    "/api/company/holidays",
    toBackendInput(data),
  );
  return toHoliday(res);
}

/**
 * Cập nhật ngày nghỉ lễ
 * @client-only
 */
export async function updateHoliday(
  id: number,
  data: HolidayInput,
): Promise<Holiday> {
  const res = await apiClient.put<BackendHoliday>(
    `/api/company/holidays/${id}`,
    toBackendInput(data),
  );
  return toHoliday(res);
}

/**
 * Xóa ngày nghỉ lễ
 * @client-only
 */
export async function deleteHoliday(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/company/holidays/${id}`);
}

/**
 * Xóa tất cả ngày nghỉ lễ
 * @client-only
 */
export async function deleteAllHolidays(): Promise<void> {
  return apiClient.delete<void>("/api/company/holidays");
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
  const res = await apiClient.get<BackendHoliday[]>(
    `/api/company/holidays/national?year=${year}`,
  );
  return res.map(toHoliday);
}

// ============================================
// Sync Operations
// ============================================

/**
 * Đồng bộ ngày lễ quốc gia từ Google Calendar
 * @client-only
 */
export async function syncNationalHolidays(year: number): Promise<Holiday[]> {
  const res = await apiClient.post<BackendHoliday[]>(
    `/api/company/settings/holidays/sync?year=${year}`,
  );
  return res.map(toHoliday);
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
  deleteAllHolidays,
  isHoliday,
  getNationalHolidays,
  syncNationalHolidays,
};
