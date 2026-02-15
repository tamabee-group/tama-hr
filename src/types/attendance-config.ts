// Configuration Types cho hệ thống chấm công và tính lương
// Dựa trên design document

import {
  RoundingInterval,
  RoundingDirection,
  SalaryType,
} from "./attendance-enums";

// ============================================
// Rounding Configuration
// ============================================

export interface RoundingConfig {
  interval: RoundingInterval;
  direction: RoundingDirection;
}

// ============================================
// Attendance Configuration
// ============================================

export interface AttendanceConfig {
  defaultWorkStartTime: string; // "09:00"
  defaultWorkEndTime: string; // "18:00"
  defaultBreakMinutes: number;
  // Rounding configuration - unified section
  enableRounding: boolean;
  enableCheckInRounding: boolean;
  enableCheckOutRounding: boolean;
  enableBreakStartRounding: boolean;
  enableBreakEndRounding: boolean;
  checkInRounding?: RoundingConfig;
  checkOutRounding?: RoundingConfig;
  breakStartRounding?: RoundingConfig;
  breakEndRounding?: RoundingConfig;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  requireGeoLocation: boolean;
  geoFenceRadiusMeters: number;
  allowMobileCheckIn: boolean;
  allowWebCheckIn: boolean;
  // Cấu hình nghỉ cuối tuần và ngày lễ
  saturdayOff: boolean;
  sundayOff: boolean;
  holidayOff: boolean;
}

// ============================================
// Payroll Configuration
// ============================================

export interface PayrollConfig {
  defaultSalaryType: SalaryType;
  payDay: number;
  cutoffDay: number;
  salaryRounding: RoundingDirection;
  standardWorkingDaysPerMonth: number;
  standardWorkingHoursPerDay: number;
}

// ============================================
// Overtime Configuration
// ============================================

export interface OvertimeMultipliers {
  regularOvertime: number;
  nightWork: number;
  nightOvertime: number;
  holidayOvertime: number;
  holidayNightOvertime: number;
}

export interface LegalOvertimeMinimums {
  ja: OvertimeMultipliers;
  vi: OvertimeMultipliers;
  default: OvertimeMultipliers;
}

export interface OvertimeConfig {
  overtimeEnabled: boolean;
  standardWorkingHours: number;
  nightStartTime: string; // "22:00"
  nightEndTime: string; // "05:00"
  // Overtime multipliers - có thể cấu hình linh hoạt
  regularOvertimeRate: number; // default: 1.25
  nightWorkRate: number; // default: 1.25
  nightOvertimeRate: number; // default: 1.50
  holidayOvertimeRate: number; // default: 1.35
  holidayNightOvertimeRate: number; // default: 1.60
  useLegalMinimum: boolean;
  locale: string; // "ja" | "vi"
  requireApproval: boolean;
  maxOvertimeHoursPerDay: number;
  maxOvertimeHoursPerMonth: number;
}

// ============================================
// Break Configuration
// ============================================

export interface BreakConfig {
  breakEnabled: boolean;
  defaultBreakMinutes: number;
  maxBreaksPerDay: number;
}

// ============================================
// Company Settings (Combined)
// ============================================

export interface CompanySettings {
  attendanceConfig: AttendanceConfig;
  payrollConfig: PayrollConfig;
  overtimeConfig: OvertimeConfig;
  breakConfig: BreakConfig;
}

// ============================================
// Attendance Location
// ============================================

export interface AttendanceLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
