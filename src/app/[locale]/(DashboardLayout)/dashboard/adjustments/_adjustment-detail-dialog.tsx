"use client";

import { useTranslations, useLocale } from "next-intl";
import { Check, X, Loader2 } from "lucide-react";

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

import { AdjustmentRequest } from "@/types/attendance-records";
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
 * Dialog hiển thị chi tiết yêu cầu điều chỉnh cho admin/manager
 * Có thể approve/reject nếu status = PENDING
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
  const locale = useLocale() as SupportedLocale;

  if (!request) return null;

  const handleApproveClick = async () => {
    await onApprove(request.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("adjustment.detail")}</DialogTitle>
          <DialogDescription>
            {getAdjustmentDialogDescription(request, locale, true)}
          </DialogDescription>
        </DialogHeader>

        <AdjustmentRequestDetail request={request} showEmployeeName />

        <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
          {request.status === "PENDING" && (
            <>
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
