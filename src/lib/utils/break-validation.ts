/**
 * Break Validation Utilities
 * Các hàm kiểm tra tính hợp lệ của break records
 */

import type { BreakRecord } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

export interface TimeRange {
  start: number; // minutes from midnight
  end: number; // minutes from midnight
}

// ============================================
// Time Utilities
// ============================================

/**
 * Parse time string (HH:mm hoặc ISO datetime) thành số phút từ midnight
 */
export function parseTimeToMinutes(time: string | undefined): number | null {
  if (!time) return null;

  let timeStr = time;
  // Nếu là ISO string, lấy phần time
  if (time.includes("T")) {
    timeStr = time.split("T")[1]?.substring(0, 5) || "";
  }

  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

/**
 * Kiểm tra hai khoảng thời gian có overlap không
 */
export function checkTimeOverlap(
  range1: TimeRange,
  range2: TimeRange,
): boolean {
  // Không overlap nếu một khoảng kết thúc trước khi khoảng kia bắt đầu
  return !(range1.end <= range2.start || range2.end <= range1.start);
}

// ============================================
// Break Timeline Validation
// ============================================

/**
 * Kiểm tra break records có được sắp xếp theo breakNumber tăng dần không
 * Cho phép duplicate breakNumber (vẫn coi là ordered nếu không giảm)
 */
export function isBreakTimelineOrdered(breakRecords: BreakRecord[]): boolean {
  if (breakRecords.length <= 1) return true;

  for (let i = 1; i < breakRecords.length; i++) {
    if (breakRecords[i].breakNumber < breakRecords[i - 1].breakNumber) {
      return false;
    }
  }
  return true;
}

/**
 * Kiểm tra breakNumber có sequential từ 1 không
 */
export function isBreakNumberSequential(breakRecords: BreakRecord[]): boolean {
  if (breakRecords.length === 0) return true;

  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  for (let i = 0; i < sortedRecords.length; i++) {
    if (sortedRecords[i].breakNumber !== i + 1) {
      return false;
    }
  }
  return true;
}

/**
 * Sắp xếp break records theo breakNumber tăng dần
 */
export function sortBreaksByNumber(breakRecords: BreakRecord[]): BreakRecord[] {
  return [...breakRecords].sort((a, b) => a.breakNumber - b.breakNumber);
}

// ============================================
// Break Non-Overlap Validation
// ============================================

/**
 * Kiểm tra các break records có overlap không
 * Chỉ kiểm tra các break đã hoàn thành (có cả start và end)
 */
export function hasBreakOverlap(breakRecords: BreakRecord[]): boolean {
  // Lọc các break đã hoàn thành
  const completedBreaks = breakRecords.filter(
    (b) => b.breakStart && b.breakEnd,
  );

  if (completedBreaks.length <= 1) return false;

  // Chuyển đổi thành time ranges
  const ranges: { record: BreakRecord; range: TimeRange }[] = [];
  for (const record of completedBreaks) {
    const start = parseTimeToMinutes(record.breakStart);
    const end = parseTimeToMinutes(record.breakEnd);
    if (start !== null && end !== null) {
      ranges.push({ record, range: { start, end } });
    }
  }

  // Kiểm tra overlap giữa các cặp
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (checkTimeOverlap(ranges[i].range, ranges[j].range)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Tìm các cặp break bị overlap
 */
export function findOverlappingBreaks(
  breakRecords: BreakRecord[],
): Array<[BreakRecord, BreakRecord]> {
  const overlaps: Array<[BreakRecord, BreakRecord]> = [];

  // Lọc các break đã hoàn thành
  const completedBreaks = breakRecords.filter(
    (b) => b.breakStart && b.breakEnd,
  );

  if (completedBreaks.length <= 1) return overlaps;

  // Chuyển đổi thành time ranges
  const ranges: { record: BreakRecord; range: TimeRange }[] = [];
  for (const record of completedBreaks) {
    const start = parseTimeToMinutes(record.breakStart);
    const end = parseTimeToMinutes(record.breakEnd);
    if (start !== null && end !== null) {
      ranges.push({ record, range: { start, end } });
    }
  }

  // Tìm các cặp overlap
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (checkTimeOverlap(ranges[i].range, ranges[j].range)) {
        overlaps.push([ranges[i].record, ranges[j].record]);
      }
    }
  }

  return overlaps;
}

// ============================================
// Max Breaks Validation
// ============================================

/**
 * Kiểm tra số lượng break không vượt quá giới hạn
 */
export function isWithinMaxBreaks(
  breakRecords: BreakRecord[],
  maxBreaksPerDay: number,
): boolean {
  return breakRecords.length <= maxBreaksPerDay;
}

/**
 * Kiểm tra có thể thêm break mới không
 */
export function canAddNewBreak(
  currentBreakCount: number,
  maxBreaksPerDay: number,
): boolean {
  return currentBreakCount < maxBreaksPerDay;
}

// ============================================
// Schedule Break Period Validation
// ============================================

export interface BreakPeriodInput {
  name: string;
  startTime: string;
  endTime: string;
  isFlexible: boolean;
}

export interface BreakValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorParams?: Record<string, string | number>;
}

