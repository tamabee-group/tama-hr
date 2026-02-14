"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  AdjustmentRequestDetail,
  getAdjustmentDialogDescription,
} from "@/app/[locale]/_components/_shared/attendance";
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

import { unifiedAttendanceApi } from "@/lib/apis/unified-attendance-api";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { AdjustmentRequest } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface ViewAdjustmentDialogProps {
  request: AdjustmentRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelSuccess: () => void;
}

/**
 * Dialog xem chi tiết yêu cầu điều chỉnh cho employee
 * Có thể hủy nếu status = PENDING
 */
export function ViewAdjustmentDialog({
  request,
  open,
  onOpenChange,
  onCancelSuccess,
}: ViewAdjustmentDialogProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const [isCancelling, setIsCancelling] = React.useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  if (!request) return null;

  const canCancel = request.status === "PENDING";

  // Xử lý hủy yêu cầu
  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      await unifiedAttendanceApi.cancelAdjustmentRequest(request.id);
      toast.success(t("adjustment.cancelSuccess"));
      setShowCancelConfirm(false);
      onOpenChange(false);
      onCancelSuccess();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="md:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("adjustment.detail")}</DialogTitle>
            <DialogDescription>
              {getAdjustmentDialogDescription(request, locale)}
            </DialogDescription>
          </DialogHeader>

          <AdjustmentRequestDetail request={request} />

          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-1" />
                {t("adjustment.cancelRequest")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm cancel dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("adjustment.cancelConfirm")}
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
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              )}
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
