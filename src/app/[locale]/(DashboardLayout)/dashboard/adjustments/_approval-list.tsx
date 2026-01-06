"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { AdjustmentStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdjustmentDetailDialog } from "./_adjustment-detail-dialog";
import { RejectDialog, BulkRejectDialog } from "./_reject-dialog";

import { adjustmentApi } from "@/lib/apis/adjustment-api";
import { AdjustmentRequest } from "@/types/attendance-records";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
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
      accessorKey: "employeeName",
      header: t("table.employee"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeName}</span>
      ),
    },
    {
      accessorKey: "workDate",
      header: t("adjustment.workDate"),
      cell: ({ row }) => formatDate(row.original.workDate, locale),
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
      cell: ({ row }) => formatDate(row.original.workDate, locale),
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
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "pending" | "all")}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending">
              {t("adjustment.pendingRequests")}
              {pendingRequests.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">{t("adjustment.allRequests")}</TabsTrigger>
          </TabsList>

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

        <TabsContent value="pending" className="mt-4">
          {pendingLoading ? (
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
            />
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          {allLoading ? (
            <div className="flex items-center justify-center p-8">
              <span className="text-muted-foreground">
                {tCommon("loading")}
              </span>
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
            />
          )}
        </TabsContent>
      </Tabs>

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