/**
 * Validate time format HH:mm
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

/**
 * Kiểm tra xem schedule có phải overnight không (end < start)
 */
export function isOvernightSchedule(
  workStartTime: string,
  workEndTime: string,
): boolean {
  if (!isValidTimeFormat(workStartTime) || !isValidTimeFormat(workEndTime)) {
    return false;
  }

  const startMin = parseTimeToMinutes(workStartTime);
  const endMin = parseTimeToMinutes(workEndTime);

  if (startMin === null || endMin === null) return false;

  return endMin < startMin;
}

/**
 * Kiểm tra break period có nằm trong work hours không
 * Hỗ trợ overnight schedules
 */
export function validateBreakWithinWorkHours(
  breakStart: string,
  breakEnd: string,
  workStart: string,
  workEnd: string,
  isOvernight: boolean,
): BreakValidationResult {
  if (!isValidTimeFormat(breakStart) || !isValidTimeFormat(breakEnd)) {
    return { isValid: false, errorCode: "INVALID_TIME_FORMAT" };
  }

  const breakStartMin = parseTimeToMinutes(breakStart);
  const breakEndMin = parseTimeToMinutes(breakEnd);
  const workStartMin = parseTimeToMinutes(workStart);
  let workEndMin = parseTimeToMinutes(workEnd);

  if (
    breakStartMin === null ||
    breakEndMin === null ||
    workStartMin === null ||
    workEndMin === null
  ) {
    return { isValid: false, errorCode: "INVALID_TIME_FORMAT" };
  }

  // Nếu overnight, work end được cộng thêm 24h
  if (isOvernight) {
    workEndMin += 24 * 60;
  }

  // Normalize break times cho overnight schedule
  let normalizedBreakStart = breakStartMin;
  let normalizedBreakEnd = breakEndMin;

  if (isOvernight) {
    // Nếu break start trước work start (tức là sau nửa đêm)
    if (breakStartMin < workStartMin) {
      normalizedBreakStart += 24 * 60;
    }
    // Nếu break end trước break start (break qua nửa đêm)
    if (breakEndMin <= breakStartMin) {
      normalizedBreakEnd += 24 * 60;
    }
  }

  // Kiểm tra break nằm trong work hours
  if (normalizedBreakStart < workStartMin) {
    return {
      isValid: false,
      errorCode: "BREAK_STARTS_BEFORE_WORK",
      errorParams: { breakStart, workStart },
    };
  }

  if (normalizedBreakEnd > workEndMin) {
    return {
      isValid: false,
      errorCode: "BREAK_ENDS_AFTER_WORK",
      errorParams: { breakEnd, workEnd },
    };
  }

  // Kiểm tra break start trước break end
  if (normalizedBreakStart >= normalizedBreakEnd) {
    return {
      isValid: false,
      errorCode: "BREAK_START_AFTER_END",
      errorParams: { breakStart, breakEnd },
    };
  }

  return { isValid: true };
}

