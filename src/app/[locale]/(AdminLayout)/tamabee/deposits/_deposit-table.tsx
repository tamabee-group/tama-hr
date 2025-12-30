"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { FallbackImage } from "@/app/[locale]/_components/_fallback-image";
import { DepositRequestResponse, DepositFilterRequest } from "@/types/deposit";
import { depositApi } from "@/lib/apis/deposit-api";
import { DepositStatusBadge } from "@/app/[locale]/_components/_status-badge";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { DepositStatus, DEPOSIT_STATUSES } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatRequesterName } from "@/lib/utils/format-requester";

type TabStatus = "ALL" | DepositStatus;

interface AdminDepositTableProps {
  locale?: SupportedLocale;
  onViewDetail?: (deposit: DepositRequestResponse) => void;
  refreshTrigger?: number;
}

/**
 * Component bảng hiển thị danh sách yêu cầu nạp tiền (Admin version)
 * - Columns: companyName, amount, transferProof, status, requestedBy, createdAt
 * - Tab navigation: All, Pending, Approved, Rejected
 * - Hỗ trợ đa ngôn ngữ (vi, en, ja)
 */
export function AdminDepositTable({
  locale = "vi",
  onViewDetail,
  refreshTrigger,
}: AdminDepositTableProps) {
  const [deposits, setDeposits] = useState<DepositRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Labels theo locale
  const labels = {
    vi: {
      companyName: "Công ty",
      amount: "Số tiền",
      transferProof: "Ảnh chứng minh",
      status: "Trạng thái",
      requestedBy: "Người yêu cầu",
      requesterName: "Tên người yêu cầu",
      createdAt: "Ngày tạo",
      viewDetail: "Xem chi tiết",
      all: "Tất cả",
      pending: "Đang chờ",
      approved: "Đã duyệt",
      rejected: "Đã từ chối",
      noResults: "Không có yêu cầu nạp tiền nào",
      previous: "Trước",
      next: "Sau",
      errorLoading: "Không thể tải danh sách yêu cầu nạp tiền",
    },
    en: {
      companyName: "Company",
      amount: "Amount",
      transferProof: "Transfer Proof",
      status: "Status",
      requestedBy: "Requested By",
      requesterName: "Requester Name",
      createdAt: "Created At",
      viewDetail: "View Detail",
      all: "All",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      noResults: "No deposit requests found",
      previous: "Previous",
      next: "Next",
      errorLoading: "Failed to load deposit requests",
    },
    ja: {
      companyName: "会社",
      amount: "金額",
      transferProof: "振込証明",
      status: "ステータス",
      requestedBy: "申請者",
      requesterName: "申請者名",
      createdAt: "作成日",
      viewDetail: "詳細を見る",
      all: "すべて",
      pending: "保留中",
      approved: "承認済み",
      rejected: "却下",
      noResults: "入金リクエストがありません",
      previous: "前へ",
      next: "次へ",
      errorLoading: "入金リクエストの読み込みに失敗しました",
    },
  };

  const t = labels[locale];

  // Danh sách tab
  const tabs: { value: TabStatus; label: string }[] = [
    { value: "ALL", label: t.all },
    { value: "PENDING", label: t.pending },
    { value: "APPROVED", label: t.approved },
    { value: "REJECTED", label: t.rejected },
  ];

  // Format ngày theo locale
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        locale === "vi" ? "vi-VN" : locale === "ja" ? "ja-JP" : "en-US",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        },
      );
    } catch {
      return dateString;
    }
  };

  // Lấy danh sách deposits từ API
  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    try {
      const filter: DepositFilterRequest = {};
      if (activeTab !== "ALL") {
        filter.status = activeTab;
      }

      const response = await depositApi.getAll(filter, page, DEFAULT_PAGE_SIZE);
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

  // Reset page khi tab thay đổi
  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  // Định nghĩa các cột của bảng
  const columns: ColumnDef<DepositRequestResponse>[] = [
    {
      accessorKey: "companyName",
      header: t.companyName,
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("companyName")}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: t.amount,
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.getValue("amount"), locale)}
        </span>
      ),
    },
    {
      accessorKey: "transferProofUrl",
      header: t.transferProof,
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
      header: t.status,
      cell: ({ row }) => (
        <DepositStatusBadge status={row.getValue("status")} locale={locale} />
      ),
    },
    {
      accessorKey: "requesterName",
      header: t.requesterName,
      cell: ({ row }) => {
        const deposit = row.original;
        return formatRequesterName({
          requestedBy: deposit.requestedBy,
          requesterName: deposit.requesterName,
        });
      },
    },
    {
      accessorKey: "createdAt",
      header: t.createdAt,
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onViewDetail?.(row.original)}
          title={t.viewDetail}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Tab skeleton */}
        <div className="flex items-center gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        {/* Table skeleton */}
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
      {/* Tab Navigation */}
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

      {/* Table */}
      <BaseTable
        columns={columns}
        data={deposits}
        showPagination={false}
        noResultsText={t.noResults}
      />

      {/* Custom Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            {t.previous}
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
            {t.next}
          </Button>
        </div>
      )}
    </div>
  );
}
