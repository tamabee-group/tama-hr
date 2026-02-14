// Record Types cho hệ thống chấm công và tính lương
// Dựa trên design document

import {
  AttendanceStatus,
  PaymentStatus,
  AdjustmentStatus,
  SelectionStatus,
  ScheduleType,
  SalaryType,
  LeaveType,
  LeaveStatus,
  BreakType,
  ShiftAssignmentStatus,
  SwapRequestStatus,
  PayrollPeriodStatus,
  PayrollItemStatus,
  ContractType,
  ContractStatus,
  AllowanceType,
  DeductionType,
} from "./attendance-enums";

// ============================================
// Applied Settings Snapshot (Cấu hình áp dụng tại thời điểm chấm công)
// ============================================

export interface RoundingConfig {
  interval: string;
  direction: string;
}

export interface BreakConfigSnapshot {
  breakType: BreakType;
  minimumBreakMinutes: number;
  maximumBreakMinutes: number;
  maxBreaksPerDay: number;
  legalMinimumBreakMinutes: number;
}

export interface AppliedSettingsSnapshot {
  checkInRounding: RoundingConfig;
  checkOutRounding: RoundingConfig;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  breakConfig: BreakConfigSnapshot;
}

// ============================================
// Shift Info (Thông tin ca làm việc)
// ============================================

export interface ShiftInfo {
  shiftTemplateId?: number;
  shiftId?: number;
  shiftName: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  multiplier?: number;
}

// ============================================
// Break Record
// ============================================

export interface BreakRecord {
  id: number;
  attendanceRecordId?: number;
  employeeId?: number;
  workDate?: string;
  breakNumber: number;
  breakStart?: string;
  breakEnd?: string;
  actualBreakMinutes?: number;
  effectiveBreakMinutes?: number;
  notes?: string;
  isActive?: boolean;
  // Location info
  breakStartLatitude?: number;
  breakStartLongitude?: number;
  breakEndLatitude?: number;
  breakEndLongitude?: number;
}

// ============================================
// Attendance Record
// ============================================

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  companyId?: number;
  workDate: string;
  originalCheckIn?: string;
  originalCheckOut?: string;
  roundedCheckIn?: string;
  roundedCheckOut?: string;
  workingMinutes: number;
  overtimeMinutes: number;
  nightMinutes?: number;
  nightOvertimeMinutes?: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  netWorkingMinutes?: number;
  totalBreakMinutes: number;
  effectiveBreakMinutes?: number;
  breakType?: BreakType;
  breakCompliant?: boolean;
  isBreakCompliant?: boolean;
  status: AttendanceStatus;
  breakRecords?: BreakRecord[];
  shiftInfo?: ShiftInfo;
  appliedSettings?: AppliedSettingsSnapshot;
  // Location info
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  adjustmentReason?: string;
  adjustedBy?: number;
  adjustedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Unified Attendance Record (Alias for AttendanceRecord with full data)
// ============================================

export interface UnifiedAttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  workDate: string;
  originalCheckIn?: string;
  originalCheckOut?: string;
  roundedCheckIn?: string;
  roundedCheckOut?: string;
  workingMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  nightOvertimeMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  netWorkingMinutes: number;
  totalBreakMinutes: number;
  effectiveBreakMinutes: number;
  breakType: BreakType;
  breakCompliant: boolean;
  breakRecords: BreakRecord[];
  status: AttendanceStatus;
  appliedSettings: AppliedSettingsSnapshot;
  shiftInfo?: ShiftInfo;
  // Location info
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
}

// ============================================
// Allowance & Deduction Items
// ============================================

export interface AllowanceItem {
  code: string;
  name: string;
  amount: number;
  taxable: boolean;
}

export interface DeductionItem {
  code: string;
  name: string;
  amount: number;
}

// ============================================
// Payroll Record
// ============================================

export interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  salaryType: SalaryType;
  baseSalary: number;
  workingDays?: number;
  workingHours?: number;
  // Overtime breakdown
  regularMinutes: number;
  regularOvertimeMinutes: number;
  nightMinutes: number;
  nightOvertimeMinutes: number;
  holidayMinutes?: number;
  holidayNightMinutes?: number;
  regularOvertimePay: number;
  nightWorkPay: number;
  nightOvertimePay: number;
  holidayOvertimePay: number;
  holidayNightOvertimePay: number;
  totalOvertimePay: number;
  // Break info
  totalBreakMinutes: number;
  breakType: BreakType;
  breakDeductionAmount: number;
  // Allowances & Deductions
  allowanceDetails: AllowanceItem[];
  totalAllowances: number;
  deductionDetails: DeductionItem[];
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  status: PayrollPeriodStatus;
  paymentStatus: PaymentStatus;
  paidAt?: string;
}

// ============================================
// Payroll Summary
// ============================================

export interface PayrollSummary {
  totalEmployees: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalOvertimePay: number;
  totalAllowances: number;
  totalDeductions: number;
  pendingCount: number;
  paidCount: number;
  failedCount: number;
}

