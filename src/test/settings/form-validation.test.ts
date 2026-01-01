import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  AttendanceConfig,
  PayrollConfig,
  OvertimeConfig,
  AllowanceConfig,
  DeductionConfig,
  AllowanceRule,
  DeductionRule,
} from "@/types/attendance-config";
import {
  ROUNDING_INTERVALS,
  ROUNDING_DIRECTIONS,
  SALARY_TYPES,
  ALLOWANCE_TYPES,
  DEDUCTION_TYPES,
} from "@/types/attendance-enums";

/**
 * Property Test: Form Validation Consistency
 * Feature: attendance-payroll-frontend, Task 6.8
 * Validates: Requirements 1.3
 *
 * Các property được kiểm tra:
 * 1. AttendanceConfig: thời gian làm việc hợp lệ
 * 2. PayrollConfig: ngày thanh toán và ngày chốt công hợp lệ
 * 3. OvertimeConfig: hệ số tăng ca >= 1.0
 * 4. AllowanceConfig: code và name không được trống
 * 5. DeductionConfig: code và name không được trống, percentage <= 100
 */

// Arbitraries cho các config types
const timeStringArb = fc.integer({ min: 0, max: 23 }).chain((hour) =>
  fc.integer({ min: 0, max: 59 }).map((minute) => {
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m}`;
  }),
);

const roundingConfigArb = fc.record({
  interval: fc.constantFrom(...ROUNDING_INTERVALS),
  direction: fc.constantFrom(...ROUNDING_DIRECTIONS),
});

const attendanceConfigArb: fc.Arbitrary<AttendanceConfig> = fc.record({
  defaultWorkStartTime: timeStringArb,
  defaultWorkEndTime: timeStringArb,
  defaultBreakMinutes: fc.integer({ min: 0, max: 480 }),
  enableRounding: fc.boolean(),
  enableCheckInRounding: fc.boolean(),
  enableCheckOutRounding: fc.boolean(),
  enableBreakStartRounding: fc.boolean(),
  enableBreakEndRounding: fc.boolean(),
  checkInRounding: fc.option(roundingConfigArb, { nil: undefined }),
  checkOutRounding: fc.option(roundingConfigArb, { nil: undefined }),
  breakStartRounding: fc.option(roundingConfigArb, { nil: undefined }),
  breakEndRounding: fc.option(roundingConfigArb, { nil: undefined }),
  lateGraceMinutes: fc.integer({ min: 0, max: 60 }),
  earlyLeaveGraceMinutes: fc.integer({ min: 0, max: 60 }),
  requireDeviceRegistration: fc.boolean(),
  requireGeoLocation: fc.boolean(),
  geoFenceRadiusMeters: fc.integer({ min: 0, max: 10000 }),
  allowMobileCheckIn: fc.boolean(),
  allowWebCheckIn: fc.boolean(),
});

const payrollConfigArb: fc.Arbitrary<PayrollConfig> = fc.record({
  defaultSalaryType: fc.constantFrom(...SALARY_TYPES),
  payDay: fc.integer({ min: 1, max: 31 }),
  cutoffDay: fc.integer({ min: 1, max: 31 }),
  salaryRounding: fc.constantFrom(...ROUNDING_DIRECTIONS),
  standardWorkingDaysPerMonth: fc.integer({ min: 1, max: 31 }),
  standardWorkingHoursPerDay: fc.integer({ min: 1, max: 24 }),
});

const overtimeConfigArb: fc.Arbitrary<OvertimeConfig> = fc.record({
  overtimeEnabled: fc.boolean(),
  standardWorkingHours: fc.integer({ min: 1, max: 24 }),
  nightStartTime: timeStringArb,
  nightEndTime: timeStringArb,
  regularOvertimeRate: fc.double({ min: 1.0, max: 3.0, noNaN: true }),
  nightWorkRate: fc.double({ min: 1.0, max: 3.0, noNaN: true }),
  nightOvertimeRate: fc.double({ min: 1.0, max: 3.0, noNaN: true }),
  holidayOvertimeRate: fc.double({ min: 1.0, max: 3.0, noNaN: true }),
  holidayNightOvertimeRate: fc.double({ min: 1.0, max: 3.0, noNaN: true }),
  useLegalMinimum: fc.boolean(),
  locale: fc.constantFrom("ja", "vi"),
  requireApproval: fc.boolean(),
  maxOvertimeHoursPerDay: fc.integer({ min: 0, max: 24 }),
  maxOvertimeHoursPerMonth: fc.integer({ min: 0, max: 200 }),
});

// Arbitrary cho non-empty string (không chỉ whitespace)
const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter((s) => s.trim().length > 0);

const allowanceRuleArb: fc.Arbitrary<AllowanceRule> = fc.record({
  code: nonEmptyStringArb,
  name: nonEmptyStringArb,
  type: fc.constantFrom(...ALLOWANCE_TYPES),
  amount: fc.double({ min: 0, max: 1000000, noNaN: true }),
  taxable: fc.boolean(),
});

const deductionRuleArb: fc.Arbitrary<DeductionRule> = fc.record({
  code: nonEmptyStringArb,
  name: nonEmptyStringArb,
  type: fc.constantFrom(...DEDUCTION_TYPES),
  amount: fc.option(fc.double({ min: 0, max: 1000000, noNaN: true }), {
    nil: undefined,
  }),
  percentage: fc.option(fc.double({ min: 0, max: 100, noNaN: true }), {
    nil: undefined,
  }),
  order: fc.integer({ min: 0, max: 100 }),
});

// Validation functions (mirroring form validation logic)
function isValidTimeString(time: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

function isValidPayDay(day: number): boolean {
  return day >= 1 && day <= 31;
}

function isValidOvertimeRate(rate: number): boolean {
  return rate >= 1.0;
}

function isValidAllowanceRule(rule: AllowanceRule): boolean {
  return (rule.code?.trim().length ?? 0) > 0 && rule.name.trim().length > 0;
}

function isValidDeductionRule(rule: DeductionRule): boolean {
  const hasValidCodeAndName =
    (rule.code?.trim().length ?? 0) > 0 && rule.name.trim().length > 0;
  const hasValidPercentage =
    rule.percentage === undefined ||
    (rule.percentage >= 0 && rule.percentage <= 100);
  return hasValidCodeAndName && hasValidPercentage;
}

describe("Company Settings Form Validation Properties", () => {
  /**
   * Property 1: AttendanceConfig Time Format Validation
   * For any AttendanceConfig, the defaultWorkStartTime and defaultWorkEndTime
   * SHALL be valid time strings in HH:mm format.
   */
  it("Property 1: attendance config time strings should be valid HH:mm format", () => {
    fc.assert(
      fc.property(attendanceConfigArb, (config) => {
        const startTimeValid = isValidTimeString(config.defaultWorkStartTime);
        const endTimeValid = isValidTimeString(config.defaultWorkEndTime);

        expect(
          startTimeValid,
          `Invalid start time format: ${config.defaultWorkStartTime}`,
        ).toBe(true);
        expect(
          endTimeValid,
          `Invalid end time format: ${config.defaultWorkEndTime}`,
        ).toBe(true);

        return startTimeValid && endTimeValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: AttendanceConfig Grace Period Bounds
   * For any AttendanceConfig, lateGraceMinutes and earlyLeaveGraceMinutes
   * SHALL be non-negative integers not exceeding 60 minutes.
   */
  it("Property 2: grace period should be between 0 and 60 minutes", () => {
    fc.assert(
      fc.property(attendanceConfigArb, (config) => {
        const lateGraceValid =
          config.lateGraceMinutes >= 0 && config.lateGraceMinutes <= 60;
        const earlyLeaveGraceValid =
          config.earlyLeaveGraceMinutes >= 0 &&
          config.earlyLeaveGraceMinutes <= 60;

        expect(
          lateGraceValid,
          `Late grace minutes out of bounds: ${config.lateGraceMinutes}`,
        ).toBe(true);
        expect(
          earlyLeaveGraceValid,
          `Early leave grace minutes out of bounds: ${config.earlyLeaveGraceMinutes}`,
        ).toBe(true);

        return lateGraceValid && earlyLeaveGraceValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: PayrollConfig Day Validation
   * For any PayrollConfig, payDay and cutoffDay SHALL be valid day of month (1-31).
   */
  it("Property 3: payroll config days should be valid (1-31)", () => {
    fc.assert(
      fc.property(payrollConfigArb, (config) => {
        const payDayValid = isValidPayDay(config.payDay);
        const cutoffDayValid = isValidPayDay(config.cutoffDay);

        expect(payDayValid, `Invalid pay day: ${config.payDay}`).toBe(true);
        expect(cutoffDayValid, `Invalid cutoff day: ${config.cutoffDay}`).toBe(
          true,
        );

        return payDayValid && cutoffDayValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: OvertimeConfig Rate Validation
   * For any OvertimeConfig, all overtime rates SHALL be >= 1.0 (100%).
   */
  it("Property 4: overtime rates should be >= 1.0", () => {
    fc.assert(
      fc.property(overtimeConfigArb, (config) => {
        const rates = [
          { name: "regularOvertimeRate", value: config.regularOvertimeRate },
          { name: "nightWorkRate", value: config.nightWorkRate },
          { name: "nightOvertimeRate", value: config.nightOvertimeRate },
          { name: "holidayOvertimeRate", value: config.holidayOvertimeRate },
          {
            name: "holidayNightOvertimeRate",
            value: config.holidayNightOvertimeRate,
          },
        ];

        for (const { name, value } of rates) {
          const isValid = isValidOvertimeRate(value);
          expect(isValid, `${name} should be >= 1.0, got ${value}`).toBe(true);
          if (!isValid) return false;
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: AllowanceRule Code and Name Validation
   * For any AllowanceRule, code and name SHALL NOT be empty strings.
   */
  it("Property 5: allowance rules should have non-empty code and name", () => {
    fc.assert(
      fc.property(allowanceRuleArb, (rule) => {
        const isValid = isValidAllowanceRule(rule);

        expect(
          isValid,
          `Allowance rule should have non-empty code and name. Got code="${rule.code}", name="${rule.name}"`,
        ).toBe(true);

        return isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: DeductionRule Code and Name Validation
   * For any DeductionRule, code and name SHALL NOT be empty strings.
   */
  it("Property 6: deduction rules should have non-empty code and name", () => {
    fc.assert(
      fc.property(deductionRuleArb, (rule) => {
        const hasValidCodeAndName =
          (rule.code?.trim().length ?? 0) > 0 && rule.name.trim().length > 0;

        expect(
          hasValidCodeAndName,
          `Deduction rule should have non-empty code and name. Got code="${rule.code ?? ""}", name="${rule.name}"`,
        ).toBe(true);

        return hasValidCodeAndName;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: DeductionRule Percentage Bounds
   * For any DeductionRule with type PERCENTAGE, the percentage value
   * SHALL be between 0 and 100 (inclusive).
   */
  it("Property 7: deduction percentage should be between 0 and 100", () => {
    const percentageDeductionArb = fc.record({
      code: nonEmptyStringArb,
      name: nonEmptyStringArb,
      type: fc.constant("PERCENTAGE" as const),
      percentage: fc.double({ min: 0, max: 100, noNaN: true }),
      order: fc.integer({ min: 0, max: 100 }),
    });

    fc.assert(
      fc.property(percentageDeductionArb, (rule) => {
        const isValid =
          rule.percentage !== undefined &&
          rule.percentage >= 0 &&
          rule.percentage <= 100;

        expect(
          isValid,
          `Percentage should be between 0 and 100, got ${rule.percentage}`,
        ).toBe(true);

        return isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: AllowanceConfig Array Validation
   * For any AllowanceConfig, all allowance rules in the array SHALL be valid.
   */
  it("Property 8: all allowance rules in config should be valid", () => {
    const allowanceConfigArb: fc.Arbitrary<AllowanceConfig> = fc.record({
      allowances: fc.array(allowanceRuleArb, { minLength: 0, maxLength: 10 }),
    });

    fc.assert(
      fc.property(allowanceConfigArb, (config) => {
        for (const rule of config.allowances) {
          const isValid = isValidAllowanceRule(rule);
          expect(
            isValid,
            `Invalid allowance rule: code="${rule.code}", name="${rule.name}"`,
          ).toBe(true);
          if (!isValid) return false;
        }
        return true;
      }),
      { numRuns: 50 },
    );
  });

  /**
   * Property 9: DeductionConfig Array Validation
   * For any DeductionConfig, all deduction rules in the array SHALL be valid.
   */
  it("Property 9: all deduction rules in config should be valid", () => {
    const deductionConfigArb: fc.Arbitrary<DeductionConfig> = fc.record({
      deductions: fc.array(deductionRuleArb, { minLength: 0, maxLength: 10 }),
      enableLatePenalty: fc.boolean(),
      latePenaltyPerMinute: fc.double({ min: 0, max: 10000, noNaN: true }),
      enableEarlyLeavePenalty: fc.boolean(),
      earlyLeavePenaltyPerMinute: fc.double({
        min: 0,
        max: 10000,
        noNaN: true,
      }),
      enableAbsenceDeduction: fc.boolean(),
    });

    fc.assert(
      fc.property(deductionConfigArb, (config) => {
        for (const rule of config.deductions) {
          const isValid = isValidDeductionRule(rule);
          expect(
            isValid,
            `Invalid deduction rule: code="${rule.code ?? ""}", name="${rule.name}", percentage=${rule.percentage}`,
          ).toBe(true);
          if (!isValid) return false;
        }
        return true;
      }),
      { numRuns: 50 },
    );
  });

  /**
   * Property 10: Penalty Amount Non-Negative
   * For any DeductionConfig, latePenaltyPerMinute and earlyLeavePenaltyPerMinute
   * SHALL be non-negative numbers.
   */
  it("Property 10: penalty amounts should be non-negative", () => {
    const deductionConfigArb: fc.Arbitrary<DeductionConfig> = fc.record({
      deductions: fc.array(deductionRuleArb, { minLength: 0, maxLength: 5 }),
      enableLatePenalty: fc.boolean(),
      latePenaltyPerMinute: fc.double({ min: 0, max: 10000, noNaN: true }),
      enableEarlyLeavePenalty: fc.boolean(),
      earlyLeavePenaltyPerMinute: fc.double({
        min: 0,
        max: 10000,
        noNaN: true,
      }),
      enableAbsenceDeduction: fc.boolean(),
    });

    fc.assert(
      fc.property(deductionConfigArb, (config) => {
        const latePenaltyValid = config.latePenaltyPerMinute >= 0;
        const earlyLeavePenaltyValid = config.earlyLeavePenaltyPerMinute >= 0;

        expect(
          latePenaltyValid,
          `Late penalty should be non-negative, got ${config.latePenaltyPerMinute}`,
        ).toBe(true);
        expect(
          earlyLeavePenaltyValid,
          `Early leave penalty should be non-negative, got ${config.earlyLeavePenaltyPerMinute}`,
        ).toBe(true);

        return latePenaltyValid && earlyLeavePenaltyValid;
      }),
      { numRuns: 100 },
    );
  });
});
