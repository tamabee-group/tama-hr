import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  checkSettingsCompleteness,
  hasIncompleteSettings,
  getIncompleteTabTypes,
  IncompleteSettingType,
} from "@/lib/utils/settings-completeness";
import {
  WorkMode,
  WorkModeConfig,
  CompanySettings,
  AttendanceConfig,
  PayrollConfig,
  OvertimeConfig,
  BreakConfig,
  AllowanceConfig,
  DeductionConfig,
} from "@/types/attendance-config";

/**
 * Property-Based Tests cho Settings Completeness
 * Feature: work-schedule-redesign
 * Property 8: Incomplete Settings Highlighting
 */

// Arbitrary cho WorkMode
const workModeArbitrary = fc.constantFrom<WorkMode>(
  WorkMode.FIXED_HOURS,
  WorkMode.FLEXIBLE_SHIFT,
);

// Arbitrary cho time string (HH:mm format)
const timeStringArbitrary = fc.integer({ min: 0, max: 23 }).chain((hour) =>
  fc.integer({ min: 0, max: 59 }).map((minute) => {
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m}`;
  }),
);

// Arbitrary cho WorkModeConfig
const workModeConfigArbitrary = fc.record({
  mode: workModeArbitrary,
  defaultWorkStartTime: fc.oneof(timeStringArbitrary, fc.constant(null)),
  defaultWorkEndTime: fc.oneof(timeStringArbitrary, fc.constant(null)),
  defaultBreakMinutes: fc.oneof(
    fc.integer({ min: 0, max: 120 }),
    fc.constant(null),
  ),
});

// Arbitrary cho AttendanceConfig
const attendanceConfigArbitrary: fc.Arbitrary<AttendanceConfig> = fc.record({
  defaultWorkStartTime: fc.oneof(timeStringArbitrary, fc.constant("")),
  defaultWorkEndTime: fc.oneof(timeStringArbitrary, fc.constant("")),
  defaultBreakMinutes: fc.integer({ min: 0, max: 120 }),
  enableRounding: fc.boolean(),
  enableCheckInRounding: fc.boolean(),
  enableCheckOutRounding: fc.boolean(),
  enableBreakStartRounding: fc.boolean(),
  enableBreakEndRounding: fc.boolean(),
  lateGraceMinutes: fc.integer({ min: 0, max: 60 }),
  earlyLeaveGraceMinutes: fc.integer({ min: 0, max: 60 }),
  requireDeviceRegistration: fc.boolean(),
  requireGeoLocation: fc.boolean(),
  geoFenceRadiusMeters: fc.integer({ min: 0, max: 1000 }),
  allowMobileCheckIn: fc.boolean(),
  allowWebCheckIn: fc.boolean(),
});

// Arbitrary cho PayrollConfig
const payrollConfigArbitrary: fc.Arbitrary<PayrollConfig> = fc.record({
  defaultSalaryType: fc.constantFrom("MONTHLY", "HOURLY", "DAILY"),
  payDay: fc.integer({ min: 0, max: 35 }), // Include invalid values
  cutoffDay: fc.integer({ min: 0, max: 35 }), // Include invalid values
  salaryRounding: fc.constantFrom("UP", "DOWN", "NEAREST"),
  standardWorkingDaysPerMonth: fc.integer({ min: 1, max: 31 }),
  standardWorkingHoursPerDay: fc.integer({ min: 1, max: 24 }),
});

// Arbitrary cho OvertimeConfig
const overtimeConfigArbitrary: fc.Arbitrary<OvertimeConfig> = fc.record({
  overtimeEnabled: fc.boolean(),
  standardWorkingHours: fc.integer({ min: 1, max: 12 }),
  nightStartTime: timeStringArbitrary,
  nightEndTime: timeStringArbitrary,
  regularOvertimeRate: fc.float({ min: 1, max: 2 }),
  nightWorkRate: fc.float({ min: 1, max: 2 }),
  nightOvertimeRate: fc.float({ min: 1, max: 2 }),
  holidayOvertimeRate: fc.float({ min: 1, max: 2 }),
  holidayNightOvertimeRate: fc.float({ min: 1, max: 2 }),
  useLegalMinimum: fc.boolean(),
  locale: fc.constantFrom("ja", "vi"),
  requireApproval: fc.boolean(),
  maxOvertimeHoursPerDay: fc.integer({ min: 0, max: 8 }),
  maxOvertimeHoursPerMonth: fc.integer({ min: 0, max: 100 }),
});

// Arbitrary cho BreakConfig
const breakConfigArbitrary: fc.Arbitrary<BreakConfig> = fc.record({
  breakEnabled: fc.boolean(),
  breakType: fc.constantFrom("PAID", "UNPAID"),
  defaultBreakMinutes: fc.integer({ min: 0, max: 120 }),
  minimumBreakMinutes: fc.integer({ min: 0, max: 60 }),
  maximumBreakMinutes: fc.integer({ min: 60, max: 180 }),
  useLegalMinimum: fc.boolean(),
  breakTrackingEnabled: fc.boolean(),
  locale: fc.constantFrom("ja", "vi"),
  fixedBreakMode: fc.boolean(),
  breakPeriodsPerAttendance: fc.integer({ min: 1, max: 3 }),
  fixedBreakPeriods: fc.constant([]),
  maxBreaksPerDay: fc.integer({ min: 1, max: 5 }),
  nightShiftStartTime: timeStringArbitrary,
  nightShiftEndTime: timeStringArbitrary,
  nightShiftMinimumBreakMinutes: fc.integer({ min: 0, max: 60 }),
  nightShiftDefaultBreakMinutes: fc.integer({ min: 0, max: 120 }),
});

// Arbitrary cho AllowanceConfig
const allowanceConfigArbitrary: fc.Arbitrary<AllowanceConfig> = fc.record({
  allowances: fc.constant([]),
});

// Arbitrary cho DeductionConfig
const deductionConfigArbitrary: fc.Arbitrary<DeductionConfig> = fc.record({
  deductions: fc.constant([]),
  enableLatePenalty: fc.boolean(),
  latePenaltyPerMinute: fc.integer({ min: 0, max: 1000 }),
  enableEarlyLeavePenalty: fc.boolean(),
  earlyLeavePenaltyPerMinute: fc.integer({ min: 0, max: 1000 }),
  enableAbsenceDeduction: fc.boolean(),
});

// Arbitrary cho CompanySettings
const companySettingsArbitrary: fc.Arbitrary<CompanySettings> = fc.record({
  workModeConfig: workModeConfigArbitrary as fc.Arbitrary<WorkModeConfig>,
  attendanceConfig: attendanceConfigArbitrary,
  payrollConfig: payrollConfigArbitrary,
  overtimeConfig: overtimeConfigArbitrary,
  breakConfig: breakConfigArbitrary,
  allowanceConfig: allowanceConfigArbitrary,
  deductionConfig: deductionConfigArbitrary,
});

describe("Settings Completeness - Property Tests", () => {
  /**
   * Property 8: Incomplete Settings Highlighting
   * For any settings state with missing required fields, those fields should be
   * marked as incomplete/highlighted in the UI.
   */
  describe("Property 8: Incomplete Settings Highlighting", () => {
    it("null settings phải trả về incomplete với nhiều issues", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            workModeConfigArbitrary as fc.Arbitrary<WorkModeConfig>,
            fc.constant(null),
          ),
          (workModeConfig) => {
            const result = checkSettingsCompleteness(null, workModeConfig);

            // Khi settings là null, phải có nhiều issues
            expect(result.incompleteSettings.length).toBeGreaterThan(0);
            expect(result.isComplete).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("completionPercentage phải trong khoảng 0-100", () => {
      fc.assert(
        fc.property(
          fc.oneof(companySettingsArbitrary, fc.constant(null)),
          fc.oneof(
            workModeConfigArbitrary as fc.Arbitrary<WorkModeConfig>,
            fc.constant(null),
          ),
          (settings, workModeConfig) => {
            const result = checkSettingsCompleteness(settings, workModeConfig);

            expect(result.completionPercentage).toBeGreaterThanOrEqual(0);
            expect(result.completionPercentage).toBeLessThanOrEqual(100);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("isComplete phải true khi không có incompleteSettings", () => {
      fc.assert(
        fc.property(
          fc.oneof(companySettingsArbitrary, fc.constant(null)),
          fc.oneof(
            workModeConfigArbitrary as fc.Arbitrary<WorkModeConfig>,
            fc.constant(null),
          ),
          (settings, workModeConfig) => {
            const result = checkSettingsCompleteness(settings, workModeConfig);

            if (result.incompleteSettings.length === 0) {
              expect(result.isComplete).toBe(true);
            } else {
              expect(result.isComplete).toBe(false);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("hasIncompleteSettings phải consistent với incompleteSettings", () => {
      fc.assert(
        fc.property(
          fc.oneof(companySettingsArbitrary, fc.constant(null)),
          fc.oneof(
            workModeConfigArbitrary as fc.Arbitrary<WorkModeConfig>,
            fc.constant(null),
          ),
          fc.constantFrom<IncompleteSettingType>(
            "workMode",
            "attendance",
            "payroll",
            "overtime",
            "break",
          ),
          (settings, workModeConfig, tabType) => {
            const result = checkSettingsCompleteness(settings, workModeConfig);
            const hasIssues = hasIncompleteSettings(tabType, result);

            // hasIncompleteSettings phải true nếu có issue với type đó
            const issuesForType = result.incompleteSettings.filter(
              (s) => s.type === tabType,
            );

            expect(hasIssues).toBe(issuesForType.length > 0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("getIncompleteTabTypes phải trả về unique types", () => {
      fc.assert(
        fc.property(
          fc.oneof(companySettingsArbitrary, fc.constant(null)),
          fc.oneof(
            workModeConfigArbitrary as fc.Arbitrary<WorkModeConfig>,
            fc.constant(null),
          ),
          (settings, workModeConfig) => {
            const result = checkSettingsCompleteness(settings, workModeConfig);
            const types = getIncompleteTabTypes(result);

            // Không có duplicate
            const uniqueTypes = new Set(types);
            expect(types.length).toBe(uniqueTypes.size);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("FIXED_HOURS mode với missing default hours phải có warning", () => {
      fc.assert(
        fc.property(companySettingsArbitrary, (settings) => {
          const workModeConfig: WorkModeConfig = {
            mode: WorkMode.FIXED_HOURS,
            defaultWorkStartTime: null,
            defaultWorkEndTime: null,
            defaultBreakMinutes: null,
          };

          const result = checkSettingsCompleteness(settings, workModeConfig);

          // Phải có warning cho missing default hours
          const workModeIssues = result.incompleteSettings.filter(
            (s) => s.type === "workMode",
          );
          expect(workModeIssues.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it("FLEXIBLE_SHIFT mode không cần default hours", () => {
      fc.assert(
        fc.property(companySettingsArbitrary, (settings) => {
          const workModeConfig: WorkModeConfig = {
            mode: WorkMode.FLEXIBLE_SHIFT,
            defaultWorkStartTime: null,
            defaultWorkEndTime: null,
            defaultBreakMinutes: null,
          };

          const result = checkSettingsCompleteness(settings, workModeConfig);

          // Không có warning cho missing default hours trong FLEXIBLE_SHIFT mode
          const workModeIssues = result.incompleteSettings.filter(
            (s) =>
              s.type === "workMode" &&
              (s.fieldKey === "defaultWorkStartTime" ||
                s.fieldKey === "defaultWorkEndTime"),
          );
          expect(workModeIssues.length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });

    it("checkSettingsCompleteness phải idempotent", () => {
      fc.assert(
        fc.property(
          fc.oneof(companySettingsArbitrary, fc.constant(null)),
          fc.oneof(
            workModeConfigArbitrary as fc.Arbitrary<WorkModeConfig>,
            fc.constant(null),
          ),
          (settings, workModeConfig) => {
            const result1 = checkSettingsCompleteness(settings, workModeConfig);
            const result2 = checkSettingsCompleteness(settings, workModeConfig);

            expect(result1.isComplete).toBe(result2.isComplete);
            expect(result1.completionPercentage).toBe(
              result2.completionPercentage,
            );
            expect(result1.incompleteSettings.length).toBe(
              result2.incompleteSettings.length,
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it("invalid payDay/cutoffDay phải có warning", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 32, max: 100 }), // Invalid day
          (invalidDay) => {
            const settings: CompanySettings = {
              workModeConfig: {
                mode: WorkMode.FLEXIBLE_SHIFT,
                defaultWorkStartTime: "09:00",
                defaultWorkEndTime: "18:00",
                defaultBreakMinutes: 60,
              },
              attendanceConfig: {
                defaultWorkStartTime: "09:00",
                defaultWorkEndTime: "18:00",
                defaultBreakMinutes: 60,
                enableRounding: false,
                enableCheckInRounding: false,
                enableCheckOutRounding: false,
                enableBreakStartRounding: false,
                enableBreakEndRounding: false,
                lateGraceMinutes: 0,
                earlyLeaveGraceMinutes: 0,
                requireDeviceRegistration: false,
                requireGeoLocation: false,
                geoFenceRadiusMeters: 0,
                allowMobileCheckIn: true,
                allowWebCheckIn: true,
              },
              payrollConfig: {
                defaultSalaryType: "MONTHLY",
                payDay: invalidDay, // Invalid
                cutoffDay: 25,
                salaryRounding: "NEAREST",
                standardWorkingDaysPerMonth: 22,
                standardWorkingHoursPerDay: 8,
              },
              overtimeConfig: {
                overtimeEnabled: true,
                standardWorkingHours: 8,
                nightStartTime: "22:00",
                nightEndTime: "05:00",
                regularOvertimeRate: 1.25,
                nightWorkRate: 1.25,
                nightOvertimeRate: 1.5,
                holidayOvertimeRate: 1.35,
                holidayNightOvertimeRate: 1.6,
                useLegalMinimum: true,
                locale: "ja",
                requireApproval: false,
                maxOvertimeHoursPerDay: 4,
                maxOvertimeHoursPerMonth: 45,
              },
              breakConfig: {
                breakEnabled: true,
                breakType: "UNPAID",
                defaultBreakMinutes: 60,
                minimumBreakMinutes: 45,
                maximumBreakMinutes: 90,
                useLegalMinimum: true,
                breakTrackingEnabled: true,
                locale: "ja",
                fixedBreakMode: false,
                breakPeriodsPerAttendance: 1,
                fixedBreakPeriods: [],
                maxBreaksPerDay: 3,
                nightShiftStartTime: "22:00",
                nightShiftEndTime: "05:00",
                nightShiftMinimumBreakMinutes: 60,
                nightShiftDefaultBreakMinutes: 60,
              },
              allowanceConfig: { allowances: [] },
              deductionConfig: {
                deductions: [],
                enableLatePenalty: false,
                latePenaltyPerMinute: 0,
                enableEarlyLeavePenalty: false,
                earlyLeavePenaltyPerMinute: 0,
                enableAbsenceDeduction: false,
              },
            };

            const result = checkSettingsCompleteness(
              settings,
              settings.workModeConfig,
            );

            // Phải có warning cho invalid payDay
            const payrollIssues = result.incompleteSettings.filter(
              (s) => s.type === "payroll" && s.fieldKey === "payDay",
            );
            expect(payrollIssues.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
