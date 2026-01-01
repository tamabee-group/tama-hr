import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  hasBreakOverlap,
  findOverlappingBreaks,
  checkTimeOverlap,
  parseTimeToMinutes,
} from "@/lib/utils/break-validation";
import type { BreakRecord } from "@/types/attendance-records";

/**
 * Property Test: Break Session Non-Overlap
 * Feature: attendance-payroll-frontend, Task 38.6
 *
 * Property 8: Break Session Non-Overlap
 * For any set of break records for a single attendance, no two completed breaks
 * SHALL have overlapping time ranges.
 */

// ============================================
// Arbitraries
// ============================================

// Arbitrary cho một khoảng thời gian hợp lệ (start < end)
const validTimeRangeArb = fc
  .integer({ min: 0, max: 22 * 60 + 59 }) // start: 0 to 22:59
  .chain((startMinutes) =>
    fc
      .integer({ min: startMinutes + 1, max: 23 * 60 + 59 }) // end: start+1 to 23:59
      .map((endMinutes) => {
        const startHour = Math.floor(startMinutes / 60);
        const startMin = startMinutes % 60;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;
        return {
          start: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
          end: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
        };
      }),
  );

// Arbitrary cho một BreakRecord hoàn chỉnh (có cả start và end)
const completedBreakRecordArb = (
  breakNumber: number,
  startTime: string,
  endTime: string,
): fc.Arbitrary<BreakRecord> =>
  fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    attendanceRecordId: fc.constant(1),
    employeeId: fc.constant(1),
    workDate: fc.constant("2025-01-01"),
    breakNumber: fc.constant(breakNumber),
    breakStart: fc.constant(startTime),
    breakEnd: fc.constant(endTime),
    actualBreakMinutes: fc.integer({ min: 1, max: 120 }),
    effectiveBreakMinutes: fc.integer({ min: 1, max: 120 }),
    notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  });

// Arbitrary cho danh sách break records không overlap
const nonOverlappingBreaksArb = (
  maxCount: number,
): fc.Arbitrary<BreakRecord[]> =>
  fc.integer({ min: 0, max: maxCount }).chain((count) => {
    if (count === 0) return fc.constant([]);

    // Tạo các khoảng thời gian không overlap
    // Chia ngày thành các slot và chọn ngẫu nhiên
    return fc
      .array(fc.integer({ min: 15, max: 60 }), {
        minLength: count,
        maxLength: count,
      })
      .chain((durations) => {
        const breaks: fc.Arbitrary<BreakRecord>[] = [];
        let currentStart = 8 * 60; // Bắt đầu từ 08:00

        for (let i = 0; i < count; i++) {
          const duration = durations[i];
          const startMinutes = currentStart;
          const endMinutes = startMinutes + duration;

          if (endMinutes > 22 * 60) break; // Không vượt quá 22:00

          const startHour = Math.floor(startMinutes / 60);
          const startMin = startMinutes % 60;
          const endHour = Math.floor(endMinutes / 60);
          const endMin = endMinutes % 60;

          const startTime = `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`;
          const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

          breaks.push(completedBreakRecordArb(i + 1, startTime, endTime));

          // Gap 30 phút giữa các break
          currentStart = endMinutes + 30;
        }

        if (breaks.length === 0) return fc.constant([]);
        return fc.tuple(...breaks);
      });
  });

// Arbitrary cho hai khoảng thời gian overlap
const overlappingTimeRangesArb = fc
  .integer({ min: 0, max: 20 * 60 }) // start1: 0 to 20:00
  .chain((start1Minutes) =>
    fc
      .integer({ min: 30, max: 120 }) // duration1: 30-120 minutes
      .chain((duration1) =>
        fc
          .integer({ min: 1, max: duration1 - 1 }) // overlap amount
          .map((overlapAmount) => {
            const end1Minutes = start1Minutes + duration1;
            const start2Minutes = end1Minutes - overlapAmount;
            const end2Minutes = start2Minutes + 60;

            // Đảm bảo không vượt quá 23:59
            if (end2Minutes > 23 * 60 + 59) return null;

            const formatTime = (minutes: number) => {
              const h = Math.floor(minutes / 60);
              const m = minutes % 60;
              return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
            };

            return {
              range1: {
                start: formatTime(start1Minutes),
                end: formatTime(end1Minutes),
              },
              range2: {
                start: formatTime(start2Minutes),
                end: formatTime(end2Minutes),
              },
            };
          }),
      ),
  )
  .filter((x): x is NonNullable<typeof x> => x !== null);

// ============================================
// Tests
// ============================================

