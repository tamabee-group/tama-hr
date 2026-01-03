import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  filterSidebarByWorkMode,
  filterSidebarItemsByWorkMode,
  isUrlHiddenByWorkMode,
  getHiddenTabsForUrl,
  WORK_MODE_FILTER_CONFIG,
} from "@/lib/utils/sidebar-work-mode-filter";
import { WorkMode } from "@/types/attendance-config";

/**
 * Property-Based Tests cho Sidebar Work Mode Filter
 * Feature: work-schedule-redesign
 * Property 2: Sidebar Filtering by Work Mode
 *
 * Lưu ý: Schedules đã được gộp vào Shifts page, không còn ở sidebar
 * Nên không cần ẩn schedules ở sidebar nữa
 */

// Arbitrary để tạo SidebarItem ngẫu nhiên (không bao gồm schedules vì đã gộp vào shifts)
const sidebarItemArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 50 }),
  url: fc.oneof(
    fc.constant("/company/shifts"),
    fc.constant("/company/employees"),
    fc.constant("/company/dashboard"),
    fc.constant("/company/attendance"),
    fc.constant("/company/payroll"),
    fc.constant("/company/settings"),
    fc.constant("/company/contracts"),
    fc.constant("/company/holidays"),
  ),
  icon: fc.constant(null as unknown as React.ReactNode),
});

// Arbitrary để tạo SidebarGroup ngẫu nhiên
const sidebarGroupArbitrary = fc.record({
  label: fc.string({ minLength: 1, maxLength: 30 }),
  items: fc.array(sidebarItemArbitrary, { minLength: 1, maxLength: 5 }),
});

// Arbitrary cho WorkMode
const workModeArbitrary = fc.constantFrom<WorkMode>(
  WorkMode.FIXED_HOURS,
  WorkMode.FLEXIBLE_SHIFT,
);

describe("Sidebar Work Mode Filter - Property Tests", () => {
  /**
   * Property 2: Sidebar Filtering by Work Mode
   * Schedules đã được gộp vào Shifts page nên không cần ẩn ở sidebar
   * Thay vào đó, tabs trong Shifts page sẽ được ẩn dựa trên work mode
   */
  describe("Property 2: Sidebar Filtering by Work Mode", () => {
    it("Sidebar không ẩn items nào vì schedules đã gộp vào shifts", () => {
      fc.assert(
        fc.property(
          fc.array(sidebarItemArbitrary, { minLength: 1, maxLength: 10 }),
          workModeArbitrary,
          (items, workMode) => {
            const filtered = filterSidebarItemsByWorkMode(items, workMode);

            // Số lượng items không thay đổi vì không có hiddenUrls
            expect(filtered.length).toBe(items.length);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("FLEXIBLE_SHIFT mode phải hiển thị tất cả items", () => {
      fc.assert(
        fc.property(
          fc.array(sidebarItemArbitrary, { minLength: 1, maxLength: 10 }),
          (items) => {
            const filtered = filterSidebarItemsByWorkMode(
              items,
              WorkMode.FLEXIBLE_SHIFT,
            );

            // Số lượng items không thay đổi
            expect(filtered.length).toBe(items.length);

            // Tất cả items gốc đều có trong filtered
            items.forEach((item) => {
              const found = filtered.some((f) => f.url === item.url);
              expect(found).toBe(true);
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it("filterSidebarByWorkMode phải loại bỏ groups rỗng sau khi filter", () => {
      fc.assert(
        fc.property(
          fc.array(sidebarGroupArbitrary, { minLength: 1, maxLength: 5 }),
          workModeArbitrary,
          (groups, workMode) => {
            const filtered = filterSidebarByWorkMode(groups, workMode);

            // Không có group nào rỗng
            filtered.forEach((group) => {
              expect(group.items.length).toBeGreaterThan(0);
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it("isUrlHiddenByWorkMode phải trả về false cho tất cả URLs vì không ẩn gì ở sidebar", () => {
      fc.assert(
        fc.property(
          sidebarItemArbitrary,
          workModeArbitrary,
          (item, workMode) => {
            const isHidden = isUrlHiddenByWorkMode(item.url, workMode);
            // Không có URL nào bị ẩn ở sidebar
            expect(isHidden).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("getHiddenTabsForUrl phải trả về schedules và templates cho /company/shifts khi FIXED_HOURS", () => {
      fc.assert(
        fc.property(workModeArbitrary, (workMode) => {
          const hiddenTabs = getHiddenTabsForUrl("/company/shifts", workMode);

          if (workMode === WorkMode.FIXED_HOURS) {
            expect(hiddenTabs).toContain("schedules");
            expect(hiddenTabs).toContain("templates");
          } else {
            expect(hiddenTabs.length).toBe(0);
          }
        }),
        { numRuns: 100 },
      );
    });

    it("filter phải preserve tất cả items vì không có hiddenUrls", () => {
      fc.assert(
        fc.property(
          fc.array(sidebarItemArbitrary, { minLength: 1, maxLength: 10 }),
          workModeArbitrary,
          (items, workMode) => {
            const filtered = filterSidebarItemsByWorkMode(items, workMode);
            const config = WORK_MODE_FILTER_CONFIG[workMode];

            // Không có hiddenUrls nên tất cả items đều được giữ lại
            expect(config.hiddenUrls.length).toBe(0);
            expect(filtered.length).toBe(items.length);

            items.forEach((item) => {
              const found = filtered.some((f) => f.url === item.url);
              expect(found).toBe(true);
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it("filter phải idempotent - filter 2 lần cho kết quả giống nhau", () => {
      fc.assert(
        fc.property(
          fc.array(sidebarItemArbitrary, { minLength: 1, maxLength: 10 }),
          workModeArbitrary,
          (items, workMode) => {
            const filtered1 = filterSidebarItemsByWorkMode(items, workMode);
            const filtered2 = filterSidebarItemsByWorkMode(filtered1, workMode);

            expect(filtered1.length).toBe(filtered2.length);
            filtered1.forEach((item, index) => {
              expect(item.url).toBe(filtered2[index].url);
            });
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
