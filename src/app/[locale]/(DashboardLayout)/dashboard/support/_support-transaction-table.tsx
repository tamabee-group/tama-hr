"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import {
  WalletTransactionResponse,
  TransactionFilterRequest,
} from "@/types/wallet";
import { walletApi } from "@/lib/apis/wallet-api";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { TransactionType } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

type TabType = "ALL" | TransactionType;

interface SupportTransactionTableProps {
  companyId: number;
  locale?: SupportedLocale;
  refreshTrigger?: number;
}

/**
 * Transaction table cho Employee Support (read-only)
 */
export function SupportTransactionTable({
  companyId,
  locale = "vi",
  refreshTrigger,
}: SupportTransactionTableProps) {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const tabs: { value: TabType; label: string }[] = [
    { value: "ALL", label: t("tabs.all") },
    { value: "DEPOSIT", label: t("tabs.deposit") },
    { value: "BILLING", label: t("tabs.billing") },
    { value: "REFUND", label: t("tabs.refund") },
  ];

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const filter: TransactionFilterRequest = {};
      if (activeTab !== "ALL") {
        filter.transactionType = activeTab;
      }

      const response = await walletApi.getTransactionsByCompanyId(
        companyId,
        filter,
        page,
        DEFAULT_PAGE_SIZE,
      );
      setTransactions(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId, activeTab, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

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
      cell: ({ row }) => {
        formatCurrency(row.getValue("balanceAfter"));
      },
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

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
        data={transactions}
        showPagination={false}
        noResultsText={tCommon("noResults")}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            {tCommon("previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            {tCommon("next")}
          </Button>
        </div>
      )}
    </div>
  );
}
