import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  resolvePagination,
  validatePageSize,
  validatePageNumber,
  buildPaginationParams,
  getDefaultPageSize,
  getDefaultPage,
  PaginationConfig,
} from "@/lib/utils/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/types/api";

/**
 * Property-Based Tests cho Pagination Utility
 * Feature: wallet-management-ui
 */

describe("Pagination - Property Tests", () => {
  /**
   * Property 10: Pagination Default
   *
   * Với bất kỳ bảng phân trang nào không chỉ định page size, PHẢI sử dụng default page size = 20.
   */
  describe("Property 10: Pagination Default", () => {
    it("phải sử dụng default page size = 20 khi không chỉ định size", () => {
      fc.assert(
        fc.property(
          // Tạo số trang tùy chọn (undefined hoặc số hợp lệ)
          fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
          (page) => {
            const config: PaginationConfig = page !== undefined ? { page } : {};
            const resolved = resolvePagination(config);

            // Default page size PHẢI là 20
            expect(resolved.size).toBe(20);
            expect(resolved.size).toBe(DEFAULT_PAGE_SIZE);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải sử dụng default page = 0 khi không chỉ định page", () => {
      fc.assert(
        fc.property(
          // Tạo page size tùy chọn (undefined hoặc số hợp lệ)
          fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
          (size) => {
            const config: PaginationConfig = size !== undefined ? { size } : {};
            const resolved = resolvePagination(config);

            // Default page PHẢI là 0
            expect(resolved.page).toBe(0);
            expect(resolved.page).toBe(DEFAULT_PAGE);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải sử dụng cả hai defaults khi config là undefined", () => {
      fc.assert(
        fc.property(fc.constant(undefined), () => {
          const resolved = resolvePagination(undefined);

          expect(resolved.page).toBe(DEFAULT_PAGE);
          expect(resolved.size).toBe(DEFAULT_PAGE_SIZE);
          expect(resolved.size).toBe(20);
        }),
        { numRuns: 100 },
      );
    });

    it("phải sử dụng cả hai defaults khi config là object rỗng", () => {
      fc.assert(
        fc.property(fc.constant({}), () => {
          const resolved = resolvePagination({});

          expect(resolved.page).toBe(DEFAULT_PAGE);
          expect(resolved.size).toBe(DEFAULT_PAGE_SIZE);
          expect(resolved.size).toBe(20);
        }),
        { numRuns: 100 },
      );
    });

    it("phải giữ nguyên page size khi được chỉ định", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (size) => {
          const resolved = resolvePagination({ size });

          // Size được chỉ định phải được giữ nguyên
          expect(resolved.size).toBe(size);
          // Default page vẫn phải được áp dụng
          expect(resolved.page).toBe(DEFAULT_PAGE);
        }),
        { numRuns: 100 },
      );
    });

    it("phải giữ nguyên page number khi được chỉ định", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 1000 }), (page) => {
          const resolved = resolvePagination({ page });

          // Page được chỉ định phải được giữ nguyên
          expect(resolved.page).toBe(page);
          // Default size vẫn phải được áp dụng
          expect(resolved.size).toBe(DEFAULT_PAGE_SIZE);
        }),
        { numRuns: 100 },
      );
    });

    it("phải giữ nguyên cả hai giá trị khi cả hai được chỉ định", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 1, max: 100 }),
          (page, size) => {
            const resolved = resolvePagination({ page, size });

            expect(resolved.page).toBe(page);
            expect(resolved.size).toBe(size);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("getDefaultPageSize phải luôn trả về 20", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const defaultSize = getDefaultPageSize();
          expect(defaultSize).toBe(20);
        }),
        { numRuns: 100 },
      );
    });

    it("getDefaultPage phải luôn trả về 0", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const defaultPage = getDefaultPage();
          expect(defaultPage).toBe(0);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("buildPaginationParams - Giá trị mặc định", () => {
    it("phải tạo params với default size = 20 khi không chỉ định", () => {
      fc.assert(
        fc.property(
          fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
          (page) => {
            const config: PaginationConfig = page !== undefined ? { page } : {};
            const params = buildPaginationParams(config);

            expect(params.get("size")).toBe("20");
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải tạo params với default page = 0 khi không chỉ định", () => {
      fc.assert(
        fc.property(
          fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
          (size) => {
            const config: PaginationConfig = size !== undefined ? { size } : {};
            const params = buildPaginationParams(config);

            expect(params.get("page")).toBe("0");
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe("validatePageSize", () => {
    it("phải chấp nhận page size hợp lệ trong giới hạn", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (size) => {
          const result = validatePageSize(size);
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }),
        { numRuns: 100 },
      );
    });

    it("phải từ chối page size dưới mức tối thiểu", () => {
      fc.assert(
        fc.property(fc.integer({ min: -100, max: 0 }), (size) => {
          const result = validatePageSize(size);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it("phải từ chối page size vượt quá mức tối đa", () => {
      fc.assert(
        fc.property(fc.integer({ min: 101, max: 1000 }), (size) => {
          const result = validatePageSize(size);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("validatePageNumber", () => {
    it("phải chấp nhận số trang không âm", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 10000 }), (page) => {
          const result = validatePageNumber(page);
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }),
        { numRuns: 100 },
      );
    });

    it("phải từ chối số trang âm", () => {
      fc.assert(
        fc.property(fc.integer({ min: -1000, max: -1 }), (page) => {
          const result = validatePageNumber(page);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });
  });
});
