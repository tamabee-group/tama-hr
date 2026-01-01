import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  isValidTimeFormat,
  isStartTimeBeforeEndTime,
} from "@/app/[locale]/(AdminLayout)/company/schedules/_schedule-form";

/**
 * Property Test: Schedule Time Validation
 * Feature: attendance-payroll-frontend, Task 7.4
 *
 * Property 2: Schedule Time Validation
 * For any work schedule form, the system SHALL reject submissions
 * where start time is not before end time.
 */

// Arbitrary cho time string hợp lệ (HH:mm format)
const validTimeArb = fc.integer({ min: 0, max: 23 }).chain((hour) =>
  fc.integer({ min: 0, max: 59 }).map((minute) => {
    const h = hour.toString().padStart(2, "0");
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m}`;
  }),
);

// Arbitrary cho time string không hợp lệ
const invalidTimeArb = fc.oneof(
  fc.constant("25:00"), // Giờ > 23
  fc.constant("12:60"), // Phút > 59
  fc.constant("1:30"), // Thiếu leading zero
  fc.constant("12:5"), // Thiếu leading zero
  fc.constant("abc"), // Không phải số
  fc.constant(""), // Empty string
  fc.constant("12-30"), // Sai separator
  fc.constant("12:30:00"), // Có seconds
);

// Arbitrary cho cặp thời gian với start < end (không overnight)
const validTimeRangeArb = fc
  .integer({ min: 0, max: 23 * 60 - 1 }) // startMinutes: 0 to 1378
  .chain((startMinutes) =>
    fc
      .integer({ min: startMinutes + 1, max: 23 * 60 + 59 }) // endMinutes > startMinutes
      .filter((endMinutes) => endMinutes <= 23 * 60 + 59) // Ensure valid range
      .map((endMinutes) => {
        const startHour = Math.floor(startMinutes / 60);
        const startMin = startMinutes % 60;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;

        return {
          startTime: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
          endTime: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
        };
      }),
  );

// Arbitrary cho cặp thời gian với start >= end (invalid, không overnight)
const invalidTimeRangeArb = fc
  .integer({ min: 1, max: 23 * 60 + 59 }) // startMinutes: 1 to 1439
  .chain((startMinutes) =>
    fc
      .integer({ min: 0, max: startMinutes }) // endMinutes <= startMinutes
      .map((endMinutes) => {
        const startHour = Math.floor(startMinutes / 60);
        const startMin = startMinutes % 60;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;

        return {
          startTime: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
          endTime: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
        };
      }),
  );

// Arbitrary cho overnight schedule (start > end, e.g., 22:00 to 06:00)
const overnightTimeRangeArb = fc
  .integer({ min: 12 * 60, max: 23 * 60 + 59 }) // startMinutes: 12:00 to 23:59
  .chain((startMinutes) =>
    fc
      .integer({ min: 0, max: 11 * 60 + 59 }) // endMinutes: 00:00 to 11:59
      .map((endMinutes) => {
        const startHour = Math.floor(startMinutes / 60);
        const startMin = startMinutes % 60;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;

        return {
          startTime: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
          endTime: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
        };
      }),
  );

describe("Schedule Time Validation Properties", () => {
  /**
   * Property 1: Valid time format acceptance
   * For any time string in HH:mm format with valid hours (00-23) and minutes (00-59),
   * isValidTimeFormat SHALL return true.
   */
  it("Property 1: valid time strings should be accepted", () => {
    fc.assert(
      fc.property(validTimeArb, (time) => {
        const isValid = isValidTimeFormat(time);
        expect(isValid, `Time "${time}" should be valid`).toBe(true);
        return isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: Invalid time format rejection
   * For any time string NOT in valid HH:mm format,
   * isValidTimeFormat SHALL return false.
   */
  it("Property 2: invalid time strings should be rejected", () => {
    fc.assert(
      fc.property(invalidTimeArb, (time) => {
        const isValid = isValidTimeFormat(time);
        expect(isValid, `Time "${time}" should be invalid`).toBe(false);
        return !isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: Valid time range acceptance (non-overnight)
   * For any pair of valid times where startTime < endTime,
   * isStartTimeBeforeEndTime SHALL return true when allowOvernight is false.
   */
  it("Property 3: valid time ranges (start < end) should be accepted", () => {
    fc.assert(
      fc.property(validTimeRangeArb, ({ startTime, endTime }) => {
        const isValid = isStartTimeBeforeEndTime(startTime, endTime, false);
        expect(
          isValid,
          `Time range ${startTime} to ${endTime} should be valid`,
        ).toBe(true);
        return isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: Invalid time range rejection (non-overnight)
   * For any pair of valid times where startTime >= endTime,
   * isStartTimeBeforeEndTime SHALL return false when allowOvernight is false.
   */
  it("Property 4: invalid time ranges (start >= end) should be rejected when overnight not allowed", () => {
    fc.assert(
      fc.property(invalidTimeRangeArb, ({ startTime, endTime }) => {
        const isValid = isStartTimeBeforeEndTime(startTime, endTime, false);
        expect(
          isValid,
          `Time range ${startTime} to ${endTime} should be invalid (start >= end)`,
        ).toBe(false);
        return !isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: Overnight schedule acceptance
   * For any overnight schedule (e.g., 22:00 to 06:00),
   * isStartTimeBeforeEndTime SHALL return true when allowOvernight is true.
   */
  it("Property 5: overnight schedules should be accepted when allowOvernight is true", () => {
    fc.assert(
      fc.property(overnightTimeRangeArb, ({ startTime, endTime }) => {
        const isValid = isStartTimeBeforeEndTime(startTime, endTime, true);
        expect(
          isValid,
          `Overnight schedule ${startTime} to ${endTime} should be valid`,
        ).toBe(true);
        return isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Same time rejection
   * For any time T, isStartTimeBeforeEndTime(T, T) SHALL return false
   * regardless of allowOvernight setting.
   */
  it("Property 6: same start and end time should be rejected", () => {
    fc.assert(
      fc.property(validTimeArb, fc.boolean(), (time, allowOvernight) => {
        const isValid = isStartTimeBeforeEndTime(time, time, allowOvernight);
        expect(isValid, `Same time ${time} to ${time} should be invalid`).toBe(
          false,
        );
        return !isValid;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: Invalid input handling
   * For any invalid time string as input,
   * isStartTimeBeforeEndTime SHALL return false.
   */
  it("Property 7: invalid time inputs should return false", () => {
    fc.assert(
      fc.property(
        invalidTimeArb,
        validTimeArb,
        fc.boolean(),
        (invalidTime, validTime, allowOvernight) => {
          // Test với invalid start time
          const result1 = isStartTimeBeforeEndTime(
            invalidTime,
            validTime,
            allowOvernight,
          );
          expect(
            result1,
            `Invalid start time "${invalidTime}" should cause rejection`,
          ).toBe(false);

          // Test với invalid end time
          const result2 = isStartTimeBeforeEndTime(
            validTime,
            invalidTime,
            allowOvernight,
          );
          expect(
            result2,
            `Invalid end time "${invalidTime}" should cause rejection`,
          ).toBe(false);

          return !result1 && !result2;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: Boundary time values
   * For boundary times (00:00, 23:59), validation SHALL work correctly.
   */
  it("Property 8: boundary time values should be handled correctly", () => {
    // 00:00 to 23:59 should be valid (full day)
    expect(isStartTimeBeforeEndTime("00:00", "23:59", false)).toBe(true);

    // 23:59 to 00:00 should be invalid without overnight
    expect(isStartTimeBeforeEndTime("23:59", "00:00", false)).toBe(false);

    // 23:59 to 00:00 should be valid with overnight
    expect(isStartTimeBeforeEndTime("23:59", "00:00", true)).toBe(true);

    // 00:00 to 00:01 should be valid
    expect(isStartTimeBeforeEndTime("00:00", "00:01", false)).toBe(true);

    // 23:58 to 23:59 should be valid
    expect(isStartTimeBeforeEndTime("23:58", "23:59", false)).toBe(true);
  });
});
