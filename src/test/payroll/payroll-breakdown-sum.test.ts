import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  calculatePayrollBreakdown,
  verifyPayrollBreakdownSum,
  type PayrollBreakdownInput,
} from "@/lib/utils/payroll-breakdown";

/**
 * Property Test: Payroll Breakdown Sum Invariant
 * Feature: attendance-payroll-frontend, Task 14.9
 *
 * Property 3: Payroll Breakdown Sum Invariant
 * For any payslip view, the displayed gross salary SHALL equal
 * (base salary + total overtime pay + total allowances),
 * and net salary SHALL equal (gross salary - total deductions).
 */

// ============================================
// Arbitraries
// ============================================

// Arbitrary cho số tiền hợp lệ (0 - 10,000,000)
const moneyArb = fc.integer({ min: 0, max: 10_000_000 });

// Arbitrary cho số tiền nhỏ (0 - 1,000,000) cho allowances/deductions
const smallMoneyArb = fc.integer({ min: 0, max: 1_000_000 });

// Arbitrary cho PayrollBreakdownInput
const payrollInputArb = fc.record({
  baseSalary: moneyArb,
  regularOvertimePay: smallMoneyArb,
  nightWorkPay: smallMoneyArb,
  nightOvertimePay: smallMoneyArb,
  holidayOvertimePay: smallMoneyArb,
  holidayNightOvertimePay: smallMoneyArb,
  allowances: fc.array(smallMoneyArb, { minLength: 0, maxLength: 5 }),
  deductions: fc.array(smallMoneyArb, { minLength: 0, maxLength: 5 }),
});

// Arbitrary cho input với deductions lớn hơn gross (edge case)
const highDeductionInputArb = fc.record({
  baseSalary: fc.integer({ min: 100_000, max: 500_000 }),
  regularOvertimePay: fc.integer({ min: 0, max: 50_000 }),
  nightWorkPay: fc.integer({ min: 0, max: 50_000 }),
  nightOvertimePay: fc.integer({ min: 0, max: 50_000 }),
  holidayOvertimePay: fc.integer({ min: 0, max: 50_000 }),
  holidayNightOvertimePay: fc.integer({ min: 0, max: 50_000 }),
  allowances: fc.array(fc.integer({ min: 0, max: 50_000 }), {
    minLength: 0,
    maxLength: 3,
  }),
  deductions: fc.array(fc.integer({ min: 100_000, max: 500_000 }), {
    minLength: 1,
    maxLength: 5,
  }),
});

// ============================================
// Tests
// ============================================

