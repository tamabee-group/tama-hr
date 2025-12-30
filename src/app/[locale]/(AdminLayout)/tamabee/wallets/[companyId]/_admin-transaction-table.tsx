"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WalletTransactionResponse,
  TransactionFilterRequest,
} from "@/types/wallet";
import {
  TransactionType,
  TRANSACTION_TYPES,
  getTransactionTypeLabel,
} from "@/types/enums";
import { PaginatedResponse, DEFAULT_PAGE_SIZE } from "@/types/api";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
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
import { format } from "date-fns";
import { vi, enUS, ja } from "date-fns/locale";

interface AdminTransactionTableProps {
  companyId: number;
  locale?: SupportedLocale;
  pageSize?: number;
  refreshTrigger?: number;
}

/**
 * Component hiển thị bảng giao dịch cho Admin view
 * Sử dụng API getTransactionsByCompanyId thay vì getMyTransactions
 */
export function AdminTransactionTable({
  companyId,
  locale = "vi",
  pageSize = DEFAULT_PAGE_SIZE,
  refreshTrigger,
}: AdminTransactionTableProps) {
  const [data, setData] =
    useState<PaginatedResponse<WalletTransactionResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<TransactionFilterRequest>({});
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Labels theo locale
  const labels = getLabels(locale);
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
    if (date) {
      newFilter.startDate = format(date, "yyyy-MM-dd");
    } else {
      delete newFilter.startDate;
    }
    setFilter(newFilter);
    setCurrentPage(0);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    const newFilter = { ...filter };
    if (date) {
      newFilter.endDate = format(date, "yyyy-MM-dd");
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

  // Format date cho hiển thị
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: dateLocale });
    } catch {
      return dateString;
    }
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
        {/* Transaction Type Filter */}
        <Select
          value={filter.transactionType || "ALL"}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={labels.allTypes} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{labels.allTypes}</SelectItem>
            {TRANSACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {getTransactionTypeLabel(type.value, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Start Date Filter */}
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
              {startDate ? format(startDate, "dd/MM/yyyy") : labels.startDate}
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

        {/* End Date Filter */}
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
              {endDate ? format(endDate, "dd/MM/yyyy") : labels.endDate}
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

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            {labels.clearFilters}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{labels.date}</TableHead>
              <TableHead>{labels.type}</TableHead>
              <TableHead className="text-right">{labels.amount}</TableHead>
              <TableHead className="text-right">
                {labels.balanceBefore}
              </TableHead>
              <TableHead className="text-right">
                {labels.balanceAfter}
              </TableHead>
              <TableHead>{labels.description}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.content.length ? (
              data.content.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(transaction.createdAt)}
                  </TableCell>
                  <TableCell>
                    {getTransactionTypeLabel(
                      transaction.transactionType,
                      locale,
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
                  {labels.noResults}
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
            {labels.showing} {data.number * data.size + 1}-
            {Math.min((data.number + 1) * data.size, data.totalElements)}{" "}
            {labels.of} {data.totalElements}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={data.first}
            >
              <ChevronLeft className="h-4 w-4" />
              {labels.previous}
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
              {labels.next}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function để lấy labels theo locale
function getLabels(locale: SupportedLocale) {
  const labels = {
    vi: {
      date: "Ngày",
      type: "Loại",
      amount: "Số tiền",
      balanceBefore: "Số dư trước",
      balanceAfter: "Số dư sau",
      description: "Mô tả",
      allTypes: "Tất cả loại",
      startDate: "Từ ngày",
      endDate: "Đến ngày",
      clearFilters: "Xóa bộ lọc",
      noResults: "Không có giao dịch nào",
      showing: "Hiển thị",
      of: "của",
      previous: "Trước",
      next: "Sau",
    },
    en: {
      date: "Date",
      type: "Type",
      amount: "Amount",
      balanceBefore: "Balance Before",
      balanceAfter: "Balance After",
      description: "Description",
      allTypes: "All Types",
      startDate: "Start Date",
      endDate: "End Date",
      clearFilters: "Clear Filters",
      noResults: "No transactions found",
      showing: "Showing",
      of: "of",
      previous: "Previous",
      next: "Next",
    },
    ja: {
      date: "日付",
      type: "種類",
      amount: "金額",
      balanceBefore: "取引前残高",
      balanceAfter: "取引後残高",
      description: "説明",
      allTypes: "すべての種類",
      startDate: "開始日",
      endDate: "終了日",
      clearFilters: "フィルターをクリア",
      noResults: "取引がありません",
      showing: "表示中",
      of: "/",
      previous: "前へ",
      next: "次へ",
    },
  };
  return labels[locale];
}
