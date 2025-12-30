import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  UserRole,
  DepositPermissions,
  getDepositPermissions,
  canApproveRejectDeposits,
  canCreateDeposits,
  canViewDeposits,
  getTamabeeRoles,
  getCompanyRoles,
  getAllRoles,
} from "@/app/[locale]/(AdminLayout)/tamabee/deposits/_role-permissions";

/**
 * Property-Based Tests cho phân quyền UI theo Role
 * Feature: wallet-management-ui
 *
 * Property 9: Phân quyền UI theo Role
 *
 * Với mỗi trang, các UI elements (buttons, forms) PHẢI hiển thị/ẩn dựa trên role:
 * - ADMIN_TAMABEE: toàn quyền
 * - MANAGER_TAMABEE: xem + duyệt/từ chối deposits
 * - EMPLOYEE_TAMABEE: chỉ xem
 * - ADMIN_COMPANY: xem + tạo deposits
 * - MANAGER_COMPANY: chỉ xem
 */
describe("Phân quyền UI theo Role - Property Tests", () => {
  // Arbitraries cho các roles
  const tamabeeRoleArb = fc.constantFrom<UserRole>(
    "ADMIN_TAMABEE",
    "MANAGER_TAMABEE",
    "EMPLOYEE_TAMABEE",
  );

  const companyRoleArb = fc.constantFrom<UserRole>(
    "ADMIN_COMPANY",
    "MANAGER_COMPANY",
    "EMPLOYEE_COMPANY",
  );

  const allRoleArb = fc.constantFrom<UserRole>(...getAllRoles());

  describe("Property 9: Phân quyền UI theo Role", () => {
    /**
     * ADMIN_TAMABEE phải có toàn quyền quản lý deposit
     */
    it("ADMIN_TAMABEE phải có toàn quyền (xem, duyệt, từ chối)", () => {
      fc.assert(
        fc.property(fc.constantFrom<UserRole>("ADMIN_TAMABEE"), (role) => {
          const permissions = getDepositPermissions(role);

          expect(permissions.canViewDeposits).toBe(true);
          expect(permissions.canApproveDeposits).toBe(true);
          expect(permissions.canRejectDeposits).toBe(true);
          // Tamabee users không tạo deposits
          expect(permissions.canCreateDeposits).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * MANAGER_TAMABEE phải có quyền xem + duyệt/từ chối
     */
    it("MANAGER_TAMABEE phải có quyền xem + duyệt/từ chối", () => {
      fc.assert(
        fc.property(fc.constantFrom<UserRole>("MANAGER_TAMABEE"), (role) => {
          const permissions = getDepositPermissions(role);

          expect(permissions.canViewDeposits).toBe(true);
          expect(permissions.canApproveDeposits).toBe(true);
          expect(permissions.canRejectDeposits).toBe(true);
          expect(permissions.canCreateDeposits).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * EMPLOYEE_TAMABEE chỉ có quyền xem
     */
    it("EMPLOYEE_TAMABEE chỉ có quyền xem", () => {
      fc.assert(
        fc.property(fc.constantFrom<UserRole>("EMPLOYEE_TAMABEE"), (role) => {
          const permissions = getDepositPermissions(role);

          expect(permissions.canViewDeposits).toBe(true);
          expect(permissions.canApproveDeposits).toBe(false);
          expect(permissions.canRejectDeposits).toBe(false);
          expect(permissions.canCreateDeposits).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * ADMIN_COMPANY phải có quyền xem + tạo deposits
     */
    it("ADMIN_COMPANY phải có quyền xem + tạo deposits", () => {
      fc.assert(
        fc.property(fc.constantFrom<UserRole>("ADMIN_COMPANY"), (role) => {
          const permissions = getDepositPermissions(role);

          expect(permissions.canViewDeposits).toBe(true);
          expect(permissions.canApproveDeposits).toBe(false);
          expect(permissions.canRejectDeposits).toBe(false);
          expect(permissions.canCreateDeposits).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * MANAGER_COMPANY chỉ có quyền xem
     */
    it("MANAGER_COMPANY chỉ có quyền xem", () => {
      fc.assert(
        fc.property(fc.constantFrom<UserRole>("MANAGER_COMPANY"), (role) => {
          const permissions = getDepositPermissions(role);

          expect(permissions.canViewDeposits).toBe(true);
          expect(permissions.canApproveDeposits).toBe(false);
          expect(permissions.canRejectDeposits).toBe(false);
          expect(permissions.canCreateDeposits).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * EMPLOYEE_COMPANY không có quyền truy cập
     */
    it("EMPLOYEE_COMPANY không có quyền truy cập", () => {
      fc.assert(
        fc.property(fc.constantFrom<UserRole>("EMPLOYEE_COMPANY"), (role) => {
          const permissions = getDepositPermissions(role);

          expect(permissions.canViewDeposits).toBe(false);
          expect(permissions.canApproveDeposits).toBe(false);
          expect(permissions.canRejectDeposits).toBe(false);
          expect(permissions.canCreateDeposits).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Chỉ ADMIN_TAMABEE và MANAGER_TAMABEE có thể duyệt/từ chối deposits
     */
    it("chỉ ADMIN_TAMABEE và MANAGER_TAMABEE có thể duyệt/từ chối deposits", () => {
      fc.assert(
        fc.property(allRoleArb, (role) => {
          const canApproveReject = canApproveRejectDeposits(role);
          const expectedCanApproveReject =
            role === "ADMIN_TAMABEE" || role === "MANAGER_TAMABEE";

          expect(canApproveReject).toBe(expectedCanApproveReject);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Chỉ ADMIN_COMPANY có thể tạo deposits
     */
    it("chỉ ADMIN_COMPANY có thể tạo deposits", () => {
      fc.assert(
        fc.property(allRoleArb, (role) => {
          const canCreate = canCreateDeposits(role);
          const expectedCanCreate = role === "ADMIN_COMPANY";

          expect(canCreate).toBe(expectedCanCreate);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Tất cả roles trừ EMPLOYEE_COMPANY có thể xem deposits
     */
    it("tất cả roles trừ EMPLOYEE_COMPANY có thể xem deposits", () => {
      fc.assert(
        fc.property(allRoleArb, (role) => {
          const canView = canViewDeposits(role);
          const expectedCanView = role !== "EMPLOYEE_COMPANY";

          expect(canView).toBe(expectedCanView);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Quyền phải nhất quán - cùng role luôn trả về cùng quyền
     */
    it("quyền phải nhất quán cho cùng role", () => {
      fc.assert(
        fc.property(allRoleArb, (role) => {
          const permissions1 = getDepositPermissions(role);
          const permissions2 = getDepositPermissions(role);

          expect(permissions1.canViewDeposits).toBe(
            permissions2.canViewDeposits,
          );
          expect(permissions1.canApproveDeposits).toBe(
            permissions2.canApproveDeposits,
          );
          expect(permissions1.canRejectDeposits).toBe(
            permissions2.canRejectDeposits,
          );
          expect(permissions1.canCreateDeposits).toBe(
            permissions2.canCreateDeposits,
          );
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Quyền duyệt và từ chối phải luôn bằng nhau
     * (nếu có thể duyệt thì cũng có thể từ chối và ngược lại)
     */
    it("quyền duyệt và từ chối phải luôn bằng nhau", () => {
      fc.assert(
        fc.property(allRoleArb, (role) => {
          const permissions = getDepositPermissions(role);

          expect(permissions.canApproveDeposits).toBe(
            permissions.canRejectDeposits,
          );
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Tamabee roles không bao giờ có thể tạo deposits
     */
    it("Tamabee roles không bao giờ có thể tạo deposits", () => {
      fc.assert(
        fc.property(tamabeeRoleArb, (role) => {
          const permissions = getDepositPermissions(role);

          expect(permissions.canCreateDeposits).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    /**
     * Company roles không bao giờ có thể duyệt/từ chối deposits
     */
    it("Company roles không bao giờ có thể duyệt/từ chối deposits", () => {
      fc.assert(
        fc.property(companyRoleArb, (role) => {
          const permissions = getDepositPermissions(role);

          expect(permissions.canApproveDeposits).toBe(false);
          expect(permissions.canRejectDeposits).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("Hàm helper", () => {
    it("getTamabeeRoles phải trả về đúng 3 roles", () => {
      const roles = getTamabeeRoles();
      expect(roles).toHaveLength(3);
      expect(roles).toContain("ADMIN_TAMABEE");
      expect(roles).toContain("MANAGER_TAMABEE");
      expect(roles).toContain("EMPLOYEE_TAMABEE");
    });

    it("getCompanyRoles phải trả về đúng 3 roles", () => {
      const roles = getCompanyRoles();
      expect(roles).toHaveLength(3);
      expect(roles).toContain("ADMIN_COMPANY");
      expect(roles).toContain("MANAGER_COMPANY");
      expect(roles).toContain("EMPLOYEE_COMPANY");
    });

    it("getAllRoles phải trả về đúng 6 roles", () => {
      const roles = getAllRoles();
      expect(roles).toHaveLength(6);
    });
  });
});
