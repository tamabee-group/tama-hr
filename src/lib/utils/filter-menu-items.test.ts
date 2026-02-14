import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { filterMenuItems } from "./filter-menu-items";
import type { MenuItem } from "@/constants/menu-items";
import type { UserRole } from "@/types/enums";
import { LayoutDashboard } from "lucide-react";

/**
 * Property: Sidebar Role Filtering
 * Property: Nested Menu Filtering
 */

// Tất cả UserRole values
const ALL_USER_ROLES: UserRole[] = [
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
  "EMPLOYEE_TAMABEE",
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
  "EMPLOYEE_COMPANY",
];

// Generator cho UserRole
const userRoleArb = fc.constantFrom(...ALL_USER_ROLES);

// Generator cho MenuItem đơn giản (không có children)
const simpleMenuItemArb = fc
  .record({
    code: fc.string({ minLength: 1, maxLength: 20 }),
    labelKey: fc.string({ minLength: 1, maxLength: 50 }),
    href: fc.string({ minLength: 1, maxLength: 50 }),
    roles: fc.option(fc.array(userRoleArb, { minLength: 1, maxLength: 3 }), {
      nil: undefined,
    }),
  })
  .map((item) => ({
    ...item,
    icon: LayoutDashboard,
  })) as fc.Arbitrary<MenuItem>;

// Generator cho MenuItem với children
const menuItemWithChildrenArb = fc
  .record({
    code: fc.string({ minLength: 1, maxLength: 20 }),
    labelKey: fc.string({ minLength: 1, maxLength: 50 }),
    href: fc.string({ minLength: 1, maxLength: 50 }),
    roles: fc.option(fc.array(userRoleArb, { minLength: 1, maxLength: 3 }), {
      nil: undefined,
    }),
    children: fc.array(simpleMenuItemArb, { minLength: 1, maxLength: 3 }),
  })
  .map((item) => ({
    ...item,
    icon: LayoutDashboard,
  })) as fc.Arbitrary<MenuItem>;

// Generator cho array of MenuItems (mix of simple and with children)
const menuItemsArb = fc.array(
  fc.oneof(simpleMenuItemArb, menuItemWithChildrenArb),
  { minLength: 0, maxLength: 5 },
);

describe("filterMenuItems - Sidebar Role Filtering", () => {
  /**
   * Property: Sidebar Role Filtering
   * For any menu item with roles array, the sidebar SHALL display the item
   * only if user.role is included in the roles array.
   * For any menu item without roles array, the sidebar SHALL display the item
   * to all users.
   */
  it("should show items with roles only when user role matches", () => {
    fc.assert(
      fc.property(menuItemsArb, userRoleArb, (items, role) => {
        const result = filterMenuItems(items, role);

        // Kiểm tra tất cả items trong result
        for (const item of result) {
          if (item.roles) {
            // Nếu item có roles, user role phải nằm trong đó
            expect(item.roles).toContain(role);
          }
          // Items không có roles luôn pass
        }
      }),
      { numRuns: 100 },
    );
  });

  it("should hide items when user role not in roles array", () => {
    fc.assert(
      fc.property(userRoleArb, (role) => {
        // Tạo roles array không chứa role hiện tại
        const otherRoles = ALL_USER_ROLES.filter((r) => r !== role);
        const items: MenuItem[] = [
          {
            code: "admin-only",
            labelKey: "menu.admin",
            icon: LayoutDashboard,
            href: "/admin",
            roles: otherRoles.slice(0, 2) as UserRole[],
          },
        ];

        const result = filterMenuItems(items, role);

        // Item phải bị ẩn vì role không match
        expect(result).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  it("should show items without roles to all users", () => {
    fc.assert(
      fc.property(userRoleArb, (role) => {
        const items: MenuItem[] = [
          {
            code: "public",
            labelKey: "menu.public",
            icon: LayoutDashboard,
            href: "/public",
            // Không có roles
          },
        ];

        const result = filterMenuItems(items, role);

        // Item không có roles hiển thị cho tất cả users
        expect(result).toHaveLength(1);
      }),
      { numRuns: 100 },
    );
  });
});

describe("filterMenuItems - Nested Menu Filtering", () => {
  /**
   * Property: Nested Menu Filtering
   * For any parent menu item with children, the sidebar SHALL recursively
   * apply role filtering to all children.
   * For any parent with all children filtered out, the sidebar SHALL hide
   * the parent item.
   */
  it("should recursively filter children by role", () => {
    fc.assert(
      fc.property(menuItemWithChildrenArb, userRoleArb, (item, role) => {
        const result = filterMenuItems([item], role);

        // Nếu parent được hiển thị
        if (result.length > 0 && result[0].children) {
          // Kiểm tra tất cả children đều pass role check
          for (const child of result[0].children) {
            if (child.roles) {
              expect(child.roles).toContain(role);
            }
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("should hide parent when all children are filtered out", () => {
    fc.assert(
      fc.property(userRoleArb, (role) => {
        // Tạo parent với children mà tất cả đều bị filter
        const otherRoles = ALL_USER_ROLES.filter((r) => r !== role);
        const items: MenuItem[] = [
          {
            code: "parent",
            labelKey: "menu.parent",
            icon: LayoutDashboard,
            href: "/parent",
            children: [
              {
                code: "child1",
                labelKey: "menu.child1",
                icon: LayoutDashboard,
                href: "/parent/child1",
                roles: otherRoles.slice(0, 2) as UserRole[],
              },
              {
                code: "child2",
                labelKey: "menu.child2",
                icon: LayoutDashboard,
                href: "/parent/child2",
                roles: otherRoles.slice(0, 2) as UserRole[],
              },
            ],
          },
        ];

        const result = filterMenuItems(items, role);

        // Parent phải bị ẩn vì tất cả children bị filter
        expect(result).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  it("should keep parent when at least one child passes filter", () => {
    fc.assert(
      fc.property(userRoleArb, (role) => {
        const items: MenuItem[] = [
          {
            code: "parent",
            labelKey: "menu.parent",
            icon: LayoutDashboard,
            href: "/parent",
            children: [
              {
                code: "child-visible",
                labelKey: "menu.child.visible",
                icon: LayoutDashboard,
                href: "/parent/visible",
                // Không có roles - hiển thị cho tất cả
              },
              {
                code: "child-hidden",
                labelKey: "menu.child.hidden",
                icon: LayoutDashboard,
                href: "/parent/hidden",
                roles: [], // Empty roles - không ai thấy
              },
            ],
          },
        ];

        const result = filterMenuItems(items, role);

        // Parent vẫn hiển thị vì có 1 child pass
        expect(result).toHaveLength(1);
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children![0].code).toBe("child-visible");
      }),
      { numRuns: 100 },
    );
  });
});