/**
 * Kiểm tra 2 break periods có overlap không
 */
export function validateBreakPeriodsNoOverlap(
  period1Start: string,
  period1End: string,
  period2Start: string,
  period2End: string,
  isOvernight: boolean,
): BreakValidationResult {
  let start1 = parseTimeToMinutes(period1Start);
  let end1 = parseTimeToMinutes(period1End);
  let start2 = parseTimeToMinutes(period2Start);
  let end2 = parseTimeToMinutes(period2End);

  if (start1 === null || end1 === null || start2 === null || end2 === null) {
    return { isValid: false, errorCode: "INVALID_TIME_FORMAT" };
  }

  // Normalize cho overnight
  if (isOvernight) {
    if (end1 < start1) end1 += 24 * 60;
    if (end2 < start2) end2 += 24 * 60;
    if (start1 < 12 * 60 && end1 > 12 * 60) start1 += 24 * 60;
    if (start2 < 12 * 60 && end2 > 12 * 60) start2 += 24 * 60;
  }

  // Kiểm tra overlap
  const hasOverlap = start1 < end2 && start2 < end1;

  if (hasOverlap) {
    return {
      isValid: false,
      errorCode: "BREAK_PERIODS_OVERLAP",
      errorParams: {
        period1: `${period1Start}-${period1End}`,
        period2: `${period2Start}-${period2End}`,
      },
    };
  }

  return { isValid: true };
}

/**
 * Validate tất cả break periods
 */
export function validateAllBreakPeriods(
  breakPeriods: BreakPeriodInput[],
  workStart: string,
  workEnd: string,
  isOvernight: boolean,
  minBreakMinutes?: number,
): BreakValidationResult[] {
  const results: BreakValidationResult[] = [];

  // Validate từng break period
  for (let i = 0; i < breakPeriods.length; i++) {
    const period = breakPeriods[i];

    // Validate within work hours
    const withinWorkResult = validateBreakWithinWorkHours(
      period.startTime,
      period.endTime,
      workStart,
      workEnd,
      isOvernight,
    );

    if (!withinWorkResult.isValid) {
      results.push({
        ...withinWorkResult,
        errorParams: { ...withinWorkResult.errorParams, index: i },
      });
    }

    // Validate không overlap với các break khác
    for (let j = i + 1; j < breakPeriods.length; j++) {
      const otherPeriod = breakPeriods[j];
      const overlapResult = validateBreakPeriodsNoOverlap(
        period.startTime,
        period.endTime,
        otherPeriod.startTime,
        otherPeriod.endTime,
        isOvernight,
      );

      if (!overlapResult.isValid) {
        results.push({
          ...overlapResult,
          errorParams: { ...overlapResult.errorParams, index1: i, index2: j },
        });
      }
    }
  }

  // Validate tổng thời gian nghỉ nếu có minimum
  if (minBreakMinutes !== undefined && minBreakMinutes > 0) {
    const totalBreakMinutes = calculateBreakDuration(breakPeriods, isOvernight);
    if (totalBreakMinutes < minBreakMinutes) {
      results.push({
        isValid: false,
        errorCode: "BREAK_MINIMUM_NOT_MET",
        errorParams: { required: minBreakMinutes, actual: totalBreakMinutes },
      });
    }
  }

  return results;
}

/**
 * Tính tổng thời gian nghỉ từ các break periods
 */
export function calculateBreakDuration(
  breakPeriods: BreakPeriodInput[],
  isOvernight: boolean,
): number {
  let totalMinutes = 0;

  for (const period of breakPeriods) {
    const startMin = parseTimeToMinutes(period.startTime);
    let endMin = parseTimeToMinutes(period.endTime);

    if (startMin === null || endMin === null) continue;

    // Normalize cho overnight
    if (isOvernight && endMin < startMin) {
      endMin += 24 * 60;
    }

    totalMinutes += endMin - startMin;
  }

  return totalMinutes;
}
