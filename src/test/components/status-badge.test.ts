import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  getDepositStatusVariant,
  getCommissionStatusVariant,
  getVariantClass,
  BadgeVariant,
} from "@/app/[locale]/_components/_status-badge";
import { DepositStatus, CommissionStatus } from "@/types/enums";

/**
 * Property-Based Tests cho Status Badge Component
 * Feature: wallet-management-ui
 */

describe("StatusBadge - Property Tests", () => {
  /**
   * Property 4: Màu sắc Status Badge
   *
   * Với bất kỳ DepositStatus nào, Status_Badge PHẢI hiển thị màu đúng:
   * - PENDING → yellow/warning
   * - APPROVED → green/success
   * - REJECTED → red/destructive
   */
  describe("Property 4: Màu sắc Status Badge", () => {
    // Định nghĩa mapping expected
    const EXPECTED_DEPOSIT_COLORS: Record<DepositStatus, BadgeVariant> = {
      PENDING: "warning",
      APPROVED: "success",
      REJECTED: "destructive",
    };

    const EXPECTED_COMMISSION_COLORS: Record<CommissionStatus, BadgeVariant> = {
      PENDING: "warning",
      ELIGIBLE: "info",
      PAID: "success",
    };

    it("phải trả về variant đúng cho tất cả giá trị DepositStatus", () => {
      const depositStatuses: DepositStatus[] = [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ];

      fc.assert(
        fc.property(fc.constantFrom(...depositStatuses), (status) => {
          const variant = getDepositStatusVariant(status);
          const expectedVariant = EXPECTED_DEPOSIT_COLORS[status];

          expect(variant).toBe(expectedVariant);
        }),
        { numRuns: 100 },
      );
    });

    it("phải trả về variant đúng cho tất cả giá trị CommissionStatus", () => {
      const commissionStatuses: CommissionStatus[] = [
        "PENDING",
        "ELIGIBLE",
        "PAID",
      ];

      fc.assert(
        fc.property(fc.constantFrom(...commissionStatuses), (status) => {
          const variant = getCommissionStatusVariant(status);
          const expectedVariant = EXPECTED_COMMISSION_COLORS[status];

          expect(variant).toBe(expectedVariant);
        }),
        { numRuns: 100 },
      );
    });

    it("phải trả về CSS class hợp lệ cho tất cả variants", () => {
      const variants: BadgeVariant[] = [
        "warning",
        "success",
        "destructive",
        "default",
        "info",
      ];

      fc.assert(
        fc.property(fc.constantFrom(...variants), (variant) => {
          const cssClass = getVariantClass(variant);

          // Kiểm tra class không rỗng
          expect(cssClass).toBeTruthy();
          expect(typeof cssClass).toBe("string");
          expect(cssClass.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it("trạng thái PENDING phải luôn map sang variant warning", () => {
      fc.assert(
        fc.property(fc.constantFrom("PENDING" as DepositStatus), (status) => {
          const variant = getDepositStatusVariant(status);
          expect(variant).toBe("warning");

          const cssClass = getVariantClass(variant);
          expect(cssClass).toContain("yellow");
        }),
        { numRuns: 100 },
      );
    });

    it("trạng thái APPROVED phải luôn map sang variant success", () => {
      fc.assert(
        fc.property(fc.constantFrom("APPROVED" as DepositStatus), (status) => {
          const variant = getDepositStatusVariant(status);
          expect(variant).toBe("success");

          const cssClass = getVariantClass(variant);
          expect(cssClass).toContain("green");
        }),
        { numRuns: 100 },
      );
    });

    it("trạng thái REJECTED phải luôn map sang variant destructive", () => {
      fc.assert(
        fc.property(fc.constantFrom("REJECTED" as DepositStatus), (status) => {
          const variant = getDepositStatusVariant(status);
          expect(variant).toBe("destructive");

          const cssClass = getVariantClass(variant);
          expect(cssClass).toContain("red");
        }),
        { numRuns: 100 },
      );
    });
  });
});
