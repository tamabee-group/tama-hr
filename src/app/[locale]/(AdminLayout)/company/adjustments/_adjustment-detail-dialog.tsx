"use client";

import { useTranslations, useLocale } from "next-intl";
import { Check, X, Loader2, ArrowRight } from "lucide-react";

import { AdjustmentStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { TimeDisplay } from "@/app/[locale]/_components/_shared/_time-display";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AdjustmentRequest } from "@/types/attendance-records";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AdjustmentDetailDialogProps {
  request: AdjustmentRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: number) => Promise<void>;
  onReject: () => void;
  isProcessing: boolean;
}

/**
 * Component hiển thị chi tiết yêu cầu điều chỉnh
 * Format: giá trị cũ -> giá trị mới
 */
export function AdjustmentDetailDialog({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isProcessing,
}: AdjustmentDetailDialogProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  if (!request) return null;

  // Kiểm tra có thay đổi check in/out không
  const hasCheckInChange = request.originalCheckIn !== request.requestedCheckIn;
  const hasCheckOutChange =
    request.originalCheckOut !== request.requestedCheckOut;

  // Kiểm tra có thay đổi break time không
  const hasBreakStartChange =
    request.originalBreakStart !== request.requestedBreakStart;
  const hasBreakEndChange =
    request.originalBreakEnd !== request.requestedBreakEnd;
  const hasBreakChange = hasBreakStartChange || hasBreakEndChange;

  // Xử lý click approve - gọi trực tiếp không cần confirm dialog
  const handleApproveClick = () => {
    onApprove(request.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("adjustment.detail")}</DialogTitle>
          <DialogDescription>
            {request.employeeName} - {formatDate(request.workDate, locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status & Request time */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span className="text-sm text-muted-foreground">
              {tCommon("status")}
            </span>
            <AdjustmentStatusBadge status={request.status} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span className="text-sm text-muted-foreground">
              {t("adjustment.requestedAt")}
            </span>
            <span className="text-sm">
              {formatDateTime(request.createdAt, locale)}
            </span>
          </div>

          {/* Time changes - format: old -> new */}
          <div className="space-y-3">
            <span className="text-sm font-medium">
              {t("adjustment.comparison")}
            </span>

            {/* Check In */}
            {hasCheckInChange && (
              <TimeChangeRow
                label={t("checkIn")}
                oldTime={request.originalCheckIn}
                newTime={request.requestedCheckIn}
              />
            )}

            {/* Check Out */}
            {hasCheckOutChange && (
              <TimeChangeRow
                label={t("checkOut")}
                oldTime={request.originalCheckOut}
                newTime={request.requestedCheckOut}
              />
            )}

            {/* Break Start */}
            {hasBreakChange && hasBreakStartChange && (
              <TimeChangeRow
                label={t("breakStart")}
                oldTime={request.originalBreakStart}
                newTime={request.requestedBreakStart}
              />
            )}

            {/* Break End */}
            {hasBreakChange && hasBreakEndChange && (
              <TimeChangeRow
                label={t("breakEnd")}
                oldTime={request.originalBreakEnd}
                newTime={request.requestedBreakEnd}
              />
            )}

            {/* Không có thay đổi */}
            {!hasCheckInChange && !hasCheckOutChange && !hasBreakChange && (
              <p className="text-sm text-muted-foreground italic">
                {t("adjustment.noChanges")}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <span className="text-sm font-medium">
              {t("adjustment.reason")}
            </span>
            <p className="text-sm p-3 bg-muted rounded-md">{request.reason}</p>
          </div>

          {/* Rejection reason if rejected */}
          {request.status === "REJECTED" && request.rejectionReason && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-red-600">
                {t("adjustment.rejectionReason")}
              </span>
              <p className="text-sm p-3 bg-red-50 dark:bg-red-950 rounded-md text-red-600">
                {request.rejectionReason}
              </p>
            </div>
          )}

          {/* Approver info if approved */}
          {request.status === "APPROVED" && request.approverName && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                <span className="text-muted-foreground">
                  {t("adjustment.approvedBy")}
                </span>
                <span>{request.approverName}</span>
              </div>
              {request.approvedAt && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                  <span className="text-muted-foreground">
                    {t("adjustment.approvedAt")}
                  </span>
                  <span>{formatDateTime(request.approvedAt, locale)}</span>
                </div>
              )}
              {request.approverComment && (
                <p className="text-sm p-3 bg-green-50 dark:bg-green-950 rounded-md text-green-600">
                  {request.approverComment}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {request.status === "PENDING" ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={onReject}
                disabled={isProcessing}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-1" />
                {t("adjustment.reject")}
              </Button>
              <Button
                onClick={handleApproveClick}
                disabled={isProcessing}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                {t("adjustment.approve")}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {tCommon("close")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Component hiển thị một dòng thay đổi thời gian
 * Sử dụng prop `date` vì API trả về datetime string đầy đủ (ISO format)
 */
function TimeChangeRow({
  label,
  oldTime,
  newTime,
}: {
  label: string;
  oldTime?: string;
  newTime?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted rounded-md">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <TimeDisplay date={oldTime} className="text-muted-foreground" />
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        <TimeDisplay date={newTime} className="text-blue-600 font-medium" />
      </div>
    </div>
  );
}
