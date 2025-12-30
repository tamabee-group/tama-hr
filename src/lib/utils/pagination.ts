/**
 * Các hàm tiện ích cho phân trang
 * Validates: Requirements 1.6, 3.3
 */

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/types/api";

/**
 * Interface cấu hình phân trang
 */
export interface PaginationConfig {
  page?: number;
  size?: number;
}

/**
 * Giá trị phân trang đã được xử lý
 */
export interface ResolvedPagination {
  page: number;
  size: number;
}

/**
 * Xử lý cấu hình phân trang và áp dụng giá trị mặc định
 * Nếu không chỉ định page size, PHẢI sử dụng default page size = 20
 *
 * @param config - Cấu hình phân trang (tùy chọn)
 * @returns Giá trị phân trang đã áp dụng defaults
 */
export function resolvePagination(
  config?: PaginationConfig,
): ResolvedPagination {
  return {
    page: config?.page ?? DEFAULT_PAGE,
    size: config?.size ?? DEFAULT_PAGE_SIZE,
  };
}

/**
 * Kiểm tra page size có nằm trong giới hạn cho phép không
 *
 * @param size - Kích thước trang cần kiểm tra
 * @param minSize - Kích thước tối thiểu (mặc định: 1)
 * @param maxSize - Kích thước tối đa (mặc định: 100)
 * @returns Kết quả validation
 */
export function validatePageSize(
  size: number,
  minSize: number = 1,
  maxSize: number = 100,
): { valid: boolean; error?: string } {
  if (size < minSize) {
    return {
      valid: false,
      error: `Kích thước trang phải ít nhất ${minSize}`,
    };
  }
  if (size > maxSize) {
    return {
      valid: false,
      error: `Kích thước trang không được vượt quá ${maxSize}`,
    };
  }
  return { valid: true };
}

/**
 * Kiểm tra số trang có hợp lệ không (không âm)
 *
 * @param page - Số trang cần kiểm tra
 * @returns Kết quả validation
 */
export function validatePageNumber(page: number): {
  valid: boolean;
  error?: string;
} {
  if (page < 0) {
    return {
      valid: false,
      error: "Số trang không được âm",
    };
  }
  return { valid: true };
}

/**
 * Tạo URLSearchParams cho phân trang
 *
 * @param config - Cấu hình phân trang
 * @returns URLSearchParams với các params phân trang
 */
export function buildPaginationParams(
  config?: PaginationConfig,
): URLSearchParams {
  const resolved = resolvePagination(config);
  const params = new URLSearchParams();
  params.append("page", resolved.page.toString());
  params.append("size", resolved.size.toString());
  return params;
}

/**
 * Lấy giá trị page size mặc định
 * Dùng để xác nhận default luôn là 20
 */
export function getDefaultPageSize(): number {
  return DEFAULT_PAGE_SIZE;
}

/**
 * Lấy giá trị page number mặc định
 */
export function getDefaultPage(): number {
  return DEFAULT_PAGE;
}
