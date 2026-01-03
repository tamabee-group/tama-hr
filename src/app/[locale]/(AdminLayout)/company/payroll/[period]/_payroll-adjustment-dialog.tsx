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
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";

import { payrollPeriodApi } from "@/lib/apis/payroll-period-api";
import {
  PayrollItem,
  PayrollAdjustmentInput,
} from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface PayrollAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  periodId: number;
  item: PayrollItem;
  onSuccess: () => void;
}

/**
 * Dialog điều chỉnh lương
 * Form yêu cầu amount và reason
 */
export function PayrollAdjustmentDialog({
  open,
  onClose,
  periodId,
  item,
  onSuccess,
}: PayrollAdjustmentDialogProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const locale = useLocale() as SupportedLocale;

  // Form state
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setAmount("");
    setReason("");
    setErrors({});
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount) {
      newErrors.amount = tValidation("required");
    } else if (isNaN(parseFloat(amount))) {
      newErrors.amount = tValidation("invalidNumber");
    }

    if (!reason.trim()) {
      newErrors.reason = tValidation("required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const data: PayrollAdjustmentInput = {
        amount: parseFloat(amount),
        reason: reason.trim(),
      };

      await payrollPeriodApi.adjustPayrollItem(periodId, item.id, data);
      toast.success(t("adjustSuccess"));
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate new net salary
  const newNetSalary = item.netSalary + (parseFloat(amount) || 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("adjustmentTitle")}</DialogTitle>
          <DialogDescription>
            {item.employeeName} - {t("table.netSalary")}:{" "}
            {formatCurrency(item.netSalary, locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Current Info */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-md">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("table.grossSalary")}
              </p>
              <p className="font-medium">
                {formatCurrency(item.grossSalary, locale)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("table.netSalary")}
              </p>
              <p className="font-medium text-green-600">
                {formatCurrency(item.netSalary, locale)}
              </p>
            </div>
          </div>

          {/* Adjustment Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">{t("adjustmentAmount")}</Label>
            <InputGroup>
              <InputGroupInput
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    setErrors((prev) => ({ ...prev, amount: "" }));
                  }
                }}
                placeholder="0"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>¥</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("newNetSalary")}:{" "}
              <span
                className={
                  newNetSalary >= item.netSalary
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {formatCurrency(newNetSalary, locale)}
              </span>
            </p>
          </div>

          {/* Reason */}
          <div className="grid gap-2">
            <Label htmlFor="reason">{t("adjustmentReason")}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors((prev) => ({ ...prev, reason: "" }));
                }
              }}
              placeholder={t("adjustmentReasonPlaceholder")}
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? tCommon("loading") : tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
