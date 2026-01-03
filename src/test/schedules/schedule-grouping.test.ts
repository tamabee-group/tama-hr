import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  groupSchedulesByType,
  isGroupHomogeneous,
  areAllSchedulesGroupedCorrectly,
  ScheduleGroup,
} from "@/lib/utils/schedule-grouping";
import { WorkSchedule, ScheduleData } from "@/types/attendance-records";
import { ScheduleType, SCHEDULE_TYPES } from "@/types/attendance-enums";

/**
 * Property Test: Schedule Grouping by Type
 * Feature: work-schedule-redesign, Task 9.3
 *
 * Property 5: Schedules Grouped by Type
 * For any list of schedules displayed on the Schedule Page,
 * schedules should be grouped by their type (FIXED, FLEXIBLE, SHIFT)
 * with each group containing only schedules of that type.
 */

// Arbitrary cho ScheduleType
const scheduleTypeArb = fc.constantFrom(...SCHEDULE_TYPES);

// Arbitrary cho ScheduleData
const scheduleDataArb: fc.Arbitrary<ScheduleData> = fc.record({
  workStartTime: fc.constant("09:00"),
  workEndTime: fc.constant("18:00"),
  breakMinutes: fc.integer({ min: 0, max: 120 }),
});

// Arbitrary cho WorkSchedule
const workScheduleArb = (id: number): fc.Arbitrary<WorkSchedule> =>
  fc.record({
    id: fc.constant(id),
    companyId: fc.integer({ min: 1, max: 1000 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    type: scheduleTypeArb,
    isDefault: fc.boolean(),
    scheduleData: scheduleDataArb,
    assignmentCount: fc.integer({ min: 0, max: 100 }),
  });

// Arbitrary cho danh sách WorkSchedule với unique IDs
const workScheduleListArb = fc
  .integer({ min: 0, max: 20 })
  .chain((length) =>
    fc.tuple(...Array.from({ length }, (_, i) => workScheduleArb(i + 1))),
  );

describe("Schedule Grouping Properties", () => {
  /**
   * Property 1: Tất cả schedules trong một group phải có cùng type
   * For any group returned by groupSchedulesByType,
   * all schedules in that group SHALL have the same type as the group's type.
   */
  it("Property 1: all schedules in a group should have the same type", () => {
    fc.assert(
      fc.property(workScheduleListArb, (schedules) => {
        const groups = groupSchedulesByType(schedules);

        for (const group of groups) {
          const isHomogeneous = isGroupHomogeneous(group);
          expect(
            isHomogeneous,
            `Group ${group.type} should only contain schedules of type ${group.type}`,
          ).toBe(true);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: Tổng số schedules trong các groups bằng số schedules ban đầu
   * For any list of schedules, the total count of schedules across all groups
   * SHALL equal the original list length.
   */
  it("Property 2: total schedules in groups should equal original count", () => {
    fc.assert(
      fc.property(workScheduleListArb, (schedules) => {
        const groups = groupSchedulesByType(schedules);
        const totalInGroups = groups.reduce(
          (sum, g) => sum + g.schedules.length,
          0,
        );

        expect(totalInGroups).toBe(schedules.length);
        return totalInGroups === schedules.length;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: Mỗi schedule chỉ xuất hiện trong đúng 1 group
   * For any schedule in the original list, it SHALL appear exactly once
   * across all groups.
   */
  it("Property 3: each schedule should appear exactly once across all groups", () => {
    fc.assert(
      fc.property(workScheduleListArb, (schedules) => {
        const groups = groupSchedulesByType(schedules);

        // Thu thập tất cả schedule IDs từ các groups
        const idsInGroups: number[] = [];
        for (const group of groups) {
          for (const schedule of group.schedules) {
            idsInGroups.push(schedule.id);
          }
        }

        // Kiểm tra không có duplicate
        const uniqueIds = new Set(idsInGroups);
        expect(uniqueIds.size).toBe(idsInGroups.length);

        // Kiểm tra tất cả schedules ban đầu đều có trong groups
        for (const schedule of schedules) {
          expect(uniqueIds.has(schedule.id)).toBe(true);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: Groups được trả về theo thứ tự FIXED → FLEXIBLE → SHIFT
   * For any non-empty groups, they SHALL be ordered as FIXED, FLEXIBLE, SHIFT.
   */
  it("Property 4: groups should be ordered as FIXED, FLEXIBLE, SHIFT", () => {
    fc.assert(
      fc.property(workScheduleListArb, (schedules) => {
        const groups = groupSchedulesByType(schedules);

        // Lấy thứ tự các types trong groups
        const groupTypes = groups.map((g) => g.type);

        // Kiểm tra thứ tự đúng
        const expectedOrder = SCHEDULE_TYPES.filter((t) =>
          groupTypes.includes(t),
        );

        expect(groupTypes).toEqual(expectedOrder);
        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: Empty list trả về empty groups
   * For an empty schedule list, groupSchedulesByType SHALL return an empty array.
   */
  it("Property 5: empty schedule list should return empty groups", () => {
    const groups = groupSchedulesByType([]);
    expect(groups).toEqual([]);
  });

  /**
   * Property 6: Chỉ trả về groups có ít nhất 1 schedule
   * For any list of schedules, groupSchedulesByType SHALL only return
   * groups that contain at least one schedule.
   */
  it("Property 6: only non-empty groups should be returned", () => {
    fc.assert(
      fc.property(workScheduleListArb, (schedules) => {
        const groups = groupSchedulesByType(schedules);

        for (const group of groups) {
          expect(group.schedules.length).toBeGreaterThan(0);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: areAllSchedulesGroupedCorrectly helper function
   * For any valid grouping, areAllSchedulesGroupedCorrectly SHALL return true.
   */
  it("Property 7: areAllSchedulesGroupedCorrectly should validate correct groupings", () => {
    fc.assert(
      fc.property(workScheduleListArb, (schedules) => {
        const groups = groupSchedulesByType(schedules);
        const isCorrect = areAllSchedulesGroupedCorrectly(schedules, groups);

        expect(isCorrect).toBe(true);
        return isCorrect;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: Schedules với cùng type được group cùng nhau
   * For any two schedules with the same type, they SHALL be in the same group.
   */
  it("Property 8: schedules with same type should be in the same group", () => {
    fc.assert(
      fc.property(workScheduleListArb, (schedules) => {
        const groups = groupSchedulesByType(schedules);

        // Tạo map từ type -> group
        const typeToGroup = new Map<ScheduleType, ScheduleGroup>();
        for (const group of groups) {
          typeToGroup.set(group.type, group);
        }

        // Kiểm tra mỗi schedule nằm trong group đúng type
        for (const schedule of schedules) {
          const expectedGroup = typeToGroup.get(schedule.type as ScheduleType);
          if (expectedGroup) {
            const found = expectedGroup.schedules.some(
              (s) => s.id === schedule.id,
            );
            expect(found).toBe(true);
          }
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
