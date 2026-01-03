import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  validateBreakWithinWorkHours,
  validateBreakPeriodsNoOverlap,
  validateAllBreakPeriods,
  calculateBreakDuration,
  BreakPeriodInput,
} from "@/lib/utils/break-validation";

/**
 * Property Test: Break Periods Within Work Hours Validation
 * Feature: work-schedule-redesign, Task 9.7
 *
 * Property 6: Break Periods Within Work Hours Validation
 * For any break period configuration, the break start and end times
 * must fall within the work start and end times (accounting for overnight schedules).
 */

// Arbitrary cho time string hợp lệ (HH:mm format)
const validTimeArb = fc.integer({ min: 0, max: 23 }).chain((hour) =>
  fc.integer({ min: 0, max: 59 }).map((minute) => {
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m}`;
  }),
);

// Arbitrary cho work schedule (non-overnight)
const nonOvernightWorkScheduleArb = fc
  .integer({ min: 0, max: 20 * 60 }) // workStart: 00:00 to 20:00
  .chain((workStartMin) =>
    fc
      .integer({ min: workStartMin + 60, max: 23 * 60 + 59 }) // workEnd: at least 1 hour after start
      .map((workEndMin) => {
        const workStartHour = Math.floor(workStartMin / 60);
        const workStartMinute = workStartMin % 60;
        const workEndHour = Math.floor(workEndMin / 60);
        const workEndMinute = workEndMin % 60;

        return {
          workStart: `${workStartHour.toString().padStart(2, "0")}:${workStartMinute.toString().padStart(2, "0")}`,
          workEnd: `${workEndHour.toString().padStart(2, "0")}:${workEndMinute.toString().padStart(2, "0")}`,
          workStartMin,
          workEndMin,
        };
      }),
  );

// Arbitrary cho break period nằm trong work hours
const validBreakWithinWorkArb = nonOvernightWorkScheduleArb.chain((work) =>
  fc
    .integer({ min: work.workStartMin, max: work.workEndMin - 30 }) // breakStart
    .chain((breakStartMin) =>
      fc
        .integer({ min: breakStartMin + 15, max: work.workEndMin }) // breakEnd: at least 15 min after start
        .map((breakEndMin) => {
          const breakStartHour = Math.floor(breakStartMin / 60);
          const breakStartMinute = breakStartMin % 60;
          const breakEndHour = Math.floor(breakEndMin / 60);
          const breakEndMinute = breakEndMin % 60;

          return {
            workStart: work.workStart,
            workEnd: work.workEnd,
            breakStart: `${breakStartHour.toString().padStart(2, "0")}:${breakStartMinute.toString().padStart(2, "0")}`,
            breakEnd: `${breakEndHour.toString().padStart(2, "0")}:${breakEndMinute.toString().padStart(2, "0")}`,
          };
        }),
    ),
);

// Arbitrary cho break period nằm ngoài work hours (trước work start)
const breakBeforeWorkArb = nonOvernightWorkScheduleArb
  .filter((work) => work.workStartMin >= 60) // Cần có space trước work start
  .chain((work) =>
    fc
      .integer({ min: 0, max: work.workStartMin - 30 }) // breakStart trước work
      .chain((breakStartMin) =>
        fc
          .integer({ min: breakStartMin + 15, max: work.workStartMin - 1 }) // breakEnd vẫn trước work
          .map((breakEndMin) => {
            const breakStartHour = Math.floor(breakStartMin / 60);
            const breakStartMinute = breakStartMin % 60;
            const breakEndHour = Math.floor(breakEndMin / 60);
            const breakEndMinute = breakEndMin % 60;

            return {
              workStart: work.workStart,
              workEnd: work.workEnd,
              breakStart: `${breakStartHour.toString().padStart(2, "0")}:${breakStartMinute.toString().padStart(2, "0")}`,
              breakEnd: `${breakEndHour.toString().padStart(2, "0")}:${breakEndMinute.toString().padStart(2, "0")}`,
            };
          }),
      ),
  );

describe("Break Validation Properties", () => {
  /**
   * Property 1: Valid breaks within work hours should pass validation
   * For any break period that starts after work start and ends before work end,
   * validateBreakWithinWorkHours SHALL return isValid: true.
   */
  it("Property 1: valid breaks within work hours should pass validation", () => {
    fc.assert(
      fc.property(
        validBreakWithinWorkArb,
        ({ workStart, workEnd, breakStart, breakEnd }) => {
          const result = validateBreakWithinWorkHours(
            breakStart,
            breakEnd,
            workStart,
            workEnd,
            false, // non-overnight
          );

          expect(result.isValid).toBe(true);
          return result.isValid;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: Breaks before work hours should fail validation
   * For any break period that ends before work start,
   * validateBreakWithinWorkHours SHALL return isValid: false.
   */
  it("Property 2: breaks before work hours should fail validation", () => {
    fc.assert(
      fc.property(
        breakBeforeWorkArb,
        ({ workStart, workEnd, breakStart, breakEnd }) => {
          const result = validateBreakWithinWorkHours(
            breakStart,
            breakEnd,
            workStart,
            workEnd,
            false,
          );

          expect(result.isValid).toBe(false);
          return !result.isValid;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: Break duration calculation is correct
   * For any break period, calculateBreakDuration SHALL return
   * the difference between end and start times in minutes.
   */
  it("Property 3: break duration calculation should be correct", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 * 60 }), // breakStartMin
        fc.integer({ min: 15, max: 180 }), // durationMin
        (breakStartMin, durationMin) => {
          const breakEndMin = breakStartMin + durationMin;
          if (breakEndMin > 23 * 60 + 59) return true; // Skip invalid times

          const breakStartHour = Math.floor(breakStartMin / 60);
          const breakStartMinute = breakStartMin % 60;
          const breakEndHour = Math.floor(breakEndMin / 60);
          const breakEndMinute = breakEndMin % 60;

          const breakStart = `${breakStartHour.toString().padStart(2, "0")}:${breakStartMinute.toString().padStart(2, "0")}`;
          const breakEnd = `${breakEndHour.toString().padStart(2, "0")}:${breakEndMinute.toString().padStart(2, "0")}`;

          const periods: BreakPeriodInput[] = [
            {
              name: "Test",
              startTime: breakStart,
              endTime: breakEnd,
              isFlexible: false,
            },
          ];

          const calculatedDuration = calculateBreakDuration(periods, false);
          expect(calculatedDuration).toBe(durationMin);
          return calculatedDuration === durationMin;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: Non-overlapping breaks should pass overlap validation
   * For any two break periods that don't overlap,
   * validateBreakPeriodsNoOverlap SHALL return isValid: true.
   */
  it("Property 4: non-overlapping breaks should pass overlap validation", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 * 60 }), // break1StartMin
        fc.integer({ min: 30, max: 120 }), // break1Duration
        fc.integer({ min: 30, max: 120 }), // gap between breaks
        fc.integer({ min: 30, max: 120 }), // break2Duration
        (break1StartMin, break1Duration, gap, break2Duration) => {
          const break1EndMin = break1StartMin + break1Duration;
          const break2StartMin = break1EndMin + gap;
          const break2EndMin = break2StartMin + break2Duration;

          if (break2EndMin > 23 * 60 + 59) return true; // Skip invalid times

          const formatTime = (min: number) => {
            const h = Math.floor(min / 60);
            const m = min % 60;
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
          };

          const result = validateBreakPeriodsNoOverlap(
            formatTime(break1StartMin),
            formatTime(break1EndMin),
            formatTime(break2StartMin),
            formatTime(break2EndMin),
            false,
          );

          expect(result.isValid).toBe(true);
          return result.isValid;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: Overlapping breaks should fail overlap validation
   * For any two break periods that overlap,
   * validateBreakPeriodsNoOverlap SHALL return isValid: false.
   */
  it("Property 5: overlapping breaks should fail overlap validation", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 18 * 60 }), // break1StartMin
        fc.integer({ min: 60, max: 180 }), // break1Duration
        fc.integer({ min: 1, max: 59 }), // overlap amount (break2 starts before break1 ends)
        fc.integer({ min: 60, max: 180 }), // break2Duration
        (break1StartMin, break1Duration, overlapAmount, break2Duration) => {
          const break1EndMin = break1StartMin + break1Duration;
          const break2StartMin = break1EndMin - overlapAmount; // Overlap!
          const break2EndMin = break2StartMin + break2Duration;

          if (break2EndMin > 23 * 60 + 59) return true; // Skip invalid times
          if (break2StartMin < 0) return true; // Skip invalid times

          const formatTime = (min: number) => {
            const h = Math.floor(min / 60);
            const m = min % 60;
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
          };

          const result = validateBreakPeriodsNoOverlap(
            formatTime(break1StartMin),
            formatTime(break1EndMin),
            formatTime(break2StartMin),
            formatTime(break2EndMin),
            false,
          );

          expect(result.isValid).toBe(false);
          expect(result.errorCode).toBe("BREAK_PERIODS_OVERLAP");
          return !result.isValid;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Invalid time format should fail validation
   * For any invalid time string, validation SHALL return isValid: false.
   */
  it("Property 6: invalid time format should fail validation", () => {
    const invalidTimes = ["25:00", "12:60", "1:30", "abc", "", "12-30"];

    for (const invalidTime of invalidTimes) {
      const result = validateBreakWithinWorkHours(
        invalidTime,
        "12:00",
        "09:00",
        "18:00",
        false,
      );
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("INVALID_TIME_FORMAT");
    }
  });

  /**
   * Property 7: Break start must be before break end
   * For any break where start >= end (non-overnight),
   * validateBreakWithinWorkHours SHALL return isValid: false.
   */
  it("Property 7: break start must be before break end", () => {
    fc.assert(
      fc.property(validTimeArb, (time) => {
        // Same start and end time
        const result = validateBreakWithinWorkHours(
          time,
          time,
          "00:00",
          "23:59",
          false,
        );

        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe("BREAK_START_AFTER_END");
        return !result.isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: Multiple valid breaks should all pass validation
   * For any list of non-overlapping breaks within work hours,
   * validateAllBreakPeriods SHALL return no errors.
   */
  it("Property 8: multiple valid breaks should all pass validation", () => {
    // Create 2 non-overlapping breaks within 09:00-18:00
    const breaks: BreakPeriodInput[] = [
      {
        name: "Morning",
        startTime: "10:00",
        endTime: "10:15",
        isFlexible: false,
      },
      {
        name: "Lunch",
        startTime: "12:00",
        endTime: "13:00",
        isFlexible: false,
      },
    ];

    const results = validateAllBreakPeriods(breaks, "09:00", "18:00", false);
    expect(results.length).toBe(0);
  });
});
