"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";
import { EmploymentContract } from "@/types/attendance-records";
import { terminateContract } from "@/lib/apis/contract-api";
import { formatDate } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface TerminateContractDialogProps {
  open: boolean;
  onClose: () => void;
  contract: EmploymentContract | null;
  onSuccess: () => void;
}

/**
 * Dialog xác nhận chấm dứt hợp đồng lao động
 * Yêu cầu nhập lý do chấm dứt
 */
export function TerminateContractDialog({
  open,
  onClose,
  contract,
  onSuccess,
}: TerminateContractDialogProps) {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state khi đóng dialog
  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  // Xử lý submit
  const handleSubmit = async () => {
    if (!contract) return;

    // Validate
    if (!reason.trim()) {
      setError(tCommon("checkInfo"));
      return;
    }

    setIsSubmitting(true);
    try {
      await terminateContract(contract.id, {
        reason: reason.trim(),
      });
      toast.success(t("terminateSuccess"));
      handleClose();
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage((err as Error).message, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle>{t("terminateTitle")}</DialogTitle>
              <DialogDescription className="mt-1">
                {t("table.contractNumber")}: {contract.contractNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contract Info Summary */}
          <div className="rounded-md bg-muted p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("table.employee")}
              </span>
              <span className="font-medium">{contract.employeeName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("table.period")}</span>
              <span>
                {formatDate(contract.startDate, locale)} -{" "}
                {formatDate(contract.endDate, locale)}
              </span>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="terminate-reason">{t("terminateReason")}</Label>
            <Textarea
              id="terminate-reason"
              placeholder={t("terminateReasonPlaceholder")}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              className={error ? "border-destructive" : ""}
              rows={3}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                {tCommon("loading")}
              </>
            ) : (
              tCommon("confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
