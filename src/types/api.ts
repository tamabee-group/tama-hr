/**
 * Common API response types
 */

/**
 * Response phân trang từ Spring Data JPA
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * Params cho request phân trang
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 0;
export const DEFAULT_PAGE_SIZE = 20;
