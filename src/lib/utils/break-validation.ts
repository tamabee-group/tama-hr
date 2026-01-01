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
