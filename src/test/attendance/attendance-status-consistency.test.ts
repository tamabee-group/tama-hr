import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  parseTimeToMinutes,
  calculateAttendanceStatus,
  isAttendanceStatusConsistent,
  type AttendanceStatusInput,
} from "@/lib/utils/attendance-status";

/**
 * Property Test: Attendance Status Consistency
 * Feature: attendance-payroll-frontend, Task 9.8
 *
 * Property 5: Attendance Status Consistency
 * For any attendance record displayed, the status (late, early departure)
 * SHALL be consistent with the check-in/check-out times and the configured grace periods.
 */

// ============================================
// Arbitraries
// ============================================

// Arbitrary cho time string hợp lệ (HH:mm format)
const validTimeArb = fc.integer({ min: 0, max: 23 }).chain((hour) =>
  fc.integer({ min: 0, max: 59 }).map((minute) => {
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m}`;
  }),
);

// Arbitrary cho grace period (0-60 phút)
const graceMinutesArb = fc.integer({ min: 0, max: 60 });

// Arbitrary cho AttendanceStatusInput với check-in/out times
const attendanceInputArb = fc.record({
  checkInTime: fc.option(validTimeArb, { nil: undefined }),
  checkOutTime: fc.option(validTimeArb, { nil: undefined }),
  scheduledStartTime: validTimeArb,
  scheduledEndTime: validTimeArb,
  lateGraceMinutes: graceMinutesArb,
  earlyLeaveGraceMinutes: graceMinutesArb,
});

// Arbitrary cho input với check-in time sau scheduled start (late scenario)
const lateCheckInArb = fc
  .integer({ min: 0, max: 22 }) // scheduledStartHour: 0-22
  .chain((startHour) =>
    fc.integer({ min: 0, max: 59 }).chain((startMin) =>
      fc
        .integer({ min: 1, max: 120 }) // lateMinutes: 1-120
        .chain((lateMinutes) =>
          fc.integer({ min: 0, max: 60 }).map((graceMinutes) => {
            const scheduledStartMinutes = startHour * 60 + startMin;
            const checkInMinutes = scheduledStartMinutes + lateMinutes;

            // Đảm bảo check-in time hợp lệ (< 24:00)
            if (checkInMinutes >= 24 * 60) {
              return null;
            }

            const checkInHour = Math.floor(checkInMinutes / 60);
            const checkInMin = checkInMinutes % 60;

            return {
              checkInTime: `${checkInHour.toString().padStart(2, "0")}:${checkInMin.toString().padStart(2, "0")}`,
              scheduledStartTime: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
              scheduledEndTime: "18:00",
              lateGraceMinutes: graceMinutes,
              earlyLeaveGraceMinutes: 0,
              expectedLateMinutes: lateMinutes,
              expectedIsLate: lateMinutes > graceMinutes,
            };
          }),
        ),
    ),
  )
  .filter((x): x is NonNullable<typeof x> => x !== null);

// Arbitrary cho input với check-out time trước scheduled end (early leave scenario)
const earlyLeaveArb = fc
  .integer({ min: 1, max: 23 }) // scheduledEndHour: 1-23
  .chain((endHour) =>
    fc.integer({ min: 0, max: 59 }).chain((endMin) =>
      fc
        .integer({ min: 1, max: 120 }) // earlyMinutes: 1-120
        .chain((earlyMinutes) =>
          fc.integer({ min: 0, max: 60 }).map((graceMinutes) => {
            const scheduledEndMinutes = endHour * 60 + endMin;
            const checkOutMinutes = scheduledEndMinutes - earlyMinutes;

            // Đảm bảo check-out time hợp lệ (>= 0)
            if (checkOutMinutes < 0) {
              return null;
            }

            const checkOutHour = Math.floor(checkOutMinutes / 60);
            const checkOutMin = checkOutMinutes % 60;

            return {
              checkOutTime: `${checkOutHour.toString().padStart(2, "0")}:${checkOutMin.toString().padStart(2, "0")}`,
              scheduledStartTime: "09:00",
              scheduledEndTime: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
              lateGraceMinutes: 0,
              earlyLeaveGraceMinutes: graceMinutes,
              expectedEarlyLeaveMinutes: earlyMinutes,
              expectedIsEarlyLeave: earlyMinutes > graceMinutes,
            };
          }),
        ),
    ),
  )
  .filter((x): x is NonNullable<typeof x> => x !== null);

// ============================================
// Tests
// ============================================

describe("Attendance Status Consistency Properties", () => {
  /**
   * Property 1: parseTimeToMinutes returns correct value for valid times
   */
  it("Property 1: parseTimeToMinutes should return correct minutes for valid HH:mm format", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 59 }),
        (hour, minute) => {
          const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          const result = parseTimeToMinutes(timeStr);
          const expected = hour * 60 + minute;

          expect(
            result,
            `parseTimeToMinutes("${timeStr}") should be ${expected}`,
          ).toBe(expected);
          return result === expected;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: Late minutes calculation is correct
   * For any check-in time after scheduled start, lateMinutes SHALL equal the difference.
   */
  it("Property 2: late minutes should equal difference between check-in and scheduled start", () => {
    fc.assert(
      fc.property(lateCheckInArb, (input) => {
        const result = calculateAttendanceStatus({
          checkInTime: input.checkInTime,
          scheduledStartTime: input.scheduledStartTime,
          scheduledEndTime: input.scheduledEndTime,
          lateGraceMinutes: input.lateGraceMinutes,
          earlyLeaveGraceMinutes: input.earlyLeaveGraceMinutes,
        });

        expect(
          result.lateMinutes,
          `Late minutes should be ${input.expectedLateMinutes}`,
        ).toBe(input.expectedLateMinutes);

        expect(
          result.isLate,
          `isLate should be ${input.expectedIsLate} (late: ${input.expectedLateMinutes}m, grace: ${input.lateGraceMinutes}m)`,
        ).toBe(input.expectedIsLate);

        return (
          result.lateMinutes === input.expectedLateMinutes &&
          result.isLate === input.expectedIsLate
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: Early leave minutes calculation is correct
   * For any check-out time before scheduled end, earlyLeaveMinutes SHALL equal the difference.
   */
  it("Property 3: early leave minutes should equal difference between scheduled end and check-out", () => {
    fc.assert(
      fc.property(earlyLeaveArb, (input) => {
        const result = calculateAttendanceStatus({
          checkOutTime: input.checkOutTime,
          scheduledStartTime: input.scheduledStartTime,
          scheduledEndTime: input.scheduledEndTime,
          lateGraceMinutes: input.lateGraceMinutes,
          earlyLeaveGraceMinutes: input.earlyLeaveGraceMinutes,
        });

        expect(
          result.earlyLeaveMinutes,
          `Early leave minutes should be ${input.expectedEarlyLeaveMinutes}`,
        ).toBe(input.expectedEarlyLeaveMinutes);

        expect(
          result.isEarlyLeave,
          `isEarlyLeave should be ${input.expectedIsEarlyLeave} (early: ${input.expectedEarlyLeaveMinutes}m, grace: ${input.earlyLeaveGraceMinutes}m)`,
        ).toBe(input.expectedIsEarlyLeave);

        return (
          result.earlyLeaveMinutes === input.expectedEarlyLeaveMinutes &&
          result.isEarlyLeave === input.expectedIsEarlyLeave
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: Grace period correctly determines isLate flag
   * isLate SHALL be true if and only if lateMinutes > lateGraceMinutes.
   */
  it("Property 4: isLate should be true iff lateMinutes > lateGraceMinutes", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 120 }), // lateMinutes
        fc.integer({ min: 0, max: 60 }), // graceMinutes
        (lateMinutes, graceMinutes) => {
          // Tạo input với late minutes cụ thể
          const scheduledStart = 9 * 60; // 09:00
          const checkInMinutes = scheduledStart + lateMinutes;

          if (checkInMinutes >= 24 * 60) return true; // Skip invalid times

          const checkInHour = Math.floor(checkInMinutes / 60);
          const checkInMin = checkInMinutes % 60;

          const result = calculateAttendanceStatus({
            checkInTime: `${checkInHour.toString().padStart(2, "0")}:${checkInMin.toString().padStart(2, "0")}`,
            scheduledStartTime: "09:00",
            scheduledEndTime: "18:00",
            lateGraceMinutes: graceMinutes,
            earlyLeaveGraceMinutes: 0,
          });

          const expectedIsLate = lateMinutes > graceMinutes;

          expect(
            result.isLate,
            `isLate should be ${expectedIsLate} when late=${lateMinutes}m, grace=${graceMinutes}m`,
          ).toBe(expectedIsLate);

          return result.isLate === expectedIsLate;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: Grace period correctly determines isEarlyLeave flag
   * isEarlyLeave SHALL be true if and only if earlyLeaveMinutes > earlyLeaveGraceMinutes.
   */
  it("Property 5: isEarlyLeave should be true iff earlyLeaveMinutes > earlyLeaveGraceMinutes", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 120 }), // earlyMinutes
        fc.integer({ min: 0, max: 60 }), // graceMinutes
        (earlyMinutes, graceMinutes) => {
          // Tạo input với early leave minutes cụ thể
          const scheduledEnd = 18 * 60; // 18:00
          const checkOutMinutes = scheduledEnd - earlyMinutes;

          if (checkOutMinutes < 0) return true; // Skip invalid times

          const checkOutHour = Math.floor(checkOutMinutes / 60);
          const checkOutMin = checkOutMinutes % 60;

          const result = calculateAttendanceStatus({
            checkOutTime: `${checkOutHour.toString().padStart(2, "0")}:${checkOutMin.toString().padStart(2, "0")}`,
            scheduledStartTime: "09:00",
            scheduledEndTime: "18:00",
            lateGraceMinutes: 0,
            earlyLeaveGraceMinutes: graceMinutes,
          });

          const expectedIsEarlyLeave = earlyMinutes > graceMinutes;

          expect(
            result.isEarlyLeave,
            `isEarlyLeave should be ${expectedIsEarlyLeave} when early=${earlyMinutes}m, grace=${graceMinutes}m`,
          ).toBe(expectedIsEarlyLeave);

          return result.isEarlyLeave === expectedIsEarlyLeave;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: On-time check-in results in zero late minutes
   * For any check-in time at or before scheduled start, lateMinutes SHALL be 0.
   */
  it("Property 6: on-time or early check-in should have zero late minutes", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 23 }), // scheduledStartHour (1-23 to allow early check-in)
        fc.integer({ min: 0, max: 59 }),
        fc.integer({ min: 0, max: 60 }), // earlyMinutes (0-60)
        (startHour, startMin, earlyMinutes) => {
          const scheduledStartMinutes = startHour * 60 + startMin;
          const checkInMinutes = Math.max(
            0,
            scheduledStartMinutes - earlyMinutes,
          );

          const checkInHour = Math.floor(checkInMinutes / 60);
          const checkInMin = checkInMinutes % 60;

          const result = calculateAttendanceStatus({
            checkInTime: `${checkInHour.toString().padStart(2, "0")}:${checkInMin.toString().padStart(2, "0")}`,
            scheduledStartTime: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
            scheduledEndTime: "18:00",
            lateGraceMinutes: 0,
            earlyLeaveGraceMinutes: 0,
          });

          expect(
            result.lateMinutes,
            `On-time/early check-in should have 0 late minutes`,
          ).toBe(0);

          expect(
            result.isLate,
            `On-time/early check-in should not be late`,
          ).toBe(false);

          return result.lateMinutes === 0 && result.isLate === false;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: On-time check-out results in zero early leave minutes
   * For any check-out time at or after scheduled end, earlyLeaveMinutes SHALL be 0.
   */
  it("Property 7: on-time or late check-out should have zero early leave minutes", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 22 }), // scheduledEndHour (0-22 to allow late check-out)
        fc.integer({ min: 0, max: 59 }),
        fc.integer({ min: 0, max: 60 }), // overtimeMinutes (0-60)
        (endHour, endMin, overtimeMinutes) => {
          const scheduledEndMinutes = endHour * 60 + endMin;
          const checkOutMinutes = Math.min(
            23 * 60 + 59,
            scheduledEndMinutes + overtimeMinutes,
          );

          const checkOutHour = Math.floor(checkOutMinutes / 60);
          const checkOutMin = checkOutMinutes % 60;

          const result = calculateAttendanceStatus({
            checkOutTime: `${checkOutHour.toString().padStart(2, "0")}:${checkOutMin.toString().padStart(2, "0")}`,
            scheduledStartTime: "09:00",
            scheduledEndTime: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
            lateGraceMinutes: 0,
            earlyLeaveGraceMinutes: 0,
          });

          expect(
            result.earlyLeaveMinutes,
            `On-time/late check-out should have 0 early leave minutes`,
          ).toBe(0);

          expect(
            result.isEarlyLeave,
            `On-time/late check-out should not be early leave`,
          ).toBe(false);

          return (
            result.earlyLeaveMinutes === 0 && result.isEarlyLeave === false
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: Consistency check function works correctly
   * isAttendanceStatusConsistent SHALL return true when displayed values match calculated values.
   */
  it("Property 8: consistency check should pass when values match calculation", () => {
    fc.assert(
      fc.property(attendanceInputArb, (input) => {
        const calculated = calculateAttendanceStatus(
          input as AttendanceStatusInput,
        );

        const isConsistent = isAttendanceStatusConsistent(
          calculated.lateMinutes,
          calculated.earlyLeaveMinutes,
          calculated.isLate,
          calculated.isEarlyLeave,
          input as AttendanceStatusInput,
        );

        expect(
          isConsistent,
          `Consistency check should pass when values match`,
        ).toBe(true);

        return isConsistent;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 9: Consistency check fails when values don't match
   * isAttendanceStatusConsistent SHALL return false when displayed values differ from calculated values.
   */
  it("Property 9: consistency check should fail when values don't match", () => {
    fc.assert(
      fc.property(
        attendanceInputArb,
        fc.integer({ min: 1, max: 60 }), // offset to make values wrong
        (input, offset) => {
          const calculated = calculateAttendanceStatus(
            input as AttendanceStatusInput,
          );

          // Test với wrong late minutes
          const isConsistentWrongLate = isAttendanceStatusConsistent(
            calculated.lateMinutes + offset,
            calculated.earlyLeaveMinutes,
            calculated.isLate,
            calculated.isEarlyLeave,
            input as AttendanceStatusInput,
          );

          expect(
            isConsistentWrongLate,
            `Consistency check should fail with wrong late minutes`,
          ).toBe(false);

          return !isConsistentWrongLate;
        },
      ),
      { numRuns: 100 },
    );
  });
});
