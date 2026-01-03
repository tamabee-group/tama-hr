import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  PayrollPeriodStatus,
  PAYROLL_PERIOD_STATUSES,
} from "@/types/attendance-enums";

/**
 * Property 7: Locked Payroll State
 * Validates: Requirements 8.9
 *
 * For any payroll period with status APPROVED or PAID,
 * all edit actions (adjust, delete) SHALL be disabled in the UI.
 */

// ============================================
// Helper Functions
// ============================================

/**
 * Kiểm tra xem payroll period có bị khóa không
 * Period bị khóa khi status là APPROVED hoặc PAID
 */
export function isPayrollPeriodLocked(status: PayrollPeriodStatus): boolean {
  return status === "APPROVED" || status === "PAID";
}

/**
 * Kiểm tra xem action có được phép không dựa trên status
 */
export function isActionAllowed(
  status: PayrollPeriodStatus,
  action: "adjust" | "delete" | "submit" | "approve" | "pay" | "reject",
): boolean {
  switch (action) {
    case "adjust":
    case "delete":
      // Chỉ cho phép khi status là DRAFT hoặc REVIEWING
      return status === "DRAFT" || status === "REVIEWING";
    case "submit":
      // Chỉ cho phép khi status là DRAFT
      return status === "DRAFT";
    case "approve":
    case "reject":
      // Chỉ cho phép khi status là REVIEWING
      return status === "REVIEWING";
    case "pay":
      // Chỉ cho phép khi status là APPROVED
      return status === "APPROVED";
    default:
      return false;
  }
}

/**
 * Lấy danh sách các actions bị disable dựa trên status
 */
export function getDisabledActions(
  status: PayrollPeriodStatus,
): ("adjust" | "delete" | "submit" | "approve" | "pay" | "reject")[] {
  const allActions: (
    | "adjust"
    | "delete"
    | "submit"
    | "approve"
    | "pay"
    | "reject"
  )[] = ["adjust", "delete", "submit", "approve", "pay", "reject"];

  return allActions.filter((action) => !isActionAllowed(status, action));
}

// ============================================
// Generators
// ============================================

// Generator cho PayrollPeriodStatus
const payrollPeriodStatusArb = fc.constantFrom<PayrollPeriodStatus>(
  ...PAYROLL_PERIOD_STATUSES,
);

// Generator cho locked statuses (APPROVED, PAID)
const lockedStatusArb = fc.constantFrom<PayrollPeriodStatus>(
  "APPROVED",
  "PAID",
);

// Generator cho unlocked statuses (DRAFT, REVIEWING)
const unlockedStatusArb = fc.constantFrom<PayrollPeriodStatus>(
  "DRAFT",
  "REVIEWING",
);

// Generator cho edit actions
const editActionArb = fc.constantFrom<"adjust" | "delete">("adjust", "delete");

// ============================================
// Property Tests
// ============================================

describe("Payroll Locked State Properties", () => {
  /**
   * Property 7: Locked Payroll State
   * Feature: flexible-workforce-management-ui, Property 7: Locked Payroll State
   * Validates: Requirements 8.9
   *
   * For any payroll period with status APPROVED or PAID,
   * all edit actions (adjust, delete) SHALL be disabled in the UI.
   */
  describe("Property 7: Locked Payroll State", () => {
    it("APPROVED và PAID status phải được xác định là locked", () => {
      fc.assert(
        fc.property(lockedStatusArb, (status) => {
          expect(isPayrollPeriodLocked(status)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("DRAFT và REVIEWING status phải được xác định là unlocked", () => {
      fc.assert(
        fc.property(unlockedStatusArb, (status) => {
          expect(isPayrollPeriodLocked(status)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("edit actions (adjust, delete) phải bị disable khi period locked", () => {
      fc.assert(
        fc.property(lockedStatusArb, editActionArb, (status, action) => {
          // Khi period locked, edit actions phải không được phép
          expect(isActionAllowed(status, action)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("edit actions (adjust, delete) phải được enable khi period unlocked", () => {
      fc.assert(
        fc.property(unlockedStatusArb, editActionArb, (status, action) => {
          // Khi period unlocked, edit actions phải được phép
          expect(isActionAllowed(status, action)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("getDisabledActions phải bao gồm adjust và delete khi locked", () => {
      fc.assert(
        fc.property(lockedStatusArb, (status) => {
          const disabledActions = getDisabledActions(status);
          expect(disabledActions).toContain("adjust");
          expect(disabledActions).toContain("delete");
        }),
        { numRuns: 100 },
      );
    });

    it("getDisabledActions không được bao gồm adjust và delete khi unlocked", () => {
      fc.assert(
        fc.property(unlockedStatusArb, (status) => {
          const disabledActions = getDisabledActions(status);
          expect(disabledActions).not.toContain("adjust");
          expect(disabledActions).not.toContain("delete");
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Workflow action permissions
   */
  describe("Workflow Action Permissions", () => {
    it("submit chỉ được phép khi status là DRAFT", () => {
      fc.assert(
        fc.property(payrollPeriodStatusArb, (status) => {
          const allowed = isActionAllowed(status, "submit");
          expect(allowed).toBe(status === "DRAFT");
        }),
        { numRuns: 100 },
      );
    });

    it("approve và reject chỉ được phép khi status là REVIEWING", () => {
      fc.assert(
        fc.property(payrollPeriodStatusArb, (status) => {
          const approveAllowed = isActionAllowed(status, "approve");
          const rejectAllowed = isActionAllowed(status, "reject");
          expect(approveAllowed).toBe(status === "REVIEWING");
          expect(rejectAllowed).toBe(status === "REVIEWING");
        }),
        { numRuns: 100 },
      );
    });

    it("pay chỉ được phép khi status là APPROVED", () => {
      fc.assert(
        fc.property(payrollPeriodStatusArb, (status) => {
          const allowed = isActionAllowed(status, "pay");
          expect(allowed).toBe(status === "APPROVED");
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Status transition consistency
   */
  describe("Status Transition Consistency", () => {
    it("locked status không có edit actions nào được phép", () => {
      fc.assert(
        fc.property(lockedStatusArb, (status) => {
          // Với locked status, adjust và delete phải bị disable
          const adjustAllowed = isActionAllowed(status, "adjust");
          const deleteAllowed = isActionAllowed(status, "delete");

          expect(adjustAllowed).toBe(false);
          expect(deleteAllowed).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("PAID status không có workflow action nào được phép", () => {
      // PAID là trạng thái cuối cùng, không có action nào được phép
      const allActions: (
        | "adjust"
        | "delete"
        | "submit"
        | "approve"
        | "pay"
        | "reject"
      )[] = ["adjust", "delete", "submit", "approve", "pay", "reject"];

      allActions.forEach((action) => {
        expect(isActionAllowed("PAID", action)).toBe(false);
      });
    });
  });
});
