"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { FallbackImage } from "@/app/[locale]/_components/image";
import { DepositRequestResponse } from "@/types/deposit";
import { depositApi } from "@/lib/apis/deposit-api";
import { DepositStatusBadge } from "@/app/[locale]/_components/_shared/display";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { DepositStatus } from "@/types/enums";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatRequesterName } from "@/lib/utils/format-requester";
import { formatDateTime } from "@/lib/utils/format-date-time";

type TabStatus = "ALL" | DepositStatus;

interface AdminDepositTableProps {
  locale?: SupportedLocale;
  onViewDetail?: (deposit: DepositRequestResponse) => void;
  refreshTrigger?: number;
  highlightId?: number;
  onHighlightHandled?: () => void;
}

/**
 * Bảng hiển thị danh sách yêu cầu nạp tiền (Admin)
 * Fetch 1 lần, filter client-side theo tab
 */
export function AdminDepositTable({
  locale = "vi",
  onViewDetail,
  refreshTrigger,
  highlightId,
  onHighlightHandled,
}: AdminDepositTableProps) {
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");

  const [allDeposits, setAllDeposits] = useState<DepositRequestResponse[]>([]);
  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");
  // Track xem đã xử lý highlight cho lần URL change hiện tại chưa
  const [processedForCurrentUrl, setProcessedForCurrentUrl] = useState(false);

  // Reset flag khi highlightId thay đổi (bao gồm từ undefined → number hoặc number → undefined)
  useEffect(() => {
    setProcessedForCurrentUrl(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [highlightId]);

  const tabs: { value: TabStatus; label: string }[] = [
    { value: "ALL", label: t("tabs.all") },
    { value: "PENDING", label: t("tabs.pending") },
    { value: "APPROVED", label: t("tabs.approved") },
    { value: "REJECTED", label: t("tabs.rejected") },
  ];

  // Fetch tất cả deposits khi mount hoặc refreshTrigger thay đổi
  useEffect(() => {
    let isMounted = true;

    const loadDeposits = async () => {
      try {
        const response = await depositApi.getAll({}, 0, 100);
        if (isMounted) {
          setAllDeposits(response.content);
        }
      } catch (error) {
        console.error("Failed to fetch deposits:", error);
      }
    };

    loadDeposits();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Filter client-side theo tab
  const filteredDeposits = useMemo(() => {
    if (activeTab === "ALL") return allDeposits;
    return allDeposits.filter((d) => d.status === activeTab);
  }, [allDeposits, activeTab]);

  // Auto-open dialog khi có highlightId từ notification click
  useEffect(() => {
    // Chỉ xử lý nếu chưa process cho URL hiện tại
    if (highlightId && !processedForCurrentUrl && allDeposits.length > 0) {
      const deposit = allDeposits.find((d) => d.id === highlightId);
      if (deposit) {
        onViewDetail?.(deposit);
        setProcessedForCurrentUrl(true); // eslint-disable-line react-hooks/set-state-in-effect
        // Clear query param sau khi đã mở dialog
        onHighlightHandled?.();
      }
    }
  }, [
    highlightId,
    allDeposits,
    processedForCurrentUrl,
    onViewDetail,
    onHighlightHandled,
  ]);

  const columns: ColumnDef<DepositRequestResponse>[] = [
    {
      accessorKey: "companyName",
      header: t("table.companyName"),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("companyName")}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: t("table.amount"),
      cell: ({ row }) => (
        <span className="font-medium text-primary">
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
            onClick={() => onViewDetail?.(row.original)}
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
      accessorKey: "requesterName",
      header: t("table.requesterName"),
      cell: ({ row }) => {
        const deposit = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-medium">
              {formatRequesterName({
                requestedBy: deposit.requestedBy,
                requesterName: deposit.requesterName,
              })}
            </div>
            {deposit.requesterEmail && (
              <div className="text-xs text-muted-foreground">
                {deposit.requesterEmail}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("table.createdAt"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.getValue("createdAt"), locale)}
        </span>
      ),
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
        data={filteredDeposits}
        showPagination={false}
        noResultsText={tCommon("noResults")}
        onRowClick={onViewDetail}
        rowClassName={(row) =>
          highlightId === row.id ? "bg-primary/10 ring-1 ring-primary/30" : ""
        }
      />
    </div>
  );
}
