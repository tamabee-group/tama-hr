"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Pagination } from "@/app/[locale]/_components/_base/_pagination";
import { DepositRequestResponse, DepositFilterRequest } from "@/types/deposit";
import { DepositStatus } from "@/types/enums";
import { SupportedLocale } from "@/lib/utils/format-currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import { PaginatedResponse } from "@/types/api";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { createDepositColumns } from "./_deposit-columns";

/**
 * Props cho SharedDepositTable component
 * Dùng chung cho Company wallet và Employee support
 */
interface SharedDepositTableProps {
  /** Hàm fetch deposits với filter và pagination */
  fetchDeposits: (
    filter: DepositFilterRequest,
    page: number,
    size: number,
  ) => Promise<PaginatedResponse<DepositRequestResponse>>;
  /** Locale cho format tiền tệ và ngày */
  locale?: SupportedLocale;
  /** Callback khi xem ảnh chứng minh */
  onViewImage?: (imageUrl: string) => void;
  /** Trigger refresh data */
  refreshTrigger?: number;
}

/**
 * Shared DepositTable component
 * Hiển thị danh sách yêu cầu nạp tiền với filter và pagination
 * Dùng chung cho Company wallet và Employee support
 */
export function SharedDepositTable({
  fetchDeposits,
  locale = "vi",
  onViewImage,
  refreshTrigger,
}: SharedDepositTableProps) {
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  const [deposits, setDeposits] = useState<DepositRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<DepositStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Labels cho columns
  const columnLabels = useMemo(
    () => ({
      createdAt: t("table.createdAt"),
      amount: t("table.amount"),
      status: t("table.status"),
      transferProof: t("table.transferProof"),
      rejectionReason: t("table.rejectionReason"),
      viewImage: t("actions.viewProof"),
    }),
    [t],
  );

  // Memoize columns để tránh re-render không cần thiết
  const columns = useMemo(
    () => createDepositColumns(locale, columnLabels, onViewImage),
    [locale, columnLabels, onViewImage],
  );

  // Fetch deposits data
  const loadDeposits = useCallback(async () => {
    setLoading(true);
    try {
      const filter: DepositFilterRequest = {};
      if (statusFilter !== "ALL") {
        filter.status = statusFilter;
      }

      const response = await fetchDeposits(filter, page, DEFAULT_PAGE_SIZE);
      setDeposits(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch deposits:", error);
      handleApiError(error, {
        defaultMessage: tCommon("errorLoading"),
      });
    } finally {
      setLoading(false);
    }
  }, [fetchDeposits, statusFilter, page, tCommon]);

  // Load data khi mount hoặc dependencies thay đổi
  useEffect(() => {
    loadDeposits();
  }, [loadDeposits, refreshTrigger]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  // Loading skeleton
  if (loading && deposits.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Deposit status options
  const depositStatusOptions: { value: DepositStatus; label: string }[] = [
    { value: "PENDING", label: tEnums("depositStatus.PENDING") },
    { value: "APPROVED", label: tEnums("depositStatus.APPROVED") },
    { value: "REJECTED", label: tEnums("depositStatus.REJECTED") },
  ];

  return (
    <div className="space-y-4">
      {/* Filter theo status */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as DepositStatus | "ALL")
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={tCommon("filter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{tCommon("all")}</SelectItem>
            {depositStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <BaseTable
        columns={columns}
        data={deposits}
        showPagination={false}
        noResultsText={tCommon("noResults")}
      />

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
