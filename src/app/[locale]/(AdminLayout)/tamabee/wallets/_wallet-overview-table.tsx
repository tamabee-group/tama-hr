"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WalletOverviewResponse, WalletFilterRequest } from "@/types/wallet";
import { PaginatedResponse, DEFAULT_PAGE_SIZE } from "@/types/api";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getOverview } from "@/lib/apis/wallet-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ArrowUpDown,
  Gift,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { vi, enUS, ja } from "date-fns/locale";

interface WalletOverviewTableProps {
  locale?: SupportedLocale;
  pageSize?: number;
  refreshTrigger?: number;
  onRefund?: (companyId: number, companyName: string) => void;
}

type SortField = "companyName" | "balance" | "nextBillingDate";
type SortOrder = "asc" | "desc";

/**
 * Component hiển thị bảng tổng quan wallet của tất cả công ty
 * - Columns: companyName, balance, planName, nextBillingDate, isFreeTrialActive, totalDeposits
 * - Filter theo balance range và free trial status
 * - Sorting theo balance, nextBillingDate, companyName
 * - Pagination
 */
export function WalletOverviewTable({
  locale = "vi",
  pageSize = DEFAULT_PAGE_SIZE,
  refreshTrigger,
  onRefund,
}: WalletOverviewTableProps) {
  const router = useRouter();
  const [data, setData] =
    useState<PaginatedResponse<WalletOverviewResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<WalletFilterRequest>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("companyName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Labels theo locale
  const labels = getLabels(locale);
  const dateLocale = locale === "vi" ? vi : locale === "ja" ? ja : enUS;

  // Fetch wallets
  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOverview(filter, currentPage, pageSize);
      // Client-side sorting
      const sortedContent = sortWallets(result.content, sortField, sortOrder);
      setData({ ...result, content: sortedContent });
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, pageSize, sortField, sortOrder]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets, refreshTrigger]);

  // Handle search
  const handleSearch = () => {
    const newFilter = { ...filter };
    if (searchTerm.trim()) {
      newFilter.companyName = searchTerm.trim();
    } else {
      delete newFilter.companyName;
    }
    setFilter(newFilter);
    setCurrentPage(0);
  };

  // Handle free trial filter
  const handleFreeTrialFilter = (value: string) => {
    const newFilter = { ...filter };
    if (value === "ALL") {
      delete newFilter.isFreeTrialActive;
    } else {
      newFilter.isFreeTrialActive = value === "true";
    }
    setFilter(newFilter);
    setCurrentPage(0);
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilter({});
    setSearchTerm("");
    setCurrentPage(0);
  };

  // Navigate to company detail
  const handleRowClick = (companyId: number) => {
    router.push(`/${locale}/tamabee/wallets/${companyId}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: dateLocale });
    } catch {
      return dateString;
    }
  };

  const hasActiveFilters =
    filter.companyName || filter.isFreeTrialActive !== undefined;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search by company name */}
        <div className="flex gap-2">
          <Input
            placeholder={labels.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-[250px]"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Free Trial Filter */}
        <Select
          value={
            filter.isFreeTrialActive === undefined
              ? "ALL"
              : filter.isFreeTrialActive.toString()
          }
          onValueChange={handleFreeTrialFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={labels.allStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{labels.allStatus}</SelectItem>
            <SelectItem value="true">{labels.freeTrialOnly}</SelectItem>
            <SelectItem value="false">{labels.paidOnly}</SelectItem>
          </SelectContent>
        </Select>

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
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort("companyName")}
                >
                  {labels.companyName}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort("balance")}
                >
                  {labels.balance}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>{labels.planName}</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort("nextBillingDate")}
                >
                  {labels.nextBillingDate}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>{labels.status}</TableHead>
              <TableHead className="text-right">
                {labels.totalDeposits}
              </TableHead>
              <TableHead className="text-right">{labels.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
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
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.content.length ? (
              data.content.map((wallet) => (
                <TableRow
                  key={wallet.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(wallet.companyId)}
                >
                  <TableCell className="font-medium">
                    {wallet.companyName}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(wallet.balance, locale)}
                  </TableCell>
                  <TableCell>{wallet.planName || "-"}</TableCell>
                  <TableCell>
                    {wallet.isFreeTrialActive
                      ? formatDate(wallet.freeTrialEndDate)
                      : formatDate(wallet.nextBillingDate)}
                  </TableCell>
                  <TableCell>
                    {wallet.isFreeTrialActive ? (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700"
                      >
                        <Gift className="h-3 w-3 mr-1" />
                        {labels.freeTrial}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{labels.active}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(wallet.totalDeposits, locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefund?.(wallet.companyId, wallet.companyName);
                      }}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {labels.refund}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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

// Helper function để sort wallets
function sortWallets(
  wallets: WalletOverviewResponse[],
  field: SortField,
  order: SortOrder,
): WalletOverviewResponse[] {
  return [...wallets].sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case "companyName":
        comparison = a.companyName.localeCompare(b.companyName);
        break;
      case "balance":
        comparison = a.balance - b.balance;
        break;
      case "nextBillingDate":
        const dateA = new Date(
          a.isFreeTrialActive ? a.freeTrialEndDate : a.nextBillingDate,
        ).getTime();
        const dateB = new Date(
          b.isFreeTrialActive ? b.freeTrialEndDate : b.nextBillingDate,
        ).getTime();
        comparison = dateA - dateB;
        break;
    }
    return order === "asc" ? comparison : -comparison;
  });
}

// Helper function để lấy labels theo locale
function getLabels(locale: SupportedLocale) {
  const labels = {
    vi: {
      companyName: "Tên công ty",
      balance: "Số dư",
      planName: "Gói dịch vụ",
      nextBillingDate: "Ngày thanh toán",
      status: "Trạng thái",
      totalDeposits: "Tổng nạp",
      actions: "Thao tác",
      searchPlaceholder: "Tìm theo tên công ty...",
      allStatus: "Tất cả trạng thái",
      freeTrialOnly: "Đang dùng thử",
      paidOnly: "Đã thanh toán",
      clearFilters: "Xóa bộ lọc",
      noResults: "Không có công ty nào",
      showing: "Hiển thị",
      of: "của",
      previous: "Trước",
      next: "Sau",
      freeTrial: "Dùng thử",
      active: "Hoạt động",
      refund: "Hoàn tiền",
    },
    en: {
      companyName: "Company Name",
      balance: "Balance",
      planName: "Plan",
      nextBillingDate: "Billing Date",
      status: "Status",
      totalDeposits: "Total Deposits",
      actions: "Actions",
      searchPlaceholder: "Search by company name...",
      allStatus: "All Status",
      freeTrialOnly: "Free Trial",
      paidOnly: "Paid",
      clearFilters: "Clear Filters",
      noResults: "No companies found",
      showing: "Showing",
      of: "of",
      previous: "Previous",
      next: "Next",
      freeTrial: "Trial",
      active: "Active",
      refund: "Refund",
    },
    ja: {
      companyName: "会社名",
      balance: "残高",
      planName: "プラン",
      nextBillingDate: "請求日",
      status: "ステータス",
      totalDeposits: "入金合計",
      actions: "操作",
      searchPlaceholder: "会社名で検索...",
      allStatus: "すべてのステータス",
      freeTrialOnly: "無料トライアル",
      paidOnly: "有料",
      clearFilters: "フィルターをクリア",
      noResults: "会社が見つかりません",
      showing: "表示中",
      of: "/",
      previous: "前へ",
      next: "次へ",
      freeTrial: "トライアル",
      active: "アクティブ",
      refund: "返金",
    },
  };
  return labels[locale];
}