describe("Break Non-Overlap Properties", () => {
  /**
   * Property 1: checkTimeOverlap detects overlapping ranges
   * For any two overlapping time ranges, checkTimeOverlap SHALL return true.
   */
  it("Property 1: checkTimeOverlap should detect overlapping ranges", () => {
    fc.assert(
      fc.property(overlappingTimeRangesArb, ({ range1, range2 }) => {
        const start1 = parseTimeToMinutes(range1.start)!;
        const end1 = parseTimeToMinutes(range1.end)!;
        const start2 = parseTimeToMinutes(range2.start)!;
        const end2 = parseTimeToMinutes(range2.end)!;

        const hasOverlap = checkTimeOverlap(
          { start: start1, end: end1 },
          { start: start2, end: end2 },
        );

        expect(
          hasOverlap,
          `Ranges [${range1.start}-${range1.end}] and [${range2.start}-${range2.end}] should overlap`,
        ).toBe(true);

        return hasOverlap;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: checkTimeOverlap returns false for non-overlapping ranges
   * For any two non-overlapping time ranges, checkTimeOverlap SHALL return false.
   */
  it("Property 2: checkTimeOverlap should return false for non-overlapping ranges", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 * 60 }), // start1
        fc.integer({ min: 30, max: 60 }), // duration1
        fc.integer({ min: 30, max: 60 }), // gap
        fc.integer({ min: 30, max: 60 }), // duration2
        (start1Minutes, duration1, gap, duration2) => {
          const end1Minutes = start1Minutes + duration1;
          const start2Minutes = end1Minutes + gap;
          const end2Minutes = start2Minutes + duration2;

          if (end2Minutes > 23 * 60 + 59) return true; // Skip invalid

          const hasOverlap = checkTimeOverlap(
            { start: start1Minutes, end: end1Minutes },
            { start: start2Minutes, end: end2Minutes },
          );

          expect(hasOverlap, `Non-overlapping ranges should not overlap`).toBe(
            false,
          );

          return !hasOverlap;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: hasBreakOverlap returns false for non-overlapping breaks
   * For any set of non-overlapping break records, hasBreakOverlap SHALL return false.
   */
  it("Property 3: hasBreakOverlap should return false for non-overlapping breaks", () => {
    fc.assert(
      fc.property(nonOverlappingBreaksArb(3), (breakRecords) => {
        const hasOverlap = hasBreakOverlap(breakRecords);

        expect(
          hasOverlap,
          `Non-overlapping breaks should not have overlap`,
        ).toBe(false);

        return !hasOverlap;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: hasBreakOverlap returns true when breaks overlap
   * For any set of break records with at least one overlap, hasBreakOverlap SHALL return true.
   */
  it("Property 4: hasBreakOverlap should return true when breaks overlap", () => {
    fc.assert(
      fc.property(overlappingTimeRangesArb, ({ range1, range2 }) => {
        const break1: BreakRecord = {
          id: 1,
          attendanceRecordId: 1,
          employeeId: 1,
          workDate: "2025-01-01",
          breakNumber: 1,
          breakStart: range1.start,
          breakEnd: range1.end,
          actualBreakMinutes: 30,
          effectiveBreakMinutes: 30,
        };

        const break2: BreakRecord = {
          id: 2,
          attendanceRecordId: 1,
          employeeId: 1,
          workDate: "2025-01-01",
          breakNumber: 2,
          breakStart: range2.start,
          breakEnd: range2.end,
          actualBreakMinutes: 30,
          effectiveBreakMinutes: 30,
        };

        const hasOverlap = hasBreakOverlap([break1, break2]);

        expect(hasOverlap, `Overlapping breaks should be detected`).toBe(true);

        return hasOverlap;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: findOverlappingBreaks returns empty for non-overlapping breaks
   * For any set of non-overlapping break records, findOverlappingBreaks SHALL return empty array.
   */
  it("Property 5: findOverlappingBreaks should return empty for non-overlapping breaks", () => {
    fc.assert(
      fc.property(nonOverlappingBreaksArb(3), (breakRecords) => {
        const overlaps = findOverlappingBreaks(breakRecords);

        expect(
          overlaps.length,
          `Non-overlapping breaks should have no overlaps`,
        ).toBe(0);

        return overlaps.length === 0;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Empty list has no overlap
   * An empty break list SHALL have no overlap.
   */
  it("Property 6: empty list should have no overlap", () => {
    const emptyList: BreakRecord[] = [];

    expect(hasBreakOverlap(emptyList)).toBe(false);
    expect(findOverlappingBreaks(emptyList)).toEqual([]);
  });

  /**
   * Property 7: Single break has no overlap
   * A single break record SHALL have no overlap.
   */
  it("Property 7: single break should have no overlap", () => {
    fc.assert(
      fc.property(validTimeRangeArb, ({ start, end }) => {
        const singleBreak: BreakRecord = {
          id: 1,
          attendanceRecordId: 1,
          employeeId: 1,
          workDate: "2025-01-01",
          breakNumber: 1,
          breakStart: start,
          breakEnd: end,
          actualBreakMinutes: 30,
          effectiveBreakMinutes: 30,
        };

        const hasOverlap = hasBreakOverlap([singleBreak]);
        const overlaps = findOverlappingBreaks([singleBreak]);

        expect(hasOverlap).toBe(false);
        expect(overlaps.length).toBe(0);

        return !hasOverlap && overlaps.length === 0;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: Incomplete breaks are ignored in overlap check
   * Breaks without end time SHALL be ignored in overlap detection.
   */
  it("Property 8: incomplete breaks should be ignored in overlap check", () => {
    fc.assert(
      fc.property(validTimeRangeArb, ({ start, end }) => {
        // Break hoàn chỉnh
        const completedBreak: BreakRecord = {
          id: 1,
          attendanceRecordId: 1,
          employeeId: 1,
          workDate: "2025-01-01",
          breakNumber: 1,
          breakStart: start,
          breakEnd: end,
          actualBreakMinutes: 30,
          effectiveBreakMinutes: 30,
        };

        // Break chưa hoàn chỉnh (đang active)
        const incompleteBreak: BreakRecord = {
          id: 2,
          attendanceRecordId: 1,
          employeeId: 1,
          workDate: "2025-01-01",
          breakNumber: 2,
          breakStart: start, // Cùng start time - sẽ overlap nếu được tính
          breakEnd: undefined, // Chưa kết thúc
          actualBreakMinutes: 0,
          effectiveBreakMinutes: 0,
        };

        const hasOverlap = hasBreakOverlap([completedBreak, incompleteBreak]);

        expect(hasOverlap, `Incomplete breaks should be ignored`).toBe(false);

        return !hasOverlap;
      }),
      { numRuns: 100 },
    );
  });
});
