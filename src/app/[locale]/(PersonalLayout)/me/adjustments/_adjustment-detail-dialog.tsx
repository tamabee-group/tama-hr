"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { AdjustmentRequestDetail } from "@/app/[locale]/_components/_shared/attendance";

import { adjustmentApi } from "@/lib/apis/adjustment-api";
import { formatDateWithDayOfWeek } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { AdjustmentRequest } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AdjustmentDetailDialogProps {
  request: AdjustmentRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelSuccess: () => void;
}

/**
 * Dialog hiển thị chi tiết yêu cầu điều chỉnh chấm công
 */
export function AdjustmentDetailDialog({
  request,
  open,
  onOpenChange,
  onCancelSuccess,
}: AdjustmentDetailDialogProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  if (!request) return null;

  const isPending = request.status === "PENDING";

  // Hủy yêu cầu
  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      await adjustmentApi.cancelMyAdjustment(request.id);
      toast.success(t("messages.cancelSuccess"));
      setIsConfirmOpen(false);
      onOpenChange(false);
      onCancelSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle>{t("adjustment.detail")}</DialogTitle>
              <Badge
                variant={
                  isPending
                    ? "secondary"
                    : request.status === "APPROVED"
                      ? "default"
                      : "destructive"
                }
              >
                {getEnumLabel("adjustmentStatus", request.status, tEnums)}
              </Badge>
            </div>
            <DialogDescription>
              {formatDateWithDayOfWeek(request.workDate, locale)}
            </DialogDescription>
          </DialogHeader>

          <AdjustmentRequestDetail request={request} />

          {/* Nút hủy yêu cầu nếu đang pending */}
          {isPending && (
            <div className="flex justify-end pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsConfirmOpen(true)}
              >
                <X className="h-4 w-4 mr-1" />
                {t("adjustment.cancelRequest")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Xác nhận hủy */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.cancelDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling && (
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
