"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import {
  LeaveStatusBadge,
  LeaveTypeBadge,
} from "@/app/[locale]/_components/_shared/_status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LeaveDetailDialog } from "./_leave-detail-dialog";
import { RejectLeaveDialog } from "./_reject-leave-dialog";
import { leaveApi } from "@/lib/apis/leave-api";
import { LeaveRequest } from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

/**
 * Component danh sách yêu cầu nghỉ phép chờ duyệt
 * Hỗ trợ approve/reject
 */
export function LeaveApprovalList() {
  const t = useTranslations("leave");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  // State
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(DEFAULT_PAGE);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await leaveApi.getPendingLeaveRequests(
        page,
        DEFAULT_LIMIT,
      );
      setRequests(response.content);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    }
  }, [page, tErrors]);

  // Fetch all requests
  const fetchAllRequests = useCallback(async () => {
    try {
      const response = await leaveApi.getAllLeaveRequests(page, DEFAULT_LIMIT);
      setAllRequests(response.content);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    }
  }, [page, tErrors]);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPendingRequests(), fetchAllRequests()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchPendingRequests, fetchAllRequests]);

  // Handle view detail - open dialog
  const handleViewDetail = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  // Handle approve
  const handleApprove = async (id: number) => {
    try {
      setIsProcessing(true);
      await leaveApi.approveLeave(id);
      toast.success(t("messages.approveSuccess"));
      setDetailDialogOpen(false);
      fetchPendingRequests();
      fetchAllRequests();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject click
  const handleRejectClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  // Handle reject confirm
  const handleRejectConfirm = async (reason: string) => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      await leaveApi.rejectLeave(selectedRequest.id, { reason });
      toast.success(t("messages.rejectSuccess"));
      setRejectDialogOpen(false);
      setDetailDialogOpen(false);
      setSelectedRequest(null);
      fetchPendingRequests();
      fetchAllRequests();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Define columns for pending requests
  const pendingColumns: ColumnDef<LeaveRequest>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * DEFAULT_LIMIT + row.index + 1,
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
      accessorKey: "leaveType",
      header: t("table.type"),
      cell: ({ row }) => <LeaveTypeBadge type={row.original.leaveType} />,
    },
    {
      accessorKey: "startDate",
      header: t("table.startDate"),
      cell: ({ row }) => formatDate(row.original.startDate, locale),
    },
    {
      accessorKey: "endDate",
      header: t("table.endDate"),
      cell: ({ row }) => formatDate(row.original.endDate, locale),
    },
    {
      accessorKey: "totalDays",
      header: t("table.days"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.totalDays}</span>
      ),
    },
    {
      accessorKey: "reason",
      header: t("table.reason"),
      cell: ({ row }) => (
        <span className="text-sm line-clamp-2">{row.original.reason}</span>
      ),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-green-600"
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(row.original.id);
            }}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleRejectClick(row.original);
            }}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 100,
    },
  ];

  // Define columns for all requests
  const allColumns: ColumnDef<LeaveRequest>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * DEFAULT_LIMIT + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => <LeaveStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "employeeName",
      header: t("table.employee"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeName}</span>
      ),
    },
    {
      accessorKey: "leaveType",
      header: t("table.type"),
      cell: ({ row }) => <LeaveTypeBadge type={row.original.leaveType} />,
    },
    {
      accessorKey: "startDate",
      header: t("table.startDate"),
      cell: ({ row }) => formatDate(row.original.startDate, locale),
    },
    {
      accessorKey: "endDate",
      header: t("table.endDate"),
      cell: ({ row }) => formatDate(row.original.endDate, locale),
    },
    {
      accessorKey: "totalDays",
      header: t("table.days"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.totalDays}</span>
      ),
    },
  ];

  if (loading) {
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
        <TabsList>
          <TabsTrigger value="pending">
            {t("pendingRequests")} ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="all">{tCommon("all")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <BaseTable
            columns={pendingColumns}
            data={requests}
            showPagination={true}
            noResultsText={t("messages.noRequests")}
            previousText={tCommon("previous")}
            nextText={tCommon("next")}
            onRowClick={handleViewDetail}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <BaseTable
            columns={allColumns}
            data={allRequests}
            showPagination={true}
            noResultsText={t("messages.noRequests")}
            previousText={tCommon("previous")}
            nextText={tCommon("next")}
            onRowClick={handleViewDetail}
          />
        </TabsContent>
      </Tabs>

      {/* Leave Detail Dialog */}
      <LeaveDetailDialog
        request={selectedRequest}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onApprove={handleApprove}
        onReject={handleRejectClick}
        isProcessing={isProcessing}
      />

      {/* Reject Dialog */}
      <RejectLeaveDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        isProcessing={isProcessing}
      />
    </div>
  );
}
