"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { WalletTransactionResponse } from "@/types/wallet";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { TransactionType } from "@/types/enums";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

type TabType = "ALL" | TransactionType;

interface TransactionTableProps {
  locale?: SupportedLocale;
  data: WalletTransactionResponse[];
}

/**
 * Bảng hiển thị danh sách giao dịch ví của user hiện tại
 * Nhận data từ props, filter client-side theo tab
 */
export function TransactionTable({
  locale = "vi",
  data,
}: TransactionTableProps) {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  const [activeTab, setActiveTab] = useState<TabType>("ALL");

  const tabs: { value: TabType; label: string }[] = [
    { value: "ALL", label: t("tabs.all") },
    { value: "DEPOSIT", label: t("tabs.deposit") },
    { value: "BILLING", label: t("tabs.billing") },
    { value: "REFUND", label: t("tabs.refund") },
  ];

  // Filter client-side theo tab
  const filteredTransactions = useMemo(() => {
    if (activeTab === "ALL") return data;
    return data.filter((t) => t.transactionType === activeTab);
  }, [data, activeTab]);

  const columns: ColumnDef<WalletTransactionResponse>[] = [
    {
      accessorKey: "transactionType",
      header: t("table.type"),
      cell: ({ row }) => {
        const type = row.getValue("transactionType") as TransactionType;
        return (
          <span
            className={cn(
              "font-medium",
              type === "DEPOSIT" && "text-green-600",
              type === "BILLING" && "text-red-600",
              type === "REFUND" && "text-blue-600",
              type === "COMMISSION" && "text-purple-600",
            )}
          >
            {getEnumLabel("transactionType", type, tEnums)}
          </span>
        );
      },
    },
    {
      accessorKey: "amount",
      header: t("table.amount"),
      cell: ({ row }) => {
        const type = row.original.transactionType;
        const amount = row.getValue("amount") as number;
        const isPositive = type === "DEPOSIT" || type === "REFUND";
        return (
          <span
            className={cn(
              "font-medium",
              isPositive ? "text-green-600" : "text-red-600",
            )}
          >
            {isPositive ? "+" : "-"}
            {formatCurrency(amount)}
          </span>
        );
      },
    },
    {
      accessorKey: "balanceAfter",
      header: t("table.balanceAfter"),
      cell: ({ row }) => formatCurrency(row.getValue("balanceAfter")),
    },
    {
      accessorKey: "description",
      header: t("table.description"),
    },
    {
      accessorKey: "createdAt",
      header: t("table.createdAt"),
      cell: ({ row }) => formatDateTime(row.getValue("createdAt"), locale),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <BaseTable
        columns={columns}
        data={filteredTransactions}
        showPagination={false}
        noResultsText={tCommon("noResults")}
      />
    </div>
  );
}
