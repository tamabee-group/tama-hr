"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  DepositStatus,
  DEPOSIT_STATUS_COLORS,
  CommissionStatus,
  COMMISSION_STATUS_COLORS,
} from "@/types/enums";
import {
  AttendanceStatus,
  ATTENDANCE_STATUS_COLORS,
  PayrollStatus,
  PAYROLL_STATUS_COLORS,
  PaymentStatus,
  PAYMENT_STATUS_COLORS,
  AdjustmentStatus,
  ADJUSTMENT_STATUS_COLORS,
  SelectionStatus,
  SELECTION_STATUS_COLORS,
  ScheduleType,
  SCHEDULE_TYPE_COLORS,
  LeaveType,
  LEAVE_TYPE_COLORS,
  LeaveStatus,
  LEAVE_STATUS_COLORS,
  PayrollItemStatus,
  PAYROLL_ITEM_STATUS_COLORS,
} from "@/types/attendance-enums";

// Định nghĩa các variant màu sắc cho badge
export type BadgeVariant =
  | "warning"
  | "success"
  | "destructive"
  | "default"
  | "info"
  | "secondary";

// Mapping variant sang class CSS
const variantClasses: Record<BadgeVariant, string> = {
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  destructive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  secondary:
    "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

// ============================================
// Variant getter functions - export để test
// ============================================

export function getDepositStatusVariant(status: DepositStatus): BadgeVariant {
  return DEPOSIT_STATUS_COLORS[status] || "default";
}

export function getCommissionStatusVariant(
  status: CommissionStatus,
): BadgeVariant {
  return COMMISSION_STATUS_COLORS[status] || "default";
}

export function getAttendanceStatusVariant(
  status: AttendanceStatus,
): BadgeVariant {
  return ATTENDANCE_STATUS_COLORS[status] || "default";
}

export function getPayrollStatusVariant(status: PayrollStatus): BadgeVariant {
  return PAYROLL_STATUS_COLORS[status] || "default";
}

export function getPayrollItemStatusVariant(
  status: PayrollItemStatus,
): BadgeVariant {
  return PAYROLL_ITEM_STATUS_COLORS[status] || "default";
}

export function getPaymentStatusVariant(status: PaymentStatus): BadgeVariant {
  return PAYMENT_STATUS_COLORS[status] || "default";
}

export function getAdjustmentStatusVariant(
  status: AdjustmentStatus,
): BadgeVariant {
  return ADJUSTMENT_STATUS_COLORS[status] || "default";
}

export function getSelectionStatusVariant(
  status: SelectionStatus,
): BadgeVariant {
  return SELECTION_STATUS_COLORS[status] || "default";
}

export function getScheduleTypeVariant(type: ScheduleType): BadgeVariant {
  return SCHEDULE_TYPE_COLORS[type] || "default";
}

export function getLeaveTypeVariant(type: LeaveType): BadgeVariant {
  return LEAVE_TYPE_COLORS[type] || "default";
}

export function getLeaveStatusVariant(status: LeaveStatus): BadgeVariant {
  return LEAVE_STATUS_COLORS[status] || "default";
}

// Hàm lấy class CSS từ variant - export để test
export function getVariantClass(variant: BadgeVariant): string {
  return variantClasses[variant];
}

// ============================================
// Base StatusBadge Component
// ============================================

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({
  variant,
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ============================================
// Deposit Status Badge
// ============================================

interface DepositStatusBadgeProps {
  status: DepositStatus;
  className?: string;
}

export function DepositStatusBadge({
  status,
  className,
}: DepositStatusBadgeProps) {
  const tEnums = useTranslations("enums");
  const variant = getDepositStatusVariant(status);
  const label = tEnums(`depositStatus.${status}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Commission Status Badge
// ============================================

interface CommissionStatusBadgeProps {
  status: CommissionStatus;
  className?: string;
}

export function CommissionStatusBadge({
  status,
  className,
}: CommissionStatusBadgeProps) {
  const tEnums = useTranslations("enums");
  const variant = getCommissionStatusVariant(status);
  const label = tEnums(`commissionStatus.${status}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Attendance Status Badge
// ============================================

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus | null | undefined;
  className?: string;
}

export function AttendanceStatusBadge({
  status,
  className,
}: AttendanceStatusBadgeProps) {
  const tEnums = useTranslations("enums");

  // Handle null/undefined status
  if (!status) {
    return null;
  }

  const variant = getAttendanceStatusVariant(status);
  const label = tEnums(`attendanceStatus.${status}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Payroll Status Badge
// ============================================

interface PayrollStatusBadgeProps {
  status: PayrollStatus;
  className?: string;
}

export function PayrollStatusBadge({
  status,
  className,
}: PayrollStatusBadgeProps) {
  const tEnums = useTranslations("enums");
  const variant = getPayrollStatusVariant(status);
  const label = tEnums(`payrollStatus.${status}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Payment Status Badge
// ============================================

interface PaymentStatusBadgeProps {
  status: PaymentStatus | null | undefined;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const tEnums = useTranslations("enums");

  // Handle null/undefined status
  if (!status) {
    return (
      <StatusBadge variant="default" className={className}>
        -
      </StatusBadge>
    );
  }

  const variant = getPaymentStatusVariant(status);
  const label = tEnums(`paymentStatus.${status}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Adjustment Status Badge
// ============================================

interface AdjustmentStatusBadgeProps {
  status: AdjustmentStatus;
  className?: string;
}

export function AdjustmentStatusBadge({
  status,
  className,
}: AdjustmentStatusBadgeProps) {
  const tEnums = useTranslations("enums");
  const variant = getAdjustmentStatusVariant(status);
  const label = tEnums(`adjustmentStatus.${status}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Selection Status Badge
// ============================================

interface SelectionStatusBadgeProps {
  status: SelectionStatus;
  className?: string;
}

export function SelectionStatusBadge({
  status,
  className,
}: SelectionStatusBadgeProps) {
  const tEnums = useTranslations("enums");
  const variant = getSelectionStatusVariant(status);
  const label = tEnums(`selectionStatus.${status}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Schedule Type Badge
// ============================================

interface ScheduleTypeBadgeProps {
  type: ScheduleType;
  className?: string;
}

export function ScheduleTypeBadge({ type, className }: ScheduleTypeBadgeProps) {
  const tEnums = useTranslations("enums");
  const variant = getScheduleTypeVariant(type);
  const label = tEnums(`scheduleType.${type}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Leave Type Badge
// ============================================

interface LeaveTypeBadgeProps {
  type: LeaveType;
  className?: string;
}

export function LeaveTypeBadge({ type, className }: LeaveTypeBadgeProps) {
  const tEnums = useTranslations("enums");
  const variant = getLeaveTypeVariant(type);
  const label = tEnums(`leaveType.${type}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Leave Status Badge
// ============================================

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

export function LeaveStatusBadge({ status, className }: LeaveStatusBadgeProps) {
  const tEnums = useTranslations("enums");
  const variant = getLeaveStatusVariant(status);
  const label = tEnums(`leaveStatus.${status}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// ============================================
// Payroll Item Status Badge
// ============================================

interface PayrollItemStatusBadgeProps {
  status: PayrollItemStatus;
  className?: string;
}

export function PayrollItemStatusBadge({
  status,
  className,
}: PayrollItemStatusBadgeProps) {
  const tEnums = useTranslations("enums");
  const variant = getPayrollItemStatusVariant(status);
  const label = tEnums(`payrollItemStatus.${status}`);

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}
