"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WalletTransactionResponse } from "@/types/wallet";
import { TransactionType } from "@/types/enums";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { getTransactionTypeLabel } from "@/lib/utils/get-enum-label";

/**
 * Format số tiền với màu sắc theo loại giao dịch
 * - Xanh: DEPOSIT, REFUND (tiền vào)
 * - Đỏ: BILLING, COMMISSION (tiền ra)
 */
export function formatTransactionAmount(
  amount: number,
  type: TransactionType,
  locale: SupportedLocale,
) {
  const isPositive = type === "DEPOSIT" || type === "REFUND";
  const prefix = isPositive ? "+" : "-";
  const colorClass = isPositive ? "text-green-600" : "text-red-600";
  return (
    <span className={colorClass}>
      {prefix}
      {formatCurrency(Math.abs(amount), locale)}
    </span>
  );
}

// Type cho translation function
type EnumTranslationFunction = (key: string) => string;

/**
 * Tạo column definitions cho bảng giao dịch
 * @param locale - Locale cho format tiền tệ và ngày tháng
 * @param tEnums - Translation function từ useTranslations('enums')
 */
export function createTransactionColumns(
  locale: SupportedLocale,
  tEnums: EnumTranslationFunction,
): ColumnDef<WalletTransactionResponse>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Ngày",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDateTime(row.getValue("createdAt"), locale)}
        </span>
      ),
    },
    {
      accessorKey: "transactionType",
      header: "Loại",
      cell: ({ row }) =>
        getTransactionTypeLabel(row.getValue("transactionType"), tEnums),
    },
    {
      accessorKey: "amount",
      header: "Số tiền",
      cell: ({ row }) => (
        <span className="font-medium text-right">
          {formatTransactionAmount(
            row.original.amount,
            row.original.transactionType,
            locale,
          )}
        </span>
      ),
    },
    {
      accessorKey: "balanceBefore",
      header: "Số dư trước",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-right">
          {formatCurrency(row.getValue("balanceBefore"), locale)}
        </span>
      ),
    },
    {
      accessorKey: "balanceAfter",
      header: "Số dư sau",
      cell: ({ row }) => (
        <span className="text-right">
          {formatCurrency(row.getValue("balanceAfter"), locale)}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block">
          {row.getValue("description") || "-"}
        </span>
      ),
    },
  ];
}
