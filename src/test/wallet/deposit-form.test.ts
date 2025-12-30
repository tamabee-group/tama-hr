import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateAmount } from "@/app/[locale]/(AdminLayout)/company/wallet/_deposit-form";

/**
 * Property-Based Tests cho Deposit Form
 * Feature: wallet-management-ui
 */

describe("DepositForm - Property Tests", () => {
  /**
   * Property 2: Validation Form - Số tiền
   *
   * Với bất kỳ input số tiền nào trong Deposit_Form hoặc Refund_Form,
   * nếu amount <= 0 thì form PHẢI hiển thị error và KHÔNG ĐƯỢC submit.
   */
  describe("Property 2: Validation Form - Số tiền", () => {
    it("phải từ chối tất cả số không dương (amount <= 0)", () => {
      fc.assert(
        fc.property(
          fc.integer({ max: 0 }), // Tạo số nguyên <= 0
          (amount) => {
            const result = validateAmount(amount);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải chấp nhận tất cả số dương (amount > 0)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000000 }), // Số nguyên dương
          (amount) => {
            const result = validateAmount(amount);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải chấp nhận số thập phân dương", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.01),
            max: Math.fround(1000000),
            noNaN: true,
          }),
          (amount) => {
            const result = validateAmount(amount);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải từ chối số thập phân âm", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(-1000000),
            max: Math.fround(-0.01),
            noNaN: true,
          }),
          (amount) => {
            const result = validateAmount(amount);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải từ chối số 0", () => {
      const result = validateAmount(0);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("phải từ chối NaN", () => {
      const result = validateAmount(NaN);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("validation phải nhất quán: valid XOR error được định nghĩa", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: -1000000, max: 1000000 }),
            fc.float({ min: -1000000, max: 1000000, noNaN: true }),
            fc.constant(0),
            fc.constant(NaN),
          ),
          (amount) => {
            const result = validateAmount(amount);
            // XOR: valid === true thì error undefined, valid === false thì error defined
            const isConsistent =
              (result.valid && result.error === undefined) ||
              (!result.valid && result.error !== undefined);
            expect(isConsistent).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
