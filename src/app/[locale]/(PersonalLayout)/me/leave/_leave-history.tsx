"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import {
  LeaveStatusBadge,
  LeaveTypeBadge,
} from "@/app/[locale]/_components/_shared/_status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { leaveApi } from "@/lib/apis/leave-api";
import { LeaveRequest } from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

/**
 * Component hiển thị lịch sử yêu cầu nghỉ phép của nhân viên
 */
export function LeaveHistory() {
  const t = useTranslations("leave");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  // State
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(DEFAULT_PAGE);

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<LeaveRequest | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await leaveApi.getMyLeaveRequests(page, DEFAULT_LIMIT);
      setRequests(response.content);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [page, tErrors]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle cancel click
  const handleCancelClick = (request: LeaveRequest) => {
    setRequestToCancel(request);
    setCancelDialogOpen(true);
  };

  // Handle cancel confirm
  const handleCancelConfirm = async () => {
    if (!requestToCancel) return;

    try {
      setIsProcessing(true);
      await leaveApi.cancelMyLeaveRequest(requestToCancel.id);
      toast.success(t("messages.cancelSuccess"));
      setCancelDialogOpen(false);
      setRequestToCancel(null);
      fetchRequests();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Define columns
  const columns: ColumnDef<LeaveRequest>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * DEFAULT_LIMIT + row.index + 1,
      size: 60,
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
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => <LeaveStatusBadge status={row.original.status} />,
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
            size="icon"
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelClick(row.original);
            }}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        );
      },
      size: 80,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("leaveHistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <span className="text-muted-foreground">{tCommon("loading")}</span>
          </div>
        ) : (
          <BaseTable
            columns={columns}
            data={requests}
            showPagination={true}
            noResultsText={t("messages.noRequests")}
            previousText={tCommon("previous")}
            nextText={tCommon("next")}
          />
        )}
      </CardContent>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("messages.cancelSuccess").replace(
                "Đã hủy ",
                "Bạn có chắc muốn hủy ",
              )}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
