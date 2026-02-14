"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { AdjustmentStatusBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";
import { GlassTabs } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { AdjustmentDetailDialog } from "./_adjustment-detail-dialog";
import { RejectDialog, BulkRejectDialog } from "./_reject-dialog";

import { adjustmentApi } from "@/lib/apis/adjustment-api";
import { AdjustmentRequest } from "@/types/attendance-records";
import {
  formatDateWithDayOfWeek,
  formatDateTime,
} from "@/lib/utils/format-date-time";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";
import { refreshPendingCounts } from "@/hooks/use-pending-counts";
import { useNotificationHighlight } from "@/hooks/use-notification-highlight";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

/**
 * Component danh sách yêu cầu điều chỉnh chấm công
 * Hỗ trợ approve/reject đơn lẻ và hàng loạt
 */
export function ApprovalList() {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  // Highlight từ notification click
  const { highlightId, onHighlightHandled } = useNotificationHighlight();

  // State cho tab pending
  const [pendingRequests, setPendingRequests] = useState<AdjustmentRequest[]>(
    [],
  );
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingPage] = useState(DEFAULT_PAGE);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);

  // State cho tab all
  const [allRequests, setAllRequests] = useState<AdjustmentRequest[]>([]);
  const [allLoading, setAllLoading] = useState(true);
  const [allPage] = useState(DEFAULT_PAGE);
  const [allTotalPages, setAllTotalPages] = useState(0);

  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Track xem đã xử lý highlight cho lần URL change hiện tại chưa
  const [processedForCurrentUrl, setProcessedForCurrentUrl] = useState(false);

  // Reset flag khi highlightId thay đổi
  useEffect(() => {
    setProcessedForCurrentUrl(false);
  }, [highlightId]);

  // Dialog states
  const [selectedRequest, setSelectedRequest] =
    useState<AdjustmentRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    setPendingLoading(true);
    try {
      const response = await adjustmentApi.getPendingRequests(
        pendingPage,
        DEFAULT_LIMIT,
      );
      setPendingRequests(response.content);
      setPendingTotalPages(response.totalPages);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setPendingLoading(false);
    }
  }, [pendingPage, tErrors]);

  // Fetch all requests
  const fetchAllRequests = useCallback(async () => {
    setAllLoading(true);
    try {
      const response = await adjustmentApi.getAllAdjustments(
        allPage,
        DEFAULT_LIMIT,
      );
      setAllRequests(response.content);
      setAllTotalPages(response.totalPages);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setAllLoading(false);
    }
  }, [allPage, tErrors]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  // Subscribe to real-time notifications để auto refresh
  useEffect(() => {
    const unsubscribe = subscribeToNotificationEvents("ADJUSTMENT", () => {
      fetchPendingRequests();
      fetchAllRequests();
    });
    return unsubscribe;
  }, [fetchPendingRequests, fetchAllRequests]);

  // Auto-open dialog khi có highlightId từ notification click
  useEffect(() => {
    // Chỉ xử lý nếu chưa process cho URL hiện tại
    if (
      highlightId &&
      !processedForCurrentUrl &&
      !pendingLoading &&
      !allLoading
    ) {
      const allData = [...pendingRequests, ...allRequests];
      const request = allData.find((r) => r.id === highlightId);
      if (request) {
        handleRowClick(request);
        setProcessedForCurrentUrl(true);
        // Clear query param sau khi đã mở dialog
        onHighlightHandled();
      }
    }
  }, [
    highlightId,
    pendingRequests,
    allRequests,
    processedForCurrentUrl,
    pendingLoading,
    allLoading,
    onHighlightHandled,
  ]);

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  // Handle row click - open detail dialog
  const handleRowClick = (request: AdjustmentRequest) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  // Refresh cả 2 tabs sau khi approve/reject
  const refreshData = () => {
    fetchPendingRequests();
    fetchAllRequests();
    refreshPendingCounts();
  };

  // Handle approve single
  const handleApprove = async (id: number): Promise<void> => {
    try {
      setIsProcessing(true);
      await adjustmentApi.approveAdjustment(id);
      toast.success(t("adjustment.approveSuccess"));
      setDetailDialogOpen(false);
      refreshData();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject - open reject dialog
  const handleRejectClick = () => {
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;

    try {
      setIsProcessing(true);
      await adjustmentApi.rejectAdjustment(selectedRequest.id, {
        reason: rejectReason.trim(),
      });
      toast.success(t("adjustment.rejectSuccess"));
      setRejectDialogOpen(false);
      setDetailDialogOpen(false);
      refreshData();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsProcessing(true);
      await adjustmentApi.bulkApproveAdjustments(selectedIds);
      toast.success(
        t("adjustment.bulkApproveSuccess", { count: selectedIds.length }),
      );
      setSelectedIds([]);
      refreshData();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk reject
  const handleBulkRejectClick = () => {
    setBulkRejectReason("");
    setBulkRejectDialogOpen(true);
  };

  const handleBulkRejectConfirm = async () => {
    if (selectedIds.length === 0 || !bulkRejectReason.trim()) return;

    try {
      setIsProcessing(true);
      await adjustmentApi.bulkRejectAdjustments(
        selectedIds,
        bulkRejectReason.trim(),
      );
      toast.success(
        t("adjustment.bulkRejectSuccess", { count: selectedIds.length }),
      );
      setBulkRejectDialogOpen(false);
      setSelectedIds([]);
      refreshData();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = pendingRequests.map((r) => r.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Columns cho tab pending (có checkbox)
  const pendingColumns: ColumnDef<AdjustmentRequest>[] = [
    {
      id: "select",
      header: () => {
        const allSelected =
          pendingRequests.length > 0 &&
          pendingRequests.every((r) => selectedIds.includes(r.id));
        return (
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            disabled={pendingRequests.length === 0}
          />
        );
      },
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onCheckedChange={(checked) =>
              handleSelectOne(row.original.id, checked as boolean)
            }
          />
        </div>
      ),
      size: 40,
    },
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => pendingPage * DEFAULT_LIMIT + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => <AdjustmentStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "employeeName",
      header: t("table.employee"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeName}</span>
      ),
    },
    {
      accessorKey: "workDate",
      header: t("adjustment.workDate"),
      cell: ({ row }) => formatDateWithDayOfWeek(row.original.workDate, locale),
    },
    {
      accessorKey: "assignedToName",
      header: t("adjustment.assignedToName"),
      cell: ({ row }) => row.original.assignedToName || "-",
    },
    {
      accessorKey: "createdAt",
      header: t("adjustment.requestedAt"),
      cell: ({ row }) => formatDateTime(row.original.createdAt, locale),
    },
    {
      accessorKey: "reason",
      header: t("adjustment.reason"),
      cell: ({ row }) => (
        <span className="text-sm line-clamp-2">{row.original.reason}</span>
      ),
    },
  ];

  // Columns cho tab all (không có checkbox, có status)
  const allColumns: ColumnDef<AdjustmentRequest>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => allPage * DEFAULT_LIMIT + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => <AdjustmentStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "employeeName",
      header: t("table.employee"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeName}</span>
      ),
    },
    {
      accessorKey: "workDate",
      header: t("adjustment.workDate"),
      cell: ({ row }) => formatDateWithDayOfWeek(row.original.workDate, locale),
    },
    {
      accessorKey: "assignedToName",
      header: t("adjustment.assignedToName"),
      cell: ({ row }) => row.original.assignedToName || "-",
    },
    {
      accessorKey: "approverName",
      header: t("adjustment.approvedBy"),
      cell: ({ row }) => row.original.approverName || "-",
    },
    {
      accessorKey: "createdAt",
      header: t("adjustment.requestedAt"),
      cell: ({ row }) => formatDateTime(row.original.createdAt, locale),
    },
  ];

  if (pendingLoading && allLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <GlassTabs
          tabs={[
            {
              value: "pending",
              label: `${t("adjustment.pendingRequests")}${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ""}`,
            },
            { value: "all", label: t("adjustment.allRequests") },
          ]}
          value={activeTab}
          onChange={(v) => setActiveTab(v as "pending" | "all")}
        />

        {/* Bulk actions - chỉ hiển thị ở tab pending */}
        {activeTab === "pending" && selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} {tCommon("rowsSelected")}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="text-green-600"
              onClick={handleBulkApprove}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {t("adjustment.bulkApprove")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={handleBulkRejectClick}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-1" />
              {t("adjustment.bulkReject")}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4">
        {activeTab === "pending" ? (
          pendingLoading ? (
            <div className="flex items-center justify-center p-8">
              <span className="text-muted-foreground">
                {tCommon("loading")}
              </span>
            </div>
          ) : (
            <BaseTable
              columns={pendingColumns}
              data={pendingRequests}
              showPagination={pendingTotalPages > 1}
              noResultsText={t("adjustment.noRequests")}
              previousText={tCommon("previous")}
              nextText={tCommon("next")}
              onRowClick={handleRowClick}
              rowClassName={(row) =>
                highlightId === row.id
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : ""
              }
            />
          )
        ) : allLoading ? (
          <div className="flex items-center justify-center p-8">
            <span className="text-muted-foreground">{tCommon("loading")}</span>
          </div>
        ) : (
          <BaseTable
            columns={allColumns}
            data={allRequests}
            showPagination={allTotalPages > 1}
            noResultsText={t("adjustment.noRequests")}
            previousText={tCommon("previous")}
            nextText={tCommon("next")}
            onRowClick={handleRowClick}
            rowClassName={(row) =>
              highlightId === row.id
                ? "bg-primary/10 ring-1 ring-primary/30"
                : ""
            }
          />
        )}
      </div>

      {/* Detail Dialog */}
      <AdjustmentDetailDialog
        request={selectedRequest}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onApprove={handleApprove}
        onReject={handleRejectClick}
        isProcessing={isProcessing}
      />

      {/* Reject Dialog */}
      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={handleRejectConfirm}
        isProcessing={isProcessing}
      />

      {/* Bulk Reject Dialog */}
      <BulkRejectDialog
        open={bulkRejectDialogOpen}
        onOpenChange={setBulkRejectDialogOpen}
        reason={bulkRejectReason}
        onReasonChange={setBulkRejectReason}
        onConfirm={handleBulkRejectConfirm}
        isProcessing={isProcessing}
        selectedCount={selectedIds.length}
      />
    </div>
  );
}
