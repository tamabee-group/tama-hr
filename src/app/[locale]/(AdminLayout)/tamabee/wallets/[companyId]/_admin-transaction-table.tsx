"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  WalletTransactionResponse,
  TransactionFilterRequest,
} from "@/types/wallet";
import { TransactionType, TRANSACTION_TYPES } from "@/types/enums";
import { PaginatedResponse, DEFAULT_PAGE_SIZE } from "@/types/api";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import {
  formatDate,
  formatDateTime,
  formatDateForApi,
} from "@/lib/utils/format-date";
import { getTransactionTypeLabel } from "@/lib/utils/get-enum-label";
import { getTransactionsByCompanyId } from "@/lib/apis/wallet-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { vi, enUS, ja } from "date-fns/locale";

interface AdminTransactionTableProps {
  companyId: number;
  locale?: SupportedLocale;
  pageSize?: number;
  refreshTrigger?: number;
}

/**
 * Component hiển thị bảng giao dịch cho Admin view
 */
export function AdminTransactionTable({
  companyId,
  locale = "vi",
  pageSize = DEFAULT_PAGE_SIZE,
  refreshTrigger,
}: AdminTransactionTableProps) {
  const t = useTranslations("wallet");
  const tEnums = useTranslations("enums");

  const [data, setData] =
    useState<PaginatedResponse<WalletTransactionResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<TransactionFilterRequest>({});
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const dateLocale = locale === "vi" ? vi : locale === "ja" ? ja : enUS;

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTransactionsByCompanyId(
        companyId,
        filter,
        currentPage,
        pageSize,
      );
      setData(result);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId, filter, currentPage, pageSize]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  // Handle filter changes
  const handleTypeChange = (value: string) => {
    const newFilter = { ...filter };
    if (value === "ALL") {
      delete newFilter.transactionType;
    } else {
      newFilter.transactionType = value as TransactionType;
    }
    setFilter(newFilter);
    setCurrentPage(0);
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
    setCurrentPage(0);
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
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilter({});
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(0);
  };

  // Format amount với màu sắc
  const formatAmount = (amount: number, type: TransactionType) => {
    const isPositive = type === "DEPOSIT" || type === "REFUND";
    const prefix = isPositive ? "+" : "-";
    const colorClass = isPositive ? "text-green-600" : "text-red-600";
    return (
      <span className={colorClass}>
        {prefix}
        {formatCurrency(Math.abs(amount), locale)}
      </span>
    );
  };

  const hasActiveFilters =
    filter.transactionType || filter.startDate || filter.endDate;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select
          value={filter.transactionType || "ALL"}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filter.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("filter.allTypes")}</SelectItem>
            {TRANSACTION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {getTransactionTypeLabel(type, tEnums)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate
                ? formatDate(startDate, locale)
                : t("filter.startDate")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleStartDateChange}
              locale={dateLocale}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? formatDate(endDate, locale) : t("filter.endDate")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={handleEndDateChange}
              locale={dateLocale}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            {t("filter.clearFilters")}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.date")}</TableHead>
              <TableHead>{t("table.type")}</TableHead>
              <TableHead className="text-right">{t("table.amount")}</TableHead>
              <TableHead className="text-right">
                {t("table.balanceBefore")}
              </TableHead>
              <TableHead className="text-right">
                {t("table.balanceAfter")}
              </TableHead>
              <TableHead>{t("table.description")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.content.length ? (
              data.content.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(transaction.createdAt, locale)}
                  </TableCell>
                  <TableCell>
                    {getTransactionTypeLabel(
                      transaction.transactionType,
                      tEnums,
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAmount(
                      transaction.amount,
                      transaction.transactionType,
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(transaction.balanceBefore, locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.balanceAfter, locale)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transaction.description || "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t("messages.noTransactions")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("pagination.showing")} {data.number * data.size + 1}-
            {Math.min((data.number + 1) * data.size, data.totalElements)}{" "}
            {t("pagination.of")} {data.totalElements}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={data.first}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("pagination.previous")}
            </Button>
            <span className="text-sm">
              {data.number + 1} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={data.last}
            >
              {t("pagination.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
