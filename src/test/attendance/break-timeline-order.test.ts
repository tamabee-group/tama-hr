import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  isBreakTimelineOrdered,
  isBreakNumberSequential,
  sortBreaksByNumber,
} from "@/lib/utils/break-validation";
import type { BreakRecord } from "@/types/attendance-records";

/**
 * Property Test: Break Timeline Order Consistency
 * Feature: attendance-payroll-frontend, Task 38.5
 *
 * Property 7: Break Timeline Order Consistency
 * For any break timeline display, the break cards SHALL be ordered by breakNumber ascending,
 * and breakNumber SHALL be sequential starting from 1.
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

// Arbitrary cho một BreakRecord
const breakRecordArb = (breakNumber: number): fc.Arbitrary<BreakRecord> =>
  fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    attendanceRecordId: fc.integer({ min: 1, max: 10000 }),
    employeeId: fc.integer({ min: 1, max: 10000 }),
    workDate: fc.constant("2025-01-01"),
    breakNumber: fc.constant(breakNumber),
    breakStart: fc.option(validTimeArb, { nil: undefined }),
    breakEnd: fc.option(validTimeArb, { nil: undefined }),
    actualBreakMinutes: fc.integer({ min: 0, max: 120 }),
    effectiveBreakMinutes: fc.integer({ min: 0, max: 120 }),
    notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  });

// Arbitrary cho danh sách break records với breakNumber sequential từ 1
const sequentialBreakRecordsArb = (
  maxCount: number,
): fc.Arbitrary<BreakRecord[]> =>
  fc.integer({ min: 0, max: maxCount }).chain((count) => {
    if (count === 0) return fc.constant([]);
    const arbitraries = Array.from({ length: count }, (_, i) =>
      breakRecordArb(i + 1),
    );
    return fc.tuple(...arbitraries);
  });

// Arbitrary cho danh sách break records với breakNumber ngẫu nhiên (có thể không sequential)
const randomBreakRecordsArb = (maxCount: number): fc.Arbitrary<BreakRecord[]> =>
  fc.array(
    fc
      .integer({ min: 1, max: 10 })
      .chain((breakNumber) => breakRecordArb(breakNumber)),
    { minLength: 0, maxLength: maxCount },
  );

// ============================================
// Tests
// ============================================

describe("Break Timeline Order Properties", () => {
  /**
   * Property 1: sortBreaksByNumber produces ordered result
   * For any list of break records, sorting by breakNumber SHALL produce an ascending order.
   */
  it("Property 1: sortBreaksByNumber should produce ascending order", () => {
    fc.assert(
      fc.property(randomBreakRecordsArb(5), (breakRecords) => {
        const sorted = sortBreaksByNumber(breakRecords);

        // Kiểm tra kết quả được sắp xếp tăng dần
        const isOrdered = isBreakTimelineOrdered(sorted);

        expect(
          isOrdered,
          `Sorted breaks should be in ascending order by breakNumber`,
        ).toBe(true);

        return isOrdered;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: sortBreaksByNumber preserves all records
   * For any list of break records, sorting SHALL preserve all original records.
   */
  it("Property 2: sortBreaksByNumber should preserve all records", () => {
    fc.assert(
      fc.property(randomBreakRecordsArb(5), (breakRecords) => {
        const sorted = sortBreaksByNumber(breakRecords);

        // Kiểm tra số lượng không đổi
        expect(sorted.length).toBe(breakRecords.length);

        // Kiểm tra tất cả id đều được giữ lại
        const originalIds = new Set(breakRecords.map((b) => b.id));
        const sortedIds = new Set(sorted.map((b) => b.id));

        expect(sortedIds).toEqual(originalIds);

        return sorted.length === breakRecords.length;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: Sequential break numbers start from 1
   * For any valid break timeline, breakNumbers SHALL be sequential starting from 1.
   */
  it("Property 3: sequential break records should have breakNumbers starting from 1", () => {
    fc.assert(
      fc.property(sequentialBreakRecordsArb(5), (breakRecords) => {
        const isSequential = isBreakNumberSequential(breakRecords);

        expect(
          isSequential,
          `Break numbers should be sequential starting from 1`,
        ).toBe(true);

        // Kiểm tra thêm: nếu có records, breakNumber đầu tiên phải là 1
        if (breakRecords.length > 0) {
          const sorted = sortBreaksByNumber(breakRecords);
          expect(sorted[0].breakNumber).toBe(1);
        }

        return isSequential;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: Empty list is always ordered and sequential
   * An empty break list SHALL be considered both ordered and sequential.
   */
  it("Property 4: empty list should be ordered and sequential", () => {
    const emptyList: BreakRecord[] = [];

    expect(isBreakTimelineOrdered(emptyList)).toBe(true);
    expect(isBreakNumberSequential(emptyList)).toBe(true);
  });

  /**
   * Property 5: Single item list is always ordered and sequential
   * A single-item break list with breakNumber=1 SHALL be both ordered and sequential.
   */
  it("Property 5: single item list with breakNumber=1 should be ordered and sequential", () => {
    fc.assert(
      fc.property(breakRecordArb(1), (breakRecord) => {
        const list = [breakRecord];

        const isOrdered = isBreakTimelineOrdered(list);
        const isSequential = isBreakNumberSequential(list);

        expect(isOrdered).toBe(true);
        expect(isSequential).toBe(true);

        return isOrdered && isSequential;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Non-sequential break numbers are detected
   * For any list with gaps in breakNumbers, isBreakNumberSequential SHALL return false.
   */
  it("Property 6: non-sequential break numbers should be detected", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }), // gap position
        breakRecordArb(1),
        (gapPosition, firstBreak) => {
          // Tạo list với gap: [1, gapPosition+1] (bỏ qua các số ở giữa)
          const secondBreak: BreakRecord = {
            ...firstBreak,
            id: firstBreak.id + 1,
            breakNumber: gapPosition + 1,
          };

          const list = [firstBreak, secondBreak];

          const isSequential = isBreakNumberSequential(list);

          expect(
            isSequential,
            `List with gap [1, ${gapPosition + 1}] should not be sequential`,
          ).toBe(false);

          return !isSequential;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: Descending order is detected as not ordered
   * For any list in descending order, isBreakTimelineOrdered SHALL return false.
   */
  it("Property 7: descending order should be detected as not ordered", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        breakRecordArb(1),
        (count, baseRecord) => {
          // Tạo list theo thứ tự giảm dần
          const list: BreakRecord[] = Array.from({ length: count }, (_, i) => ({
            ...baseRecord,
            id: baseRecord.id + i,
            breakNumber: count - i, // Giảm dần: count, count-1, ..., 1
          }));

          const isOrdered = isBreakTimelineOrdered(list);

          expect(
            isOrdered,
            `Descending order list should not be considered ordered`,
          ).toBe(false);

          return !isOrdered;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: Sorting idempotence
   * For any list, sorting twice SHALL produce the same result as sorting once.
   */
  it("Property 8: sorting should be idempotent", () => {
    fc.assert(
      fc.property(randomBreakRecordsArb(5), (breakRecords) => {
        const sortedOnce = sortBreaksByNumber(breakRecords);
        const sortedTwice = sortBreaksByNumber(sortedOnce);

        // So sánh breakNumbers
        const numbersOnce = sortedOnce.map((b) => b.breakNumber);
        const numbersTwice = sortedTwice.map((b) => b.breakNumber);

        expect(numbersTwice).toEqual(numbersOnce);

        return JSON.stringify(numbersOnce) === JSON.stringify(numbersTwice);
      }),
      { numRuns: 100 },
    );
  });
});
