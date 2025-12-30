"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Pagination } from "@/app/[locale]/_components/_base/_pagination";
import {
  WalletTransactionResponse,
  TransactionFilterRequest,
} from "@/types/wallet";
import { TransactionType } from "@/types/enums";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { formatDateForApi } from "@/lib/utils/format-date";
import { PaginatedResponse, DEFAULT_PAGE_SIZE } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { TransactionFilters } from "./_transaction-filters";
import { createTransactionColumns } from "./_transaction-columns";

// Re-export utility functions cho property tests
export {
  isTransactionsSortedDescending,
  isTransactionsMatchFilter,
} from "./_transaction-utils";

/**
 * Props cho SharedTransactionTable component
 * Dùng chung cho Company wallet, Employee support và Admin wallet view
 */
interface SharedTransactionTableProps {
  /** Hàm fetch transactions với filter và pagination */
  fetchTransactions: (
    filter: TransactionFilterRequest,
    page: number,
    size: number,
  ) => Promise<PaginatedResponse<WalletTransactionResponse>>;
  /** Locale cho format tiền tệ */
  locale?: SupportedLocale;
  /** Trigger refresh data */
  refreshTrigger?: number;
}

/**
 * Shared TransactionTable component
 * Hiển thị danh sách giao dịch ví với filter và pagination
 * Dùng chung cho Company wallet, Employee support và Admin wallet view
 */
export function SharedTransactionTable({
  fetchTransactions,
  locale = "vi",
  refreshTrigger,
}: SharedTransactionTableProps) {
  const tEnums = useTranslations("enums");
  const t = useTranslations("commissions");
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<TransactionFilterRequest>({});
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Memoize columns để tránh re-render không cần thiết
  const columns = useMemo(
    () => createTransactionColumns(locale, tEnums),
    [locale, tEnums],
  );

  // Fetch transactions data
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchTransactions(filter, page, DEFAULT_PAGE_SIZE);
      setTransactions(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error(t("messages.loadTransactionsError"));
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions, filter, page, t]);

  // Load data khi mount hoặc dependencies thay đổi
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions, refreshTrigger]);

  // Handle filter changes
  const handleTypeChange = (value: string) => {
    const newFilter = { ...filter };
    if (value === "ALL") {
      delete newFilter.transactionType;
    } else {
      newFilter.transactionType = value as TransactionType;
    }
    setFilter(newFilter);
    setPage(0);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    const newFilter = { ...filter };
    const formattedDate = formatDateForApi(date);
    if (formattedDate) {
      newFilter.startDate = formattedDate;
    } else {
      delete newFilter.startDate;
    }
    setFilter(newFilter);
    setPage(0);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    const newFilter = { ...filter };
    const formattedDate = formatDateForApi(date);
    if (formattedDate) {
      newFilter.endDate = formattedDate;
    } else {
      delete newFilter.endDate;
    }
    setFilter(newFilter);
    setPage(0);
  };

  const clearFilters = () => {
    setFilter({});
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(0);
  };

  // Loading skeleton
  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <TransactionFilters
        transactionType={filter.transactionType}
        startDate={startDate}
        endDate={endDate}
        locale={locale}
        tEnums={tEnums}
        onTypeChange={handleTypeChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onClearFilters={clearFilters}
      />

      {/* Table */}
      <BaseTable
        columns={columns}
        data={transactions}
        showPagination={false}
        noResultsText="Không có giao dịch nào"
      />

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
