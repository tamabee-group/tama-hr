"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShiftSwapRequest } from "@/types/attendance-records";
import { formatDateWithDayOfWeek } from "@/lib/utils/format-date-time";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface SwapApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  swapRequest: ShiftSwapRequest | null;
  action: "approve" | "reject";
  onConfirm: (reason?: string) => void;
  isSubmitting: boolean;
}

/**
 * Dialog xác nhận duyệt/từ chối yêu cầu đổi ca
 * Với action reject, yêu cầu nhập lý do
 */
export function SwapApprovalDialog({
  open,
  onOpenChange,
  swapRequest,
  action,
  onConfirm,
  isSubmitting,
}: SwapApprovalDialogProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const tDialogs = useTranslations("dialogs");
  const locale = useLocale() as SupportedLocale;

  // Sử dụng key để reset form khi swapRequest thay đổi
  const formKey = swapRequest?.id ?? "new";

  if (!swapRequest) return null;

  const isApprove = action === "approve";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isApprove ? tDialogs("approveTitle") : tDialogs("rejectTitle")}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? tDialogs("approveDescription")
              : tDialogs("rejectDescription")}
          </DialogDescription>
        </DialogHeader>

        <SwapApprovalForm
          key={formKey}
          swapRequest={swapRequest}
          action={action}
          onConfirm={onConfirm}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          locale={locale}
          t={t}
          tCommon={tCommon}
        />
      </DialogContent>
    </Dialog>
  );
}

// Form component riêng để reset state khi key thay đổi
interface SwapApprovalFormProps {
  swapRequest: ShiftSwapRequest;
  action: "approve" | "reject";
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  locale: SupportedLocale;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}

function SwapApprovalForm({
  swapRequest,
  action,
  onConfirm,
  onCancel,
  isSubmitting,
  locale,
  t,
  tCommon,
}: SwapApprovalFormProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const isApprove = action === "approve";

  // Format thời gian HH:mm
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  // Xử lý submit
  const handleSubmit = () => {
    if (action === "reject" && !reason.trim()) {
      setError(tCommon("checkInfo"));
      return;
    }
    onConfirm(action === "reject" ? reason : undefined);
  };

  return (
    <>
      <div className="space-y-4 py-4">
        {/* Tóm tắt yêu cầu */}
        <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("requester")}:</span>
            <span className="font-medium">{swapRequest.requesterName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("requesterShift")}:
            </span>
            <span>
              {swapRequest.requesterShift.shiftName} -{" "}
              {formatDateWithDayOfWeek(
                swapRequest.requesterShift.workDate,
                locale,
              )}{" "}
              {formatTime(swapRequest.requesterShift.shiftStartTime || "")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("targetEmployee")}:
            </span>
            <span className="font-medium">
              {swapRequest.targetEmployeeName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("targetShift")}:</span>
            <span>
              {swapRequest.targetShift.shiftName} -{" "}
              {formatDateWithDayOfWeek(
                swapRequest.targetShift.workDate,
                locale,
              )}{" "}
              {formatTime(swapRequest.targetShift.shiftStartTime || "")}
            </span>
          </div>
        </div>

        {/* Lý do từ chối (chỉ hiển thị khi reject) */}
        {!isApprove && (
          <div className="space-y-2">
            <Label htmlFor="reason">{t("rejectionReason")}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder={t("rejectionReason")}
              rows={3}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {tCommon("cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant={isApprove ? "default" : "destructive"}
        >
          {isSubmitting ? tCommon("loading") : tCommon("confirm")}
        </Button>
      </DialogFooter>
    </>
  );
}