// ============================================
// Break Item Response (Chi tiết điều chỉnh break)
// ============================================

export interface BreakItemResponse {
  id: number;
  breakRecordId?: number; // NULL khi actionType = CREATE
  breakNumber?: number;
  actionType: "ADJUST" | "DELETE" | "CREATE";
  originalBreakStart?: string;
  originalBreakEnd?: string;
  requestedBreakStart?: string;
  requestedBreakEnd?: string;
  createdAt?: string;
}

// ============================================
// Adjustment Request
// ============================================

export interface AdjustmentRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  attendanceRecordId: number;
  workDate: string;
  requestType?: "ADJUST" | "DELETE_RECORD"; // Loại yêu cầu
  // Người được gán xử lý
  assignedTo?: number;
  assignedToName?: string;
  // Check in/out times
  originalCheckIn?: string;
  originalCheckOut?: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  // Break items (nhiều break trong 1 request)
  breakItems?: BreakItemResponse[];
  // Tất cả break records của ngày (để người duyệt có cái nhìn đầy đủ)
  allBreakRecords?: BreakRecord[];
  reason: string;
  status: AdjustmentStatus;
  approvedBy?: number;
  approverName?: string;
  approvedAt?: string;
  approverComment?: string;
  rejectionReason?: string;
  createdAt: string;
}

// ============================================
// Break Adjustment Request
// ============================================

export interface BreakAdjustmentRequest {
  breakRecordId: number;
  requestedBreakStart?: string;
  requestedBreakEnd?: string;
  reason: string;
}

// ============================================
// Work Schedule
// ============================================

export interface ScheduleData {
  // FIXED_HOURS type
  defaultStartTime?: string | null;
  defaultEndTime?: string | null;
  defaultBreakMinutes?: number | null;

  // FLEXIBLE type
  flexibleStartRange?: string | null;
  flexibleEndRange?: string | null;

  // SHIFT type
  shifts?:
    | {
        name: string;
        startTime: string;
        endTime: string;
      }[]
    | null;

  // Common fields
  breakPeriods?:
    | {
        name: string;
        startTime: string;
        endTime: string;
        durationMinutes: number;
        isFlexible: boolean;
        order?: number | null;
      }[]
    | null;

  dailySchedules?: Record<string, unknown> | null; // For future use
  totalBreakMinutes?: number | null;

  // Legacy fields (for backward compatibility)
  workStartTime?: string;
  workEndTime?: string;
  breakMinutes?: number;
}

export interface WorkSchedule {
  id: number;
  companyId: number;
  name: string;
  type: ScheduleType;
  isDefault: boolean;
  scheduleData: ScheduleData;
  assignmentCount: number;
}

export interface WorkScheduleInput {
  name: string;
  type: ScheduleType;
  isDefault: boolean;
  scheduleData: ScheduleData;
}

// ============================================
// Schedule Selection
// ============================================

export interface ScheduleSelection {
  id: number;
  employeeId: number;
  scheduleId: number;
  scheduleName: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: SelectionStatus;
  createdAt: string;
}

// ============================================
// Schedule Assignment
// ============================================

