"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { FallbackImage } from "@/app/[locale]/_components/_fallback-image";
import { DepositRequestResponse, DepositFilterRequest } from "@/types/deposit";
import { depositApi } from "@/lib/apis/deposit-api";
import { DepositStatusBadge } from "@/app/[locale]/_components/_status-badge";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { DepositStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, X, Pencil } from "lucide-react";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatDateTime } from "@/lib/utils/format-date";

type TabStatus = "ALL" | DepositStatus;

interface DepositTableProps {
  locale?: SupportedLocale;
  onViewImage?: (imageUrl: string) => void;
  onCancel?: (deposit: DepositRequestResponse) => void;
  onEdit?: (deposit: DepositRequestResponse) => void;
  refreshTrigger?: number;
}

/**
 * Bảng hiển thị danh sách yêu cầu nạp tiền của user hiện tại
 */
export function DepositTable({
  locale = "vi",
  onViewImage,
  onCancel,
  onEdit,
  refreshTrigger,
}: DepositTableProps) {
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");

  const [deposits, setDeposits] = useState<DepositRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const tabs: { value: TabStatus; label: string }[] = [
    { value: "ALL", label: t("tabs.all") },
    { value: "PENDING", label: t("tabs.pending") },
    { value: "APPROVED", label: t("tabs.approved") },
    { value: "REJECTED", label: t("tabs.rejected") },
  ];

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    try {
      const filter: DepositFilterRequest = {};
      if (activeTab !== "ALL") {
        filter.status = activeTab;
      }

      const response = await depositApi.getMyRequests(
        filter,
        page,
        DEFAULT_PAGE_SIZE,
      );
      setDeposits(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch deposits:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits, refreshTrigger]);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const columns: ColumnDef<DepositRequestResponse>[] = [
    {
      accessorKey: "amount",
      header: t("table.amount"),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.getValue("amount"), locale)}
        </span>
      ),
    },
    {
      accessorKey: "transferProofUrl",
      header: t("table.transferProof"),
      cell: ({ row }) => {
        const imageUrl = row.getValue("transferProofUrl") as string;
        return (
          <FallbackImage
            src={getFileUrl(imageUrl)}
            alt="Transfer proof"
            className="h-10 w-10 rounded object-cover cursor-pointer hover:opacity-80"
            fallbackClassName="h-10 w-10 rounded"
            compact
            onClick={() => onViewImage?.(getFileUrl(imageUrl))}
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => <DepositStatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "createdAt",
      header: t("table.createdAt"),
      cell: ({ row }) => formatDateTime(row.getValue("createdAt"), locale),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const deposit = row.original;
        const isPending = deposit.status === "PENDING";

        return (
          <div className="flex items-center gap-1">
            {isPending && onEdit && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(deposit)}
                title={t("actions.edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {isPending && onCancel && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onCancel(deposit)}
                title={t("actions.cancel")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {onViewImage && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  onViewImage(getFileUrl(deposit.transferProofUrl))
                }
                title={t("actions.viewImage")}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
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
        data={deposits}
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
