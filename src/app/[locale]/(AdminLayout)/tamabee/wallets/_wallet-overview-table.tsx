"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { WalletOverviewResponse, WalletFilterRequest } from "@/types/wallet";
import { PaginatedResponse, DEFAULT_PAGE_SIZE } from "@/types/api";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getOverview } from "@/lib/apis/wallet-api";
import { formatDate } from "@/lib/utils/format-date";
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
 */
export function WalletOverviewTable({
  locale = "vi",
  pageSize = DEFAULT_PAGE_SIZE,
  refreshTrigger,
  onRefund,
}: WalletOverviewTableProps) {
  const router = useRouter();
  const t = useTranslations("wallet");

  const [data, setData] =
    useState<PaginatedResponse<WalletOverviewResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<WalletFilterRequest>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("companyName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Fetch wallets
  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOverview(filter, currentPage, pageSize);
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

  const hasActiveFilters =
    filter.companyName || filter.isFreeTrialActive !== undefined;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <Input
            placeholder={t("filter.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-[250px]"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={
            filter.isFreeTrialActive === undefined
              ? "ALL"
              : filter.isFreeTrialActive.toString()
          }
          onValueChange={handleFreeTrialFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filter.allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("filter.allStatus")}</SelectItem>
            <SelectItem value="true">{t("filter.freeTrialOnly")}</SelectItem>
            <SelectItem value="false">{t("filter.paidOnly")}</SelectItem>
          </SelectContent>
        </Select>

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
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort("companyName")}
                >
                  {t("table.companyName")}
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
                  {t("table.balance")}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>{t("table.planName")}</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort("nextBillingDate")}
                >
                  {t("table.billingDate")}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead className="text-right">
                {t("table.totalDeposits")}
              </TableHead>
              <TableHead className="text-right">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
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
                      ? formatDate(wallet.freeTrialEndDate, locale)
                      : formatDate(wallet.nextBillingDate, locale)}
                  </TableCell>
                  <TableCell>
                    {wallet.isFreeTrialActive ? (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700"
                      >
                        <Gift className="h-3 w-3 mr-1" />
                        {t("status.freeTrial")}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{t("status.active")}</Badge>
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
                      {t("refund.button")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {t("messages.noResults")}
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
