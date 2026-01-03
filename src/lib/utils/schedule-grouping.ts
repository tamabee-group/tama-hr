import { WorkSchedule } from "@/types/attendance-records";
import { ScheduleType, SCHEDULE_TYPES } from "@/types/attendance-enums";

/**
 * Interface cho một group schedules theo type
 */
export interface ScheduleGroup {
  type: ScheduleType;
  schedules: WorkSchedule[];
}

/**
 * Group schedules theo type (FIXED, FLEXIBLE, SHIFT)
 * Trả về mảng các groups theo thứ tự: FIXED → FLEXIBLE → SHIFT
 * Chỉ trả về groups có ít nhất 1 schedule
 */
export function groupSchedulesByType(
  schedules: WorkSchedule[],
): ScheduleGroup[] {
  // Tạo map để group schedules theo type
  const groupMap = new Map<ScheduleType, WorkSchedule[]>();

  // Khởi tạo các groups rỗng theo thứ tự
  for (const type of SCHEDULE_TYPES) {
    groupMap.set(type, []);
  }

  // Group schedules vào các nhóm tương ứng
  for (const schedule of schedules) {
    const type = schedule.type as ScheduleType;
    const group = groupMap.get(type);
    if (group) {
      group.push(schedule);
    }
  }

  // Chuyển map thành mảng, chỉ giữ các groups có schedules
  const result: ScheduleGroup[] = [];
  for (const type of SCHEDULE_TYPES) {
    const schedules = groupMap.get(type) || [];
    if (schedules.length > 0) {
      result.push({ type, schedules });
    }
  }

  return result;
}

/**
 * Kiểm tra xem tất cả schedules trong một group có cùng type không
 * Dùng cho property-based testing
 */
export function isGroupHomogeneous(group: ScheduleGroup): boolean {
  return group.schedules.every((s) => s.type === group.type);
}

/**
 * Kiểm tra xem tất cả schedules đã được group đúng
 * Dùng cho property-based testing
 */
export function areAllSchedulesGroupedCorrectly(
  originalSchedules: WorkSchedule[],
  groups: ScheduleGroup[],
): boolean {
  // Tổng số schedules trong các groups phải bằng số schedules ban đầu
  const totalInGroups = groups.reduce((sum, g) => sum + g.schedules.length, 0);
  if (totalInGroups !== originalSchedules.length) {
    return false;
  }

  // Mỗi group phải homogeneous
  for (const group of groups) {
    if (!isGroupHomogeneous(group)) {
      return false;
    }
  }

  // Mỗi schedule ban đầu phải xuất hiện đúng 1 lần trong các groups
  const schedulesInGroups = new Set<number>();
  for (const group of groups) {
    for (const schedule of group.schedules) {
      if (schedulesInGroups.has(schedule.id)) {
        return false; // Duplicate
      }
      schedulesInGroups.add(schedule.id);
    }
  }

  // Kiểm tra tất cả schedules ban đầu đều có trong groups
  for (const schedule of originalSchedules) {
    if (!schedulesInGroups.has(schedule.id)) {
      return false;
    }
  }

  return true;
}
