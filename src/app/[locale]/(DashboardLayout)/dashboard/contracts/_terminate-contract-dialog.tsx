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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Các lý do chấm dứt hợp đồng phổ biến
const TERMINATION_REASONS = [
  "resignation", // Nhân viên xin nghỉ việc
  "endOfContract", // Hết hạn hợp đồng
  "mutualAgreement", // Thỏa thuận chấm dứt
  "companyRestructure", // Tái cơ cấu công ty
  "performanceIssues", // Vấn đề hiệu suất
  "violation", // Vi phạm nội quy
  "healthReasons", // Lý do sức khỏe
  "relocation", // Chuyển công tác
  "retirement", // Nghỉ hưu
  "other", // Lý do khác
] as const;

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

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state khi đóng dialog
  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    setError("");
    onClose();
  };

  // Xử lý submit
  const handleSubmit = async () => {
    if (!contract) return;

    // Validate
    const finalReason =
      selectedReason === "other"
        ? customReason.trim()
        : t(`terminationReasons.${selectedReason}`);

    if (!finalReason) {
      setError(tCommon("checkInfo"));
      return;
    }

    setIsSubmitting(true);
    try {
      await terminateContract(contract.id, {
        reason: finalReason,
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

        <div className="space-y-4 mt-4">
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

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="terminate-reason-select">
              {t("terminateReason")}
            </Label>
            <Select
              value={selectedReason}
              onValueChange={(value) => {
                setSelectedReason(value);
                if (error) setError("");
              }}
            >
              <SelectTrigger
                id="terminate-reason-select"
                className={error && !selectedReason ? "border-destructive" : ""}
              >
                <SelectValue placeholder={t("selectTerminationReason")} />
              </SelectTrigger>
              <SelectContent>
                {TERMINATION_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {t(`terminationReasons.${reason}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason Input (only show when "other" is selected) */}
          {selectedReason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">{t("customReason")}</Label>
              <Textarea
                id="custom-reason"
                placeholder={t("terminateReasonPlaceholder")}
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  if (error) setError("");
                }}
                className={error ? "border-destructive" : ""}
                rows={3}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
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
                <Spinner />
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
