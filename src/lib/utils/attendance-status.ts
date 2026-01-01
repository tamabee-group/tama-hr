/**
 * Utility functions cho tính toán Attendance Status
 * Dùng để xác định trạng thái chấm công dựa trên thời gian check-in/out và grace periods
 */

// ============================================
// Types
// ============================================

export interface AttendanceStatusInput {
  /** Thời gian check-in (ISO string hoặc HH:mm) */
  checkInTime?: string;
  /** Thời gian check-out (ISO string hoặc HH:mm) */
  checkOutTime?: string;
  /** Thời gian bắt đầu làm việc theo lịch (HH:mm) */
  scheduledStartTime: string;
  /** Thời gian kết thúc làm việc theo lịch (HH:mm) */
  scheduledEndTime: string;
  /** Số phút grace period cho đi muộn */
  lateGraceMinutes: number;
  /** Số phút grace period cho về sớm */
  earlyLeaveGraceMinutes: number;
}

export interface AttendanceStatusResult {
  /** Số phút đi muộn (0 nếu không muộn) */
  lateMinutes: number;
  /** Số phút về sớm (0 nếu không về sớm) */
  earlyLeaveMinutes: number;
  /** Có đi muộn không (sau khi áp dụng grace period) */
  isLate: boolean;
  /** Có về sớm không (sau khi áp dụng grace period) */
  isEarlyLeave: boolean;
}

// ============================================
// Utilities
// ============================================

/**
 * Parse time string (HH:mm hoặc ISO) thành số phút từ 00:00
 */
export function parseTimeToMinutes(time: string): number {
  if (!time) return -1;

  let hours: number;
  let minutes: number;

  // Nếu là ISO string (có chứa T)
  if (time.includes("T")) {
    const date = new Date(time);
    if (isNaN(date.getTime())) return -1;
    hours = date.getHours();
    minutes = date.getMinutes();
  } else {
    // Nếu là HH:mm format
    const parts = time.split(":");
    if (parts.length < 2) return -1;
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
  }

  if (isNaN(hours) || isNaN(minutes)) return -1;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1;

  return hours * 60 + minutes;
}

/**
 * Tính toán attendance status dựa trên thời gian check-in/out và grace periods
 *
 * Property 5: Attendance Status Consistency
 * For any attendance record displayed, the status (late, early departure)
 * SHALL be consistent with the check-in/check-out times and the configured grace periods.
 */
export function calculateAttendanceStatus(
  input: AttendanceStatusInput,
): AttendanceStatusResult {
  const {
    checkInTime,
    checkOutTime,
    scheduledStartTime,
    scheduledEndTime,
    lateGraceMinutes,
    earlyLeaveGraceMinutes,
  } = input;

  let lateMinutes = 0;
  let earlyLeaveMinutes = 0;

  // Parse scheduled times
  const scheduledStartMinutes = parseTimeToMinutes(scheduledStartTime);
  const scheduledEndMinutes = parseTimeToMinutes(scheduledEndTime);

  // Tính late minutes
  if (checkInTime) {
    const checkInMinutes = parseTimeToMinutes(checkInTime);
    if (checkInMinutes >= 0 && scheduledStartMinutes >= 0) {
      const diff = checkInMinutes - scheduledStartMinutes;
      if (diff > 0) {
        lateMinutes = diff;
      }
    }
  }

  // Tính early leave minutes
  if (checkOutTime) {
    const checkOutMinutes = parseTimeToMinutes(checkOutTime);
    if (checkOutMinutes >= 0 && scheduledEndMinutes >= 0) {
      const diff = scheduledEndMinutes - checkOutMinutes;
      if (diff > 0) {
        earlyLeaveMinutes = diff;
      }
    }
  }

  // Áp dụng grace periods để xác định isLate và isEarlyLeave
  const isLate = lateMinutes > lateGraceMinutes;
  const isEarlyLeave = earlyLeaveMinutes > earlyLeaveGraceMinutes;

  return {
    lateMinutes,
    earlyLeaveMinutes,
    isLate,
    isEarlyLeave,
  };
}

/**
 * Kiểm tra tính nhất quán của attendance status
 * Trả về true nếu status nhất quán với thời gian và grace periods
 */
export function isAttendanceStatusConsistent(
  displayedLateMinutes: number,
  displayedEarlyLeaveMinutes: number,
  displayedIsLate: boolean,
  displayedIsEarlyLeave: boolean,
  input: AttendanceStatusInput,
): boolean {
  const calculated = calculateAttendanceStatus(input);

  // Kiểm tra late minutes
  if (displayedLateMinutes !== calculated.lateMinutes) {
    return false;
  }

  // Kiểm tra early leave minutes
  if (displayedEarlyLeaveMinutes !== calculated.earlyLeaveMinutes) {
    return false;
  }

  // Kiểm tra isLate flag
  if (displayedIsLate !== calculated.isLate) {
    return false;
  }

  // Kiểm tra isEarlyLeave flag
  if (displayedIsEarlyLeave !== calculated.isEarlyLeave) {
    return false;
  }

  return true;
}
