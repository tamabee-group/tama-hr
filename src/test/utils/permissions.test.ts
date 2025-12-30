import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  TAMABEE_PERMISSIONS,
  hasPermission,
  isAdminTamabee,
  isTamabeeStaff,
  isEmployeeTamabee,
  PermissionKey,
  TamabeeRole,
} from "@/types/permissions";

/**
 * Property-Based Tests cho Permission System
 * Feature: tamabee-role-redesign-frontend
 */

describe("Permission System - Property Tests", () => {
  const allRoles: TamabeeRole[] = [
    "ADMIN_TAMABEE",
    "MANAGER_TAMABEE",
    "EMPLOYEE_TAMABEE",
  ];

  const allPermissions: PermissionKey[] = Object.keys(
    TAMABEE_PERMISSIONS,
  ) as PermissionKey[];

  /**
   * Property 1: Permission check trả về đúng kết quả
   *
   * Với bất kỳ role và permission key nào, hasPermission(role, permission)
   * PHẢI trả về true khi và chỉ khi role nằm trong danh sách allowed roles của permission đó.
   */
  describe("Property 1: Permission check trả về đúng kết quả", () => {
    it("hasPermission trả về true khi role nằm trong allowed roles", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allRoles),
          fc.constantFrom(...allPermissions),
          (role, permission) => {
            const allowedRoles = TAMABEE_PERMISSIONS[
              permission
            ] as readonly string[];
            const expected = allowedRoles.includes(role);
            const actual = hasPermission(role, permission);
            expect(actual).toBe(expected);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("hasPermission trả về false cho role không hợp lệ", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => !allRoles.includes(s as TamabeeRole)),
          fc.constantFrom(...allPermissions),
          (invalidRole, permission) => {
            expect(hasPermission(invalidRole, permission)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Unit Tests cho helper functions
   */
  describe("isAdminTamabee", () => {
    it("trả về true cho ADMIN_TAMABEE", () => {
      expect(isAdminTamabee("ADMIN_TAMABEE")).toBe(true);
    });

    it("trả về false cho các role khác", () => {
      expect(isAdminTamabee("MANAGER_TAMABEE")).toBe(false);
      expect(isAdminTamabee("EMPLOYEE_TAMABEE")).toBe(false);
      expect(isAdminTamabee("ADMIN_COMPANY")).toBe(false);
      expect(isAdminTamabee("")).toBe(false);
    });
  });

  describe("isTamabeeStaff", () => {
    it("trả về true cho ADMIN_TAMABEE và MANAGER_TAMABEE", () => {
      expect(isTamabeeStaff("ADMIN_TAMABEE")).toBe(true);
      expect(isTamabeeStaff("MANAGER_TAMABEE")).toBe(true);
    });

    it("trả về false cho EMPLOYEE_TAMABEE và các role khác", () => {
      expect(isTamabeeStaff("EMPLOYEE_TAMABEE")).toBe(false);
      expect(isTamabeeStaff("ADMIN_COMPANY")).toBe(false);
      expect(isTamabeeStaff("")).toBe(false);
    });
  });

  describe("isEmployeeTamabee", () => {
    it("trả về true cho EMPLOYEE_TAMABEE", () => {
      expect(isEmployeeTamabee("EMPLOYEE_TAMABEE")).toBe(true);
    });

    it("trả về false cho các role khác", () => {
      expect(isEmployeeTamabee("ADMIN_TAMABEE")).toBe(false);
      expect(isEmployeeTamabee("MANAGER_TAMABEE")).toBe(false);
      expect(isEmployeeTamabee("ADMIN_COMPANY")).toBe(false);
      expect(isEmployeeTamabee("")).toBe(false);
    });
  });

  /**
   * Kiểm tra tính nhất quán của TAMABEE_PERMISSIONS
   */
  describe("TAMABEE_PERMISSIONS consistency", () => {
    it("ADMIN_TAMABEE có quyền DIRECT_WALLET_MANIPULATION", () => {
      expect(hasPermission("ADMIN_TAMABEE", "DIRECT_WALLET_MANIPULATION")).toBe(
        true,
      );
    });

    it("MANAGER_TAMABEE không có quyền DIRECT_WALLET_MANIPULATION", () => {
      expect(
        hasPermission("MANAGER_TAMABEE", "DIRECT_WALLET_MANIPULATION"),
      ).toBe(false);
    });

    it("EMPLOYEE_TAMABEE chỉ có quyền VIEW_REFERRED_COMPANIES", () => {
      expect(hasPermission("EMPLOYEE_TAMABEE", "VIEW_REFERRED_COMPANIES")).toBe(
        true,
      );
      expect(hasPermission("EMPLOYEE_TAMABEE", "VIEW_ALL_COMPANIES")).toBe(
        false,
      );
    });
  });
});
