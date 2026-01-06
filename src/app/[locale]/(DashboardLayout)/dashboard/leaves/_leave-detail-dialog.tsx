"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Check, X, Loader2 } from "lucide-react";

import {
  LeaveStatusBadge,
  LeaveTypeBadge,
} from "@/app/[locale]/_components/_shared/_status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";

import { LeaveRequest } from "@/types/attendance-records";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface LeaveDetailDialogProps {
  request: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: number) => void;
  onReject: (request: LeaveRequest) => void;
  isProcessing: boolean;
}

/**
 * Dialog hiển thị chi tiết yêu cầu nghỉ phép
 */
export function LeaveDetailDialog({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isProcessing,
}: LeaveDetailDialogProps) {
  const t = useTranslations("leave");
  const tCommon = useTranslations("common");
  const tDialogs = useTranslations("dialogs");
  const locale = useLocale() as SupportedLocale;

  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);

  if (!request) return null;

  const isPending = request.status === "PENDING";

  const handleApproveClick = () => {
    setConfirmApproveOpen(true);
  };

  const handleConfirmApprove = () => {
    setConfirmApproveOpen(false);
    onApprove(request.id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {t("title")}
              <LeaveStatusBadge status={request.status} />
            </DialogTitle>
            <DialogDescription>{request.employeeName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Leave Type & Days */}
            <div className="flex items-center justify-between">
              <LeaveTypeBadge type={request.leaveType} />
              <span className="font-medium">
                {request.totalDays} {t("table.days").toLowerCase()}
              </span>
            </div>

            <Separator />

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("table.startDate")}
                </p>
                <p className="font-medium">
                  {formatDate(request.startDate, locale)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("table.endDate")}
                </p>
                <p className="font-medium">
                  {formatDate(request.endDate, locale)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Reason */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t("table.reason")}
              </p>
              <p className="text-sm p-3 bg-muted rounded-md">
                {request.reason}
              </p>
            </div>

            {/* Created At */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {tCommon("createdAt")}
              </span>
              <span>{formatDateTime(request.createdAt, locale)}</span>
            </div>

            {/* Approver Info */}
            {request.approverName && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("table.approvedBy")}
                    </span>
                    <span>{request.approverName}</span>
                  </div>
                  {request.approvedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("table.approvedAt")}
                      </span>
                      <span>{formatDateTime(request.approvedAt, locale)}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Rejection Reason */}
            {request.rejectionReason && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">
                    {t("rejectionReason")}
                  </p>
                  <p className="text-sm p-3 bg-red-50 dark:bg-red-950 rounded-md text-destructive">
                    {request.rejectionReason}
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isPending ? (
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
                  onClick={() => onReject(request)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t("reject")}
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
                  {t("approve")}
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

      {/* Confirm Approve Dialog */}
      <AlertDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDialogs("confirmApprove")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("approveConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
