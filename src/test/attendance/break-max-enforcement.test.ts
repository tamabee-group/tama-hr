import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  isWithinMaxBreaks,
  canAddNewBreak,
} from "@/lib/utils/break-validation";
import type { BreakRecord } from "@/types/attendance-records";

/**
 * Property Test: Max Breaks Per Day Enforcement
 * Feature: attendance-payroll-frontend, Task 38.7
 *
 * Property 9: Max Breaks Per Day Enforcement
 * For any attendance record, the number of break records SHALL NOT exceed
 * maxBreaksPerDay configured in BreakConfig.
 */

// ============================================
// Tests
// ============================================

describe("Max Breaks Per Day Enforcement Properties", () => {
  /**
   * Property 1: isWithinMaxBreaks returns true when count <= max
   * For any break count <= maxBreaksPerDay, isWithinMaxBreaks SHALL return true.
   */
  it("Property 1: isWithinMaxBreaks should return true when count <= max", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // maxBreaksPerDay
        fc.integer({ min: 0, max: 10 }), // breakCount
        (maxBreaksPerDay, breakCount) => {
          // Chỉ test khi breakCount <= maxBreaksPerDay
          if (breakCount > maxBreaksPerDay) return true;

          const breaks: BreakRecord[] = Array.from(
            { length: breakCount },
            (_, i) => ({
              id: i + 1,
              attendanceRecordId: 1,
              employeeId: 1,
              workDate: "2025-01-01",
              breakNumber: i + 1,
              breakStart: "09:00",
              breakEnd: "09:30",
              actualBreakMinutes: 30,
              effectiveBreakMinutes: 30,
            }),
          );

          const isWithin = isWithinMaxBreaks(breaks, maxBreaksPerDay);

          expect(
            isWithin,
            `${breakCount} breaks should be within max ${maxBreaksPerDay}`,
          ).toBe(true);

          return isWithin;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: isWithinMaxBreaks returns false when count > max
   * For any break count > maxBreaksPerDay, isWithinMaxBreaks SHALL return false.
   */
  it("Property 2: isWithinMaxBreaks should return false when count > max", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // maxBreaksPerDay
        fc.integer({ min: 1, max: 5 }), // excess (how many over max)
        (maxBreaksPerDay, excess) => {
          const breakCount = maxBreaksPerDay + excess;

          const breaks: BreakRecord[] = Array.from(
            { length: breakCount },
            (_, i) => ({
              id: i + 1,
              attendanceRecordId: 1,
              employeeId: 1,
              workDate: "2025-01-01",
              breakNumber: i + 1,
              breakStart: "09:00",
              breakEnd: "09:30",
              actualBreakMinutes: 30,
              effectiveBreakMinutes: 30,
            }),
          );

          const isWithin = isWithinMaxBreaks(breaks, maxBreaksPerDay);

          expect(
            isWithin,
            `${breakCount} breaks should exceed max ${maxBreaksPerDay}`,
          ).toBe(false);

          return !isWithin;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: canAddNewBreak returns true when current < max
   * For any current count < maxBreaksPerDay, canAddNewBreak SHALL return true.
   */
  it("Property 3: canAddNewBreak should return true when current < max", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // maxBreaksPerDay
        fc.integer({ min: 0, max: 9 }), // currentCount
        (maxBreaksPerDay, currentCount) => {
          // Chỉ test khi currentCount < maxBreaksPerDay
          if (currentCount >= maxBreaksPerDay) return true;

          const canAdd = canAddNewBreak(currentCount, maxBreaksPerDay);

          expect(
            canAdd,
            `Should be able to add break when ${currentCount} < ${maxBreaksPerDay}`,
          ).toBe(true);

          return canAdd;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: canAddNewBreak returns false when current >= max
   * For any current count >= maxBreaksPerDay, canAddNewBreak SHALL return false.
   */
  it("Property 4: canAddNewBreak should return false when current >= max", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // maxBreaksPerDay
        fc.integer({ min: 0, max: 5 }), // excess (0 = at max, >0 = over max)
        (maxBreaksPerDay, excess) => {
          const currentCount = maxBreaksPerDay + excess;

          const canAdd = canAddNewBreak(currentCount, maxBreaksPerDay);

          expect(
            canAdd,
            `Should not be able to add break when ${currentCount} >= ${maxBreaksPerDay}`,
          ).toBe(false);

          return !canAdd;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: Empty list is always within max
   * An empty break list SHALL always be within any positive max.
   */
  it("Property 5: empty list should always be within max", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (maxBreaksPerDay) => {
        const emptyList: BreakRecord[] = [];

        const isWithin = isWithinMaxBreaks(emptyList, maxBreaksPerDay);

        expect(isWithin).toBe(true);

        return isWithin;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Exactly at max is within limit
   * When break count equals maxBreaksPerDay, isWithinMaxBreaks SHALL return true.
   */
  it("Property 6: exactly at max should be within limit", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), (maxBreaksPerDay) => {
        const breaks: BreakRecord[] = Array.from(
          { length: maxBreaksPerDay },
          (_, i) => ({
            id: i + 1,
            attendanceRecordId: 1,
            employeeId: 1,
            workDate: "2025-01-01",
            breakNumber: i + 1,
            breakStart: "09:00",
            breakEnd: "09:30",
            actualBreakMinutes: 30,
            effectiveBreakMinutes: 30,
          }),
        );

        const isWithin = isWithinMaxBreaks(breaks, maxBreaksPerDay);

        expect(
          isWithin,
          `Exactly ${maxBreaksPerDay} breaks should be within max ${maxBreaksPerDay}`,
        ).toBe(true);

        return isWithin;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: Exactly at max cannot add more
   * When current count equals maxBreaksPerDay, canAddNewBreak SHALL return false.
   */
  it("Property 7: exactly at max should not allow adding more", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), (maxBreaksPerDay) => {
        const canAdd = canAddNewBreak(maxBreaksPerDay, maxBreaksPerDay);

        expect(
          canAdd,
          `Should not be able to add when at max ${maxBreaksPerDay}`,
        ).toBe(false);

        return !canAdd;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: One below max can add exactly one more
   * When current count is maxBreaksPerDay - 1, canAddNewBreak SHALL return true.
   */
  it("Property 8: one below max should allow adding one more", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), (maxBreaksPerDay) => {
        const currentCount = maxBreaksPerDay - 1;

        const canAdd = canAddNewBreak(currentCount, maxBreaksPerDay);

        expect(
          canAdd,
          `Should be able to add when ${currentCount} < ${maxBreaksPerDay}`,
        ).toBe(true);

        // Sau khi thêm, không thể thêm nữa
        const canAddAfter = canAddNewBreak(currentCount + 1, maxBreaksPerDay);

        expect(
          canAddAfter,
          `Should not be able to add after reaching ${maxBreaksPerDay}`,
        ).toBe(false);

        return canAdd && !canAddAfter;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 9: Consistency between isWithinMaxBreaks and canAddNewBreak
   * canAddNewBreak(n, max) === isWithinMaxBreaks(n+1 breaks, max) for n < max
   */
  it("Property 9: consistency between isWithinMaxBreaks and canAddNewBreak", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // maxBreaksPerDay
        fc.integer({ min: 0, max: 9 }), // currentCount
        (maxBreaksPerDay, currentCount) => {
          const canAdd = canAddNewBreak(currentCount, maxBreaksPerDay);

          // Nếu có thể thêm, thì sau khi thêm vẫn phải trong giới hạn
          if (canAdd) {
            const breaksAfterAdd: BreakRecord[] = Array.from(
              { length: currentCount + 1 },
              (_, i) => ({
                id: i + 1,
                attendanceRecordId: 1,
                employeeId: 1,
                workDate: "2025-01-01",
                breakNumber: i + 1,
                breakStart: "09:00",
                breakEnd: "09:30",
                actualBreakMinutes: 30,
                effectiveBreakMinutes: 30,
              }),
            );

            const isWithinAfterAdd = isWithinMaxBreaks(
              breaksAfterAdd,
              maxBreaksPerDay,
            );

            expect(
              isWithinAfterAdd,
              `After adding, should still be within max`,
            ).toBe(true);

            return isWithinAfterAdd;
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
