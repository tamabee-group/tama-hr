"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { AdjustmentStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { TimeDisplay } from "@/app/[locale]/_components/_shared/_time-display";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { adjustmentApi } from "@/lib/apis/adjustment-api";
import { AdjustmentRequest } from "@/types/attendance-records";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

/**
 * Component danh sách yêu cầu điều chỉnh của nhân viên
 * Hiển thị trạng thái và cho phép hủy yêu cầu pending
 */
export function MyAdjustments() {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  // State
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(DEFAULT_PAGE);
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Backend hiện không hỗ trợ filter theo status
      // TODO: Thêm filter vào backend
      const response = await adjustmentApi.getMyAdjustments(
        page,
        DEFAULT_LIMIT,
      );
      // Filter client-side nếu cần
      const filteredRequests =
        activeTab === "pending"
          ? response.content.filter((r) => r.status === "PENDING")
          : response.content;
      setRequests(filteredRequests);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, tErrors]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle cancel click
  const handleCancelClick = (id: number) => {
    setCancelingId(id);
    setCancelDialogOpen(true);
  };

  // Handle cancel confirm
  const handleCancelConfirm = async () => {
    if (!cancelingId) return;

    try {
      setIsProcessing(true);
      await adjustmentApi.cancelMyAdjustment(cancelingId);
      toast.success(t("adjustment.cancelSuccess"));
      setCancelDialogOpen(false);
      fetchRequests();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Define columns
  const columns: ColumnDef<AdjustmentRequest>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * DEFAULT_LIMIT + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "workDate",
      header: t("adjustment.workDate"),
      cell: ({ row }) => formatDate(row.original.workDate, locale),
    },
    {
      id: "originalTime",
      header: t("adjustment.originalTime"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("checkIn")}:
            </span>
            <TimeDisplay time={row.original.originalCheckIn} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("checkOut")}:
            </span>
            <TimeDisplay time={row.original.originalCheckOut} />
          </div>
        </div>
      ),
    },
    {
      id: "requestedTime",
      header: t("adjustment.requestedTime"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("checkIn")}:
            </span>
            <TimeDisplay
              time={row.original.requestedCheckIn}
              className="text-blue-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("checkOut")}:
            </span>
            <TimeDisplay
              time={row.original.requestedCheckOut}
              className="text-blue-600"
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: t("adjustment.reason"),
      cell: ({ row }) => (
        <span className="text-sm line-clamp-2">{row.original.reason}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("adjustment.requestDate"),
      cell: ({ row }) => formatDateTime(row.original.createdAt, locale),
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => <AdjustmentStatusBadge status={row.original.status} />,
    },
    {
      id: "result",
      header: "",
      cell: ({ row }) => {
        const { status, approverName, rejectionReason } = row.original;

        if (status === "APPROVED" && approverName) {
          return (
            <span className="text-xs text-muted-foreground">
              {t("adjustment.approvedBy")}: {approverName}
            </span>
          );
        }

        if (status === "REJECTED" && rejectionReason) {
          return (
            <span className="text-xs text-red-600 line-clamp-1">
              {rejectionReason}
            </span>
          );
        }

        return null;
      },
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => {
        const isPending = row.original.status === "PENDING";
        if (!isPending) return null;

        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => handleCancelClick(row.original.id)}
            disabled={isProcessing}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
      size: 80,
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
        onValueChange={(v) => setActiveTab(v as "all" | "pending")}
      >
        <TabsList>
          <TabsTrigger value="all">{t("adjustment.allRequests")}</TabsTrigger>
          <TabsTrigger value="pending">
            {t("adjustment.pendingRequests")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <BaseTable
            columns={columns}
            data={requests}
            showPagination={true}
            noResultsText={t("adjustment.noRequests")}
            previousText={tCommon("previous")}
            nextText={tCommon("next")}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <BaseTable
            columns={columns}
            data={requests}
            showPagination={true}
            noResultsText={t("adjustment.noRequests")}
            previousText={tCommon("previous")}
            nextText={tCommon("next")}
          />
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("adjustment.cancelRequest")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("adjustment.cancelConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
