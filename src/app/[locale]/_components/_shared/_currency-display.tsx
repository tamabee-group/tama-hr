"use client";

import { cn } from "@/lib/utils";
import {
  formatCurrency,
  type SupportedLocale,
} from "@/lib/utils/format-currency";

// ============================================
// Currency Formatting Utilities
// ============================================

/**
 * Format số tiền với màu sắc dựa trên giá trị
 * - Số dương: màu xanh lá
 * - Số âm: màu đỏ
 * - Số 0: màu mặc định
 */
export function getAmountColorClass(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "";
  if (amount > 0) return "text-green-600 dark:text-green-400";
  if (amount < 0) return "text-red-600 dark:text-red-400";
  return "";
}

/**
 * Format số tiền với dấu + hoặc - phía trước
 */
export function formatCurrencyWithSign(
  amount: number,
  locale: SupportedLocale = "ja",
): string {
  const formatted = formatCurrency(Math.abs(amount), locale);
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

// ============================================
// CurrencyDisplay Component
// ============================================

interface CurrencyDisplayProps {
  /** Số tiền cần hiển thị */
  amount: number | null | undefined;
  /** Locale để format (mặc định: ja cho JPY) */
  locale?: SupportedLocale;
  /** Custom className */
  className?: string;
  /** Hiển thị màu sắc dựa trên giá trị (xanh/đỏ) */
  showColor?: boolean;
  /** Hiển thị dấu + cho số dương */
  showSign?: boolean;
  /** Hiển thị "-" khi không có giá trị */
  showPlaceholder?: boolean;
  /** Placeholder text khi không có giá trị */
  placeholder?: string;
}

/**
 * Component hiển thị số tiền theo locale (mặc định JPY)
 * Hỗ trợ màu sắc và dấu +/- tùy chọn
 */
export function CurrencyDisplay({
  amount,
  locale = "ja",
  className,
  showColor = false,
  showSign = false,
  showPlaceholder = true,
  placeholder = "-",
}: CurrencyDisplayProps) {
  // Xử lý trường hợp không có giá trị
  if (amount === null || amount === undefined) {
    if (!showPlaceholder) return null;
    return <span className={cn("tabular-nums", className)}>{placeholder}</span>;
  }

  // Format số tiền
  let displayAmount: string;
  if (showSign) {
    displayAmount = formatCurrencyWithSign(amount, locale);
  } else {
    displayAmount = formatCurrency(amount, locale);
  }

  // Xác định màu sắc
  const colorClass = showColor ? getAmountColorClass(amount) : "";

  return (
    <span className={cn("tabular-nums", colorClass, className)}>
      {displayAmount}
    </span>
  );
}

// ============================================
// SalaryDisplay Component
// ============================================

interface SalaryDisplayProps {
  /** Số tiền lương */
  amount: number | null | undefined;
  /** Locale để format (mặc định: ja cho JPY) */
  locale?: SupportedLocale;
  /** Custom className */
  className?: string;
  /** Hiển thị "-" khi không có giá trị */
  showPlaceholder?: boolean;
}

/**
 * Component hiển thị lương (luôn màu xanh lá)
 */
export function SalaryDisplay({
  amount,
  locale = "ja",
  className,
  showPlaceholder = true,
}: SalaryDisplayProps) {
  if (amount === null || amount === undefined) {
    if (!showPlaceholder) return null;
    return <span className={cn("tabular-nums", className)}>-</span>;
  }

  const displayAmount = formatCurrency(amount, locale);

  return (
    <span
      className={cn(
        "tabular-nums text-green-600 dark:text-green-400 font-medium",
        className,
      )}
    >
      {displayAmount}
    </span>
  );
}

// ============================================
// DeductionDisplay Component
// ============================================

interface DeductionDisplayProps {
  /** Số tiền khấu trừ (số dương sẽ hiển thị với dấu -) */
  amount: number | null | undefined;
  /** Locale để format (mặc định: ja cho JPY) */
  locale?: SupportedLocale;
  /** Custom className */
  className?: string;
  /** Hiển thị "-" khi không có giá trị */
  showPlaceholder?: boolean;
}

/**
 * Component hiển thị khấu trừ (luôn màu đỏ với dấu -)
 */
export function DeductionDisplay({
  amount,
  locale = "ja",
  className,
  showPlaceholder = true,
}: DeductionDisplayProps) {
  if (amount === null || amount === undefined || amount === 0) {
    if (!showPlaceholder) return null;
    return <span className={cn("tabular-nums", className)}>-</span>;
  }

  const displayAmount = `-${formatCurrency(Math.abs(amount), locale)}`;

  return (
    <span
      className={cn("tabular-nums text-red-600 dark:text-red-400", className)}
    >
      {displayAmount}
    </span>
  );
}

// ============================================
// BalanceDisplay Component
// ============================================

interface BalanceDisplayProps {
  /** Số dư */
  balance: number | null | undefined;
  /** Locale để format (mặc định: ja cho JPY) */
  locale?: SupportedLocale;
  /** Custom className */
  className?: string;
  /** Ngưỡng cảnh báo số dư thấp */
  lowBalanceThreshold?: number;
  /** Hiển thị "-" khi không có giá trị */
  showPlaceholder?: boolean;
}

/**
 * Component hiển thị số dư với cảnh báo khi thấp
 */
export function BalanceDisplay({
  balance,
  locale = "ja",
  className,
  lowBalanceThreshold = 0,
  showPlaceholder = true,
}: BalanceDisplayProps) {
  if (balance === null || balance === undefined) {
    if (!showPlaceholder) return null;
    return <span className={cn("tabular-nums", className)}>-</span>;
  }

  const displayBalance = formatCurrency(balance, locale);
  const isLowBalance = balance <= lowBalanceThreshold;

  return (
    <span
      className={cn(
        "tabular-nums font-medium",
        isLowBalance
          ? "text-red-600 dark:text-red-400"
          : "text-green-600 dark:text-green-400",
        className,
      )}
    >
      {displayBalance}
    </span>
  );
}
