import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  isSidebarItemActive,
  isRouteActive,
  findActiveSidebarItem,
} from "@/lib/utils/sidebar-active";
import type { SidebarItem, SidebarGroup } from "@/types/sidebar";
import { tamabeeSidebarGroups } from "@/app/[locale]/(AdminLayout)/tamabee/_components/_tamabee-sidebar-items";
import { companySidebarGroups } from "@/app/[locale]/(AdminLayout)/company/_components/_company-sidebar-items";
import { employeeSidebarGroups } from "@/app/[locale]/(AdminLayout)/employee/_components/_employee-sidebar-items";

/**
 * Property-Based Tests cho Sidebar Active State
 * Feature: wallet-management-ui
 */

// Chuyển đổi groups thành flat items để test
const flattenGroups = (groups: SidebarGroup[]): SidebarItem[] => {
  return groups.flatMap((group) => group.items);
};

// Lấy danh sách các routes hợp lệ từ sidebar items
const getValidRoutes = (items: SidebarItem[]): string[] => {
  const routes: string[] = [];
  items.forEach((item) => {
    if (item.url !== "#") {
      routes.push(item.url);
    }
    if (item.items) {
      item.items.forEach((subItem) => {
        if (subItem.url !== "#") {
          routes.push(subItem.url);
        }
      });
    }
  });
  return routes;
};

// Flatten các groups thành items
const tamabeeSidebarItems = flattenGroups(tamabeeSidebarGroups);
const companySidebarItems = flattenGroups(companySidebarGroups);
const employeeSidebarItems = flattenGroups(employeeSidebarGroups);

describe("Trạng thái Active của Sidebar - Property Tests", () => {
  /**
   * Property 7: Trạng thái Active của Sidebar
   *
   * Với bất kỳ route nào trong ứng dụng, Sidebar_Item tương ứng PHẢI có trạng thái active (được highlight).
   */

  describe("Tamabee Sidebar", () => {
    const tamabeeRoutes = getValidRoutes(tamabeeSidebarItems);

    it("phải có item active cho bất kỳ route Tamabee hợp lệ nào", () => {
      fc.assert(
        fc.property(fc.constantFrom(...tamabeeRoutes), (pathname) => {
          const activeItem = findActiveSidebarItem(
            tamabeeSidebarItems,
            pathname,
          );
          expect(activeItem).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it("sidebar item có sub-items phải active khi sub-item route khớp", () => {
      const itemsWithSubItems = tamabeeSidebarItems.filter(
        (item) => item.items && item.items.length > 0,
      );

      if (itemsWithSubItems.length > 0) {
        fc.assert(
          fc.property(fc.constantFrom(...itemsWithSubItems), (item) => {
            if (item.items) {
              item.items.forEach((subItem) => {
                if (subItem.url !== "#") {
                  const isActive = isSidebarItemActive(item, subItem.url);
                  expect(isActive).toBe(true);
                }
              });
            }
          }),
          { numRuns: 100 },
        );
      }
    });
  });

  describe("Company Sidebar", () => {
    const companyRoutes = getValidRoutes(companySidebarItems);

    it("phải có item active cho bất kỳ route Company hợp lệ nào", () => {
      fc.assert(
        fc.property(fc.constantFrom(...companyRoutes), (pathname) => {
          const activeItem = findActiveSidebarItem(
            companySidebarItems,
            pathname,
          );
          expect(activeItem).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it("sidebar item có sub-items phải active khi sub-item route khớp", () => {
      const itemsWithSubItems = companySidebarItems.filter(
        (item) => item.items && item.items.length > 0,
      );

      if (itemsWithSubItems.length > 0) {
        fc.assert(
          fc.property(fc.constantFrom(...itemsWithSubItems), (item) => {
            if (item.items) {
              item.items.forEach((subItem) => {
                if (subItem.url !== "#") {
                  const isActive = isSidebarItemActive(item, subItem.url);
                  expect(isActive).toBe(true);
                }
              });
            }
          }),
          { numRuns: 100 },
        );
      }
    });
  });

  describe("Employee Sidebar", () => {
    const employeeRoutes = getValidRoutes(employeeSidebarItems);

    it("phải có item active cho bất kỳ route Employee hợp lệ nào", () => {
      fc.assert(
        fc.property(fc.constantFrom(...employeeRoutes), (pathname) => {
          const activeItem = findActiveSidebarItem(
            employeeSidebarItems,
            pathname,
          );
          expect(activeItem).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("Quy tắc chung", () => {
    const tamabeeRoutes = getValidRoutes(tamabeeSidebarItems);
    const companyRoutes = getValidRoutes(companySidebarItems);
    const employeeRoutes = getValidRoutes(employeeSidebarItems);
    const allRoutes = [...tamabeeRoutes, ...companyRoutes, ...employeeRoutes];

    it("URL placeholder (#) không bao giờ được active", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (pathname) => {
          const result = isRouteActive("#", pathname);
          expect(result).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("route trang chủ (/) chỉ active khi khớp chính xác", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("/", "", "/company", "/tamabee", "/company/wallet"),
          (pathname) => {
            const result = isRouteActive("/", pathname);
            if (pathname === "/" || pathname === "") {
              expect(result).toBe(true);
            } else {
              expect(result).toBe(false);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("nested routes phải kích hoạt item cha", () => {
      const nestedRouteTests = [
        { parent: "/company/wallet", nested: "/company/wallet/deposits" },
        { parent: "/tamabee/wallets", nested: "/tamabee/wallets/123" },
        { parent: "/company/employees", nested: "/company/employees/create" },
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...nestedRouteTests),
          ({ parent, nested }) => {
            const result = isRouteActive(parent, nested);
            expect(result).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("routes không liên quan không được kích hoạt item", () => {
      const unrelatedTests = [
        { itemUrl: "/company/wallet", pathname: "/tamabee/wallets" },
        { itemUrl: "/tamabee/plans", pathname: "/company/profile" },
        { itemUrl: "/company/employees", pathname: "/company/settings" },
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...unrelatedTests),
          ({ itemUrl, pathname }) => {
            const result = isRouteActive(itemUrl, pathname);
            expect(result).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("khớp route chính xác phải luôn kích hoạt item", () => {
      const validRoutes = allRoutes.filter(
        (route) => route !== "/" && route !== "#",
      );

      fc.assert(
        fc.property(fc.constantFrom(...validRoutes), (route) => {
          const result = isRouteActive(route, route);
          expect(result).toBe(true);
        }),
        { numRuns: 100 },
      );
    });
  });
});
