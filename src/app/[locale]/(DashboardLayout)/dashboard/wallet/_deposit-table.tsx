"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { FallbackImage } from "@/app/[locale]/_components/image";
import { DepositRequestResponse } from "@/types/deposit";
import { DepositStatusBadge } from "@/app/[locale]/_components/_shared/display";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { DepositStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatDateTime } from "@/lib/utils/format-date-time";

type TabStatus = "ALL" | DepositStatus;

interface DepositTableProps {
  locale?: SupportedLocale;
  data: DepositRequestResponse[];
  onViewImage?: (imageUrl: string) => void;
  onCancel?: (deposit: DepositRequestResponse) => void;
  onDeposit?: () => void;
}

/**
 * Bảng hiển thị danh sách yêu cầu nạp tiền của user hiện tại
 * Nhận data từ props, filter client-side theo tab
 */
export function DepositTable({
  locale = "vi",
  data,
  onViewImage,
  onCancel,
  onDeposit,
}: DepositTableProps) {
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");

  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");

  const tabs: { value: TabStatus; label: string }[] = [
    { value: "ALL", label: t("tabs.all") },
    { value: "PENDING", label: t("tabs.pending") },
    { value: "APPROVED", label: t("tabs.approved") },
    { value: "REJECTED", label: t("tabs.rejected") },
  ];

  // Filter client-side theo tab
  const filteredDeposits = useMemo(() => {
    if (activeTab === "ALL") return data;
    return data.filter((d) => d.status === activeTab);
  }, [data, activeTab]);

  const columns: ColumnDef<DepositRequestResponse>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "amount",
      header: t("table.amount"),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.getValue("amount"))}
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
      accessorKey: "processedAt",
      header: t("table.processedAt"),
      cell: ({ row }) => {
        const processedAt = row.getValue("processedAt") as string | null;
        return processedAt ? formatDateTime(processedAt, locale) : "-";
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const deposit = row.original;
        const isPending = deposit.status === "PENDING";

        return (
          <div>
            {isPending && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onCancel(deposit)}
              >
                <X className="h-4 w-4 mr-1" />
                {t("actions.cancel")}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 border-b flex-1">
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
        {onDeposit && (
          <Button onClick={onDeposit} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t("actions.deposit")}
          </Button>
        )}
      </div>

      <BaseTable
        columns={columns}
        data={filteredDeposits}
        showPagination={false}
        noResultsText={tCommon("noResults")}
      />
    </div>
  );
}