export interface ScheduleAssignment {
  id: number;
  scheduleId: number;
  employeeId: number;
  employeeName: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

// ============================================
// Leave Request
// ============================================

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: number;
  approverName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

// ============================================
// Leave Balance
// ============================================

export interface LeaveBalance {
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
}

// ============================================
// Holiday
// ============================================

export interface Holiday {
  id: number;
  companyId: number;
  name: string;
  date: string;
  isNational: boolean;
  description?: string;
}

export interface HolidayInput {
  name: string;
  date: string;
  isNational: boolean;
  description?: string;
}

// ============================================
// Attendance Summary
// ============================================

export interface AttendanceSummary {
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  holidayDays: number;
  totalWorkingMinutes: number;
  totalOvertimeMinutes: number;
  totalLateMinutes: number;
  totalEarlyLeaveMinutes: number;
  totalBreakMinutes: number;
}

// ============================================
// Year Month Type
// ============================================

export interface YearMonth {
  year: number;
  month: number;
}

// ============================================
// Shift Template (Mẫu ca làm việc)
// ============================================

export interface ShiftTemplate {
  id: number;
  companyId: number;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  multiplier: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShiftTemplateInput {
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  multiplier: number;
  description?: string;
  isActive?: boolean;
}

// ============================================
// Shift Assignment (Phân công ca làm việc)
// ============================================

export interface ShiftAssignment {
  id: number;
  employeeId: number;
  employeeName: string;
  shiftTemplateId: number;
  shiftTemplate?: ShiftTemplate;
  shiftName?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  workDate: string;
  status: ShiftAssignmentStatus;
  swappedWithEmployeeId?: number;
  swappedWithEmployeeName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShiftAssignmentInput {
  employeeId: number;
  shiftTemplateId: number;
  workDate: string;
}

// ============================================
// Shift Swap Request (Yêu cầu đổi ca)
// ============================================

export interface ShiftSwapRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterShift: ShiftAssignment;
  targetEmployeeId: number;
  targetEmployeeName: string;
  targetShift: ShiftAssignment;
  reason?: string;
  status: SwapRequestStatus;
  approvedBy?: number;
  approverName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ShiftSwapRequestInput {
  requesterShiftId: number;
  targetShiftId: number;
  reason?: string;
}

// ============================================
// Employee Salary Config (Cấu hình lương nhân viên)
// ============================================

export interface EmployeeSalaryConfig {
  id: number;
  employeeId: number;
  employeeName?: string;
  salaryType: SalaryType;
  monthlySalary?: number;
  dailyRate?: number;
  hourlyRate?: number;
  shiftRate?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive?: boolean;
  usedInPayroll?: boolean;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSalaryConfigInput {
  salaryType: SalaryType;
  monthlySalary?: number;
  dailyRate?: number;
  hourlyRate?: number;
  shiftRate?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  note?: string;
}

// ============================================
// Employee Allowance (Phụ cấp cá nhân)
// ============================================

export interface EmployeeAllowance {
  id: number;
  employeeId: number;
  employeeName?: string;
  allowanceCode: string;
  allowanceName: string;
  allowanceType: AllowanceType;
  amount: number;
  taxable: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  isOverride: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeAllowanceInput {
  allowanceCode: string;
  allowanceName: string;
  allowanceType: AllowanceType;
  amount: number;
  taxable: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

// ============================================
// Employee Deduction (Khấu trừ cá nhân)
// ============================================

export interface EmployeeDeduction {
  id: number;
  employeeId: number;
  employeeName?: string;
  deductionCode: string;
  deductionName: string;
  deductionType: DeductionType;
  amount?: number;
  percentage?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  isOverride: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeDeductionInput {
  deductionCode: string;
  deductionName: string;
  deductionType: DeductionType;
  amount?: number;
  percentage?: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

// ============================================
// Payroll Period (Kỳ lương)
// ============================================

export interface PayrollPeriod {
  id: number;
  companyId: number;
  periodStart: string;
  periodEnd: string;
  year: number;
  month: number;
  status: PayrollPeriodStatus;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalEmployees: number;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: number;
  approverName?: string;
  paidAt?: string;
  paymentReference?: string;
  rejectionReason?: string;
  totalBaseSalary?: number;
  totalOvertimePay?: number;
  totalAllowances?: number;
  totalDeductions?: number;
}

export interface PayrollPeriodInput {
  periodStart: string;
  periodEnd: string;
}

// ============================================
// Payroll Item (Chi tiết lương nhân viên trong kỳ)
// ============================================

export interface PayrollItem {
  id: number;
  payrollPeriodId: number;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
  year?: number;
  month?: number;
  paidAt?: string;
  salaryType: SalaryType;
  baseSalary: number;
  calculatedBaseSalary: number;
  workingDays: number;
  workingHours: number;
  workingMinutes: number;
  // Overtime breakdown
  regularOvertimeMinutes: number;
  nightOvertimeMinutes: number;
  holidayOvertimeMinutes: number;
  weekendOvertimeMinutes: number;
  regularOvertimePay: number;
  nightOvertimePay: number;
  holidayOvertimePay: number;
  weekendOvertimePay: number;
  totalOvertimePay: number;
  // Break
  totalBreakMinutes: number;
  breakType: BreakType;
  breakDeductionAmount: number;
  // Allowances & Deductions
  allowanceDetails: AllowanceItem[];
  totalAllowances: number;
  deductionDetails: DeductionItem[];
  totalDeductions: number;
  // Totals
  grossSalary: number;
  netSalary: number;
  // Adjustment
  adjustmentAmount?: number;
  adjustmentReason?: string;
  status: PayrollItemStatus;
}

// ============================================
// Payroll Adjustment (Điều chỉnh lương)
// ============================================

export interface PayrollAdjustment {
  id: number;
  payrollItemId: number;
  amount: number;
  reason: string;
  adjustedBy: number;
  adjusterName: string;
  adjustedAt: string;
}

export interface PayrollAdjustmentInput {
  amount: number;
  reason: string;
}

// ============================================
// Employment Contract (Hợp đồng lao động)
// ============================================

export interface EmploymentContract {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
  employeeEmail?: string;
  contractType: ContractType;
  contractNumber: string;
  startDate: string;
  endDate: string;
  salaryConfigId?: number;
  status: ContractStatus;
  terminationReason?: string;
  terminatedAt?: string;
  terminatedBy?: number;
  terminatorName?: string;
  notes?: string;
  daysUntilExpiry?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmploymentContractInput {
  contractType: ContractType;
  startDate: string;
  endDate?: string;
  salaryConfigId?: number;
  notes?: string;
}
