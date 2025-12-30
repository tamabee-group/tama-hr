"use client";

import { cn } from "@/lib/utils";
import {
  DepositStatus,
  DEPOSIT_STATUS_LABELS,
  DEPOSIT_STATUS_COLORS,
  CommissionStatus,
  COMMISSION_STATUS_LABELS,
  COMMISSION_STATUS_COLORS,
} from "@/types/enums";

// Định nghĩa các variant màu sắc cho badge
export type BadgeVariant =
  | "warning"
  | "success"
  | "destructive"
  | "default"
  | "info";

// Mapping variant sang class CSS
const variantClasses: Record<BadgeVariant, string> = {
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  destructive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

// Hàm lấy variant từ DepositStatus - export để test
export function getDepositStatusVariant(status: DepositStatus): BadgeVariant {
  return DEPOSIT_STATUS_COLORS[status] || "default";
}

// Hàm lấy variant từ CommissionStatus - export để test
export function getCommissionStatusVariant(
  status: CommissionStatus,
): BadgeVariant {
  return COMMISSION_STATUS_COLORS[status] || "default";
}

// Hàm lấy class CSS từ variant - export để test
export function getVariantClass(variant: BadgeVariant): string {
  return variantClasses[variant];
}

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// Base StatusBadge component
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

// Deposit Status Badge - component tiện lợi cho deposit status
interface DepositStatusBadgeProps {
  status: DepositStatus;
  locale?: "vi" | "en" | "ja";
  className?: string;
}

export function DepositStatusBadge({
  status,
  locale = "vi",
  className,
}: DepositStatusBadgeProps) {
  const variant = getDepositStatusVariant(status);
  const label = DEPOSIT_STATUS_LABELS[status]?.[locale] || status;

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}

// Commission Status Badge - component tiện lợi cho commission status
interface CommissionStatusBadgeProps {
  status: CommissionStatus;
  locale?: "vi" | "en" | "ja";
  className?: string;
}

export function CommissionStatusBadge({
  status,
  locale = "vi",
  className,
}: CommissionStatusBadgeProps) {
  const variant = getCommissionStatusVariant(status);
  const label = COMMISSION_STATUS_LABELS[status]?.[locale] || status;

  return (
    <StatusBadge variant={variant} className={className}>
      {label}
    </StatusBadge>
  );
}