describe("Payroll Breakdown Sum Invariant Properties", () => {
  /**
   * Property 1: Total overtime pay equals sum of all overtime components
   * totalOvertimePay SHALL equal sum of all overtime pay types.
   */
  it("Property 1: totalOvertimePay should equal sum of all overtime components", () => {
    fc.assert(
      fc.property(payrollInputArb, (input) => {
        const result = calculatePayrollBreakdown(input);

        const expectedTotalOvertime =
          input.regularOvertimePay +
          input.nightWorkPay +
          input.nightOvertimePay +
          input.holidayOvertimePay +
          input.holidayNightOvertimePay;

        expect(
          result.totalOvertimePay,
          `totalOvertimePay should be ${expectedTotalOvertime}`,
        ).toBe(expectedTotalOvertime);

        return result.totalOvertimePay === expectedTotalOvertime;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: Total allowances equals sum of all allowance items
   * totalAllowances SHALL equal sum of all allowance amounts.
   */
  it("Property 2: totalAllowances should equal sum of all allowance items", () => {
    fc.assert(
      fc.property(payrollInputArb, (input) => {
        const result = calculatePayrollBreakdown(input);

        const expectedTotalAllowances = input.allowances.reduce(
          (sum, a) => sum + a,
          0,
        );

        expect(
          result.totalAllowances,
          `totalAllowances should be ${expectedTotalAllowances}`,
        ).toBe(expectedTotalAllowances);

        return result.totalAllowances === expectedTotalAllowances;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: Total deductions equals sum of all deduction items
   * totalDeductions SHALL equal sum of all deduction amounts.
   */
  it("Property 3: totalDeductions should equal sum of all deduction items", () => {
    fc.assert(
      fc.property(payrollInputArb, (input) => {
        const result = calculatePayrollBreakdown(input);

        const expectedTotalDeductions = input.deductions.reduce(
          (sum, d) => sum + d,
          0,
        );

        expect(
          result.totalDeductions,
          `totalDeductions should be ${expectedTotalDeductions}`,
        ).toBe(expectedTotalDeductions);

        return result.totalDeductions === expectedTotalDeductions;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: Gross salary equals base + overtime + allowances
   * grossSalary SHALL equal (baseSalary + totalOvertimePay + totalAllowances).
   */
  it("Property 4: grossSalary should equal baseSalary + totalOvertimePay + totalAllowances", () => {
    fc.assert(
      fc.property(payrollInputArb, (input) => {
        const result = calculatePayrollBreakdown(input);

        const expectedGross =
          input.baseSalary + result.totalOvertimePay + result.totalAllowances;

        expect(
          result.grossSalary,
          `grossSalary should be ${expectedGross}`,
        ).toBe(expectedGross);

        return result.grossSalary === expectedGross;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: Net salary equals gross - deductions
   * netSalary SHALL equal (grossSalary - totalDeductions).
   */
  it("Property 5: netSalary should equal grossSalary - totalDeductions", () => {
    fc.assert(
      fc.property(payrollInputArb, (input) => {
        const result = calculatePayrollBreakdown(input);

        const expectedNet = result.grossSalary - result.totalDeductions;

        expect(result.netSalary, `netSalary should be ${expectedNet}`).toBe(
          expectedNet,
        );

        return result.netSalary === expectedNet;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Breakdown sum invariant holds
   * For any payroll, grossSalary = baseSalary + totalOvertimePay + totalAllowances
   * AND netSalary = grossSalary - totalDeductions.
   */
  it("Property 6: breakdown sum invariant should hold for all payroll records", () => {
    fc.assert(
      fc.property(payrollInputArb, (input) => {
        const result = calculatePayrollBreakdown(input);

        const isValid = verifyPayrollBreakdownSum(result);

        expect(isValid, "Breakdown sum invariant should hold").toBe(true);

        return isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: Net salary can be negative when deductions exceed gross
   * When totalDeductions > grossSalary, netSalary SHALL be negative.
   */
  it("Property 7: netSalary can be negative when deductions exceed gross", () => {
    fc.assert(
      fc.property(highDeductionInputArb, (input) => {
        const result = calculatePayrollBreakdown(input);

        // Nếu deductions > gross thì net phải âm
        if (result.totalDeductions > result.grossSalary) {
          expect(
            result.netSalary,
            "netSalary should be negative when deductions exceed gross",
          ).toBeLessThan(0);
          return result.netSalary < 0;
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: Zero inputs result in zero outputs
   * When all inputs are zero, all outputs SHALL be zero.
   */
  it("Property 8: zero inputs should result in zero outputs", () => {
    const zeroInput: PayrollBreakdownInput = {
      baseSalary: 0,
      regularOvertimePay: 0,
      nightWorkPay: 0,
      nightOvertimePay: 0,
      holidayOvertimePay: 0,
      holidayNightOvertimePay: 0,
      allowances: [],
      deductions: [],
    };

    const result = calculatePayrollBreakdown(zeroInput);

    expect(result.totalOvertimePay).toBe(0);
    expect(result.totalAllowances).toBe(0);
    expect(result.totalDeductions).toBe(0);
    expect(result.grossSalary).toBe(0);
    expect(result.netSalary).toBe(0);
  });

  /**
   * Property 9: Gross salary is always non-negative
   * grossSalary SHALL always be >= 0 (since all components are non-negative).
   */
  it("Property 9: grossSalary should always be non-negative", () => {
    fc.assert(
      fc.property(payrollInputArb, (input) => {
        const result = calculatePayrollBreakdown(input);

        expect(
          result.grossSalary,
          "grossSalary should be non-negative",
        ).toBeGreaterThanOrEqual(0);

        return result.grossSalary >= 0;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 10: Adding allowance increases gross and net by same amount
   * Adding an allowance SHALL increase both grossSalary and netSalary by the allowance amount.
   */
  it("Property 10: adding allowance should increase gross and net by same amount", () => {
    fc.assert(
      fc.property(
        payrollInputArb,
        fc.integer({ min: 1, max: 100_000 }),
        (input, additionalAllowance) => {
          const resultBefore = calculatePayrollBreakdown(input);

          const inputAfter = {
            ...input,
            allowances: [...input.allowances, additionalAllowance],
          };
          const resultAfter = calculatePayrollBreakdown(inputAfter);

          const grossDiff = resultAfter.grossSalary - resultBefore.grossSalary;
          const netDiff = resultAfter.netSalary - resultBefore.netSalary;

          expect(
            grossDiff,
            `Gross should increase by ${additionalAllowance}`,
          ).toBe(additionalAllowance);

          expect(netDiff, `Net should increase by ${additionalAllowance}`).toBe(
            additionalAllowance,
          );

          return (
            grossDiff === additionalAllowance && netDiff === additionalAllowance
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 11: Adding deduction decreases net but not gross
   * Adding a deduction SHALL decrease netSalary but not affect grossSalary.
   */
  it("Property 11: adding deduction should decrease net but not gross", () => {
    fc.assert(
      fc.property(
        payrollInputArb,
        fc.integer({ min: 1, max: 100_000 }),
        (input, additionalDeduction) => {
          const resultBefore = calculatePayrollBreakdown(input);

          const inputAfter = {
            ...input,
            deductions: [...input.deductions, additionalDeduction],
          };
          const resultAfter = calculatePayrollBreakdown(inputAfter);

          const grossDiff = resultAfter.grossSalary - resultBefore.grossSalary;
          const netDiff = resultAfter.netSalary - resultBefore.netSalary;

          expect(grossDiff, "Gross should not change").toBe(0);

          expect(netDiff, `Net should decrease by ${additionalDeduction}`).toBe(
            -additionalDeduction,
          );

          return grossDiff === 0 && netDiff === -additionalDeduction;
        },
      ),
      { numRuns: 100 },
    );
  });
});
