// Enums cho hệ thống chấm công và tính lương
// Chỉ chứa enum values, translations được quản lý trong message files

// ============================================
// Rounding Enums (Làm tròn thời gian)
// ============================================

// Khoảng thời gian làm tròn
export const ROUNDING_INTERVALS = [
  "MINUTES_5",
  "MINUTES_10",
  "MINUTES_15",
  "MINUTES_30",
  "MINUTES_60",
] as const;

export type RoundingInterval = (typeof ROUNDING_INTERVALS)[number];

// Hướng làm tròn
export const ROUNDING_DIRECTIONS = ["UP", "DOWN", "NEAREST"] as const;

export type RoundingDirection = (typeof ROUNDING_DIRECTIONS)[number];

// ============================================
// Salary Enums (Loại lương)
// ============================================

export const SALARY_TYPES = [
  "MONTHLY",
  "DAILY",
  "HOURLY",
  "SHIFT_BASED",
] as const;

export type SalaryType = (typeof SALARY_TYPES)[number];

// ============================================
// Attendance Status Enums (Trạng thái chấm công)
// ============================================

export const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "LEAVE",
  "HOLIDAY",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

// Màu sắc cho attendance status badge
export const ATTENDANCE_STATUS_COLORS: Record<
  AttendanceStatus,
  "success" | "destructive" | "warning" | "info"
> = {
  PRESENT: "success",
  ABSENT: "destructive",
  LEAVE: "warning",
  HOLIDAY: "info",
};

// ============================================
// Payment Status Enums (Trạng thái thanh toán)
// ============================================

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// Màu sắc cho payment status badge
export const PAYMENT_STATUS_COLORS: Record<
  PaymentStatus,
  "warning" | "success" | "destructive"
> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "destructive",
};

// ============================================
// Adjustment Status Enums (Trạng thái yêu cầu điều chỉnh)
// ============================================

export const ADJUSTMENT_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export type AdjustmentStatus = (typeof ADJUSTMENT_STATUSES)[number];

// Màu sắc cho adjustment status badge
export const ADJUSTMENT_STATUS_COLORS: Record<
  AdjustmentStatus,
  "warning" | "success" | "destructive"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

// ============================================
// Selection Status Enums (Trạng thái chọn lịch)
// ============================================

export const SELECTION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export type SelectionStatus = (typeof SELECTION_STATUSES)[number];

// Màu sắc cho selection status badge
export const SELECTION_STATUS_COLORS: Record<
  SelectionStatus,
  "warning" | "success" | "destructive"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

// ============================================
// Schedule Type Enums (Loại lịch làm việc)
// ============================================

export const SCHEDULE_TYPES = ["FIXED", "FLEXIBLE", "SHIFT"] as const;

export type ScheduleType = (typeof SCHEDULE_TYPES)[number];

// Màu sắc cho schedule type badge
export const SCHEDULE_TYPE_COLORS: Record<
  ScheduleType,
  "info" | "success" | "warning"
> = {
  FIXED: "info",
  FLEXIBLE: "success",
  SHIFT: "warning",
};

// ============================================
// Allowance Type Enums (Loại phụ cấp)
// ============================================

export const ALLOWANCE_TYPES = ["FIXED", "CONDITIONAL", "ONE_TIME"] as const;

export type AllowanceType = (typeof ALLOWANCE_TYPES)[number];

// ============================================
// Deduction Type Enums (Loại khấu trừ)
// ============================================

export const DEDUCTION_TYPES = ["FIXED", "PERCENTAGE"] as const;

export type DeductionType = (typeof DEDUCTION_TYPES)[number];

// ============================================
// Leave Type Enums (Loại nghỉ phép)
// ============================================

export const LEAVE_TYPES = [
  "ANNUAL",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "BEREAVEMENT",
  "UNPAID",
  "OTHER",
] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number];

// Màu sắc cho leave type badge
export const LEAVE_TYPE_COLORS: Record<
  LeaveType,
  "info" | "warning" | "success" | "destructive" | "secondary"
