"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { X, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import {
  LeaveStatusBadge,
  LeaveTypeBadge,
} from "@/app/[locale]/_components/_shared/display/_status-badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { leaveApi } from "@/lib/apis/leave-api";
import { LeaveRequest } from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date-time";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface LeaveHistoryProps {
  requests: LeaveRequest[];
  onRefresh: () => void;
  highlightId?: number | null;
  onClearHighlight?: () => void;
}

// ============================================
// Leave Detail Dialog
// ============================================

function LeaveDetailDialog({
  request,
  open,
  onOpenChange,
  locale,
}: {
  request: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: SupportedLocale;
}) {
  const t = useTranslations("portal.leave");

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b border-primary pb-4">
          <DialogTitle>{t("detailTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2">
            <LeaveTypeBadge type={request.leaveType} />
            <LeaveStatusBadge status={request.status} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("dateRange")}</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatDate(request.startDate, locale)} -{" "}
                {formatDate(request.endDate, locale)}
              </span>
              <span className="text-muted-foreground">
                ({request.totalDays} {t("days")})
              </span>
            </div>
          </div>
          {request.reason && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("reason")}</p>
              <p className="text-sm">{request.reason}</p>
            </div>
          )}
          {request.approverName && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("approver")}</p>
              <p className="text-sm font-medium">{request.approverName}</p>
            </div>
          )}
          {request.status === "REJECTED" && request.rejectionReason && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
              <p className="text-sm font-medium mb-1">{t("rejectionReason")}</p>
              <p className="text-sm">{request.rejectionReason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Component
// ============================================

export function LeaveHistory({
  requests,
  onRefresh,
  highlightId,
  onClearHighlight,
}: LeaveHistoryProps) {
  const t = useTranslations("portal.leave");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<LeaveRequest | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );

  // Mở dialog khi có highlightId
  useEffect(() => {
    if (highlightId && requests.length > 0) {
      const request = requests.find((r) => r.id === highlightId);
      if (request) {
        setSelectedRequest(request);
        setDetailDialogOpen(true);
      }
    }
  }, [highlightId, requests]);

  const handleDetailDialogClose = (open: boolean) => {
    setDetailDialogOpen(open);
    if (!open && onClearHighlight) {
      onClearHighlight();
    }
  };

  const handleCancelClick = (request: LeaveRequest) => {
    setRequestToCancel(request);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!requestToCancel) return;
    try {
      setIsProcessing(true);
      await leaveApi.cancelMyLeaveRequest(requestToCancel.id);
      toast.success(t("cancelSuccess"));
      setCancelDialogOpen(false);
      setRequestToCancel(null);
      onRefresh();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Cột cho BaseTable
  const columns: ColumnDef<LeaveRequest>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 60,
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => <LeaveStatusBadge status={row.original.status} />,
      size: 120,
    },
    {
      accessorKey: "leaveType",
      header: t("type"),
      cell: ({ row }) => <LeaveTypeBadge type={row.original.leaveType} />,
      size: 140,
    },
    {
      accessorKey: "startDate",
      header: t("dateRange"),
      cell: ({ row }) => (
        <span>
          {formatDate(row.original.startDate, locale)} -{" "}
          {formatDate(row.original.endDate, locale)}
        </span>
      ),
    },
    {
      accessorKey: "totalDays",
      header: t("totalDays"),
      cell: ({ row }) => (
        <span>
          {row.original.totalDays} {t("days")}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "reason",
      header: t("reason"),
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.reason && (
            <p className="line-clamp-2">{row.original.reason}</p>
          )}
          {row.original.status === "REJECTED" &&
            row.original.rejectionReason && (
              <p className="text-xs text-destructive line-clamp-1">
                {t("rejectionReason")}: {row.original.rejectionReason}
              </p>
            )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "PENDING" ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelClick(row.original);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null,
      size: 50,
    },
  ];

  return (
    <>
      <BaseTable
        columns={columns}
        data={requests}
        showPagination={false}
        noResultsText={t("noHistory")}
        onRowClick={(item) => {
          setSelectedRequest(item);
          setDetailDialogOpen(true);
        }}
      />

      {/* Detail Dialog */}
      <LeaveDetailDialog
        request={selectedRequest}
        open={detailDialogOpen}
        onOpenChange={handleDetailDialogClose}
        locale={locale}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelDescription")}
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
              {isProcessing && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
