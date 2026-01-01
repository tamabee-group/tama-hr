// Configuration Types cho hệ thống chấm công và tính lương
// Dựa trên design document

import {
  RoundingInterval,
  RoundingDirection,
  SalaryType,
  AllowanceType,
  DeductionType,
  BreakType,
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
  requireDeviceRegistration: boolean;
  requireGeoLocation: boolean;
  geoFenceRadiusMeters: number;
  allowMobileCheckIn: boolean;
  allowWebCheckIn: boolean;
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

export interface BreakPeriod {
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isFlexible: boolean;
  order: number;
}

export interface BreakConfig {
  breakEnabled: boolean;
  breakType: BreakType;
  defaultBreakMinutes: number;
  minimumBreakMinutes: number;
  maximumBreakMinutes: number;
  useLegalMinimum: boolean;
  breakTrackingEnabled: boolean;
  locale: string;
  fixedBreakMode: boolean;
  breakPeriodsPerAttendance: number;
  fixedBreakPeriods: BreakPeriod[];
  maxBreaksPerDay: number; // Giới hạn số lần nghỉ trong ngày
  // Night shift configuration
  nightShiftStartTime: string; // "22:00"
  nightShiftEndTime: string; // "05:00"
  nightShiftMinimumBreakMinutes: number;
  nightShiftDefaultBreakMinutes: number;
}

// ============================================
// Allowance Configuration
// ============================================

export interface AllowanceCondition {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in";
  value: string | number | string[] | number[];
}

export interface AllowanceRule {
  id?: string;
  code?: string;
  name: string;
  type: AllowanceType;
  amount: number;
  taxable: boolean;
  order?: number;
  condition?: AllowanceCondition;
}

export interface AllowanceConfig {
  allowances: AllowanceRule[];
}

// ============================================
// Deduction Configuration
// ============================================

export interface DeductionRule {
  id?: string;
  code?: string;
  name: string;
  type: DeductionType;
  amount?: number;
  percentage?: number;
  order: number;
}

export interface DeductionConfig {
  deductions: DeductionRule[];
  enableLatePenalty: boolean;
  latePenaltyPerMinute: number;
  enableEarlyLeavePenalty: boolean;
  earlyLeavePenaltyPerMinute: number;
  enableAbsenceDeduction: boolean;
}

// ============================================
// Company Settings (Combined)
// ============================================

export interface CompanySettings {
  attendanceConfig: AttendanceConfig;
  payrollConfig: PayrollConfig;
  overtimeConfig: OvertimeConfig;
  breakConfig: BreakConfig;
  allowanceConfig: AllowanceConfig;
  deductionConfig: DeductionConfig;
}