> = {
  ANNUAL: "info",
  SICK: "warning",
  MATERNITY: "success",
  PATERNITY: "success",
  BEREAVEMENT: "secondary",
  UNPAID: "destructive",
  OTHER: "secondary",
};

// ============================================
// Leave Status Enums (Trạng thái nghỉ phép)
// ============================================

export const LEAVE_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

// Màu sắc cho leave status badge
export const LEAVE_STATUS_COLORS: Record<
  LeaveStatus,
  "warning" | "success" | "destructive" | "secondary"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  CANCELLED: "secondary",
};

// ============================================
// Break Type Enums (Loại giờ giải lao)
// ============================================

export const BREAK_TYPES = ["PAID", "UNPAID"] as const;

export type BreakType = (typeof BREAK_TYPES)[number];

// ============================================
// Shift Assignment Status Enums (Trạng thái phân công ca)
// ============================================

export const SHIFT_ASSIGNMENT_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "SWAPPED",
  "CANCELLED",
] as const;

export type ShiftAssignmentStatus = (typeof SHIFT_ASSIGNMENT_STATUSES)[number];

export const SHIFT_ASSIGNMENT_STATUS_COLORS: Record<
  ShiftAssignmentStatus,
  "info" | "success" | "warning" | "destructive"
> = {
  SCHEDULED: "info",
  COMPLETED: "success",
  SWAPPED: "warning",
  CANCELLED: "destructive",
};

// ============================================
// Swap Request Status Enums (Trạng thái yêu cầu đổi ca)
// ============================================

export const SWAP_REQUEST_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export type SwapRequestStatus = (typeof SWAP_REQUEST_STATUSES)[number];

export const SWAP_REQUEST_STATUS_COLORS: Record<
  SwapRequestStatus,
  "warning" | "success" | "destructive"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

// ============================================
// Payroll Period Status Enums (Trạng thái kỳ lương)
// ============================================

export const PAYROLL_PERIOD_STATUSES = [
  "DRAFT",
  "REVIEWING",
  "APPROVED",
  "PAID",
] as const;

export type PayrollPeriodStatus = (typeof PAYROLL_PERIOD_STATUSES)[number];

export const PAYROLL_PERIOD_STATUS_COLORS: Record<
  PayrollPeriodStatus,
  "secondary" | "warning" | "info" | "success"
> = {
  DRAFT: "secondary",
  REVIEWING: "warning",
  APPROVED: "info",
  PAID: "success",
};

// ============================================
// Payroll Item Status Enums (Trạng thái chi tiết lương)
// ============================================

export const PAYROLL_ITEM_STATUSES = [
  "CALCULATED",
  "ADJUSTED",
  "CONFIRMED",
] as const;

export type PayrollItemStatus = (typeof PAYROLL_ITEM_STATUSES)[number];

export const PAYROLL_ITEM_STATUS_COLORS: Record<
  PayrollItemStatus,
  "info" | "warning" | "success"
> = {
  CALCULATED: "info",
  ADJUSTED: "warning",
  CONFIRMED: "success",
};

// ============================================
// Contract Type Enums (Loại hợp đồng)
// ============================================

export const CONTRACT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "SEASONAL",
  "CONTRACT",
] as const;

export type ContractType = (typeof CONTRACT_TYPES)[number];

export const CONTRACT_TYPE_COLORS: Record<
  ContractType,
  "info" | "success" | "warning" | "secondary"
> = {
  FULL_TIME: "info",
  PART_TIME: "success",
  SEASONAL: "warning",
  CONTRACT: "secondary",
};

// ============================================
// Contract Status Enums (Trạng thái hợp đồng)
// ============================================

export const CONTRACT_STATUSES = ["ACTIVE", "EXPIRED", "TERMINATED"] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const CONTRACT_STATUS_COLORS: Record<
  ContractStatus,
  "success" | "secondary" | "destructive"
> = {
  ACTIVE: "success",
  EXPIRED: "secondary",
  TERMINATED: "destructive",
};
