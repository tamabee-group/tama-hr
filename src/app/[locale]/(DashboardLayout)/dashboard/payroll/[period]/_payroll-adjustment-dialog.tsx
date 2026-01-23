"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { payrollPeriodApi } from "@/lib/apis/payroll-period-api";
import {
  PayrollItem,
  PayrollAdjustmentInput,
} from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { formatCurrency } from "@/lib/utils/format-currency";

interface PayrollAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  periodId: number;
  item: PayrollItem;
  onSuccess: () => void;
}

/**
 * Dialog điều chỉnh payroll item
 * Cho phép thêm/trừ số tiền và ghi lý do
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

  // Form state
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setAdjustmentAmount("");
    setAdjustmentReason("");
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

    if (!adjustmentAmount.trim()) {
      newErrors.adjustmentAmount = tValidation("required");
    } else {
      const amount = parseFloat(adjustmentAmount);
      if (isNaN(amount)) {
        newErrors.adjustmentAmount = tValidation("invalidNumber");
      }
    }

    if (!adjustmentReason.trim()) {
      newErrors.adjustmentReason = tValidation("required");
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
        amount: parseFloat(adjustmentAmount),
        reason: adjustmentReason.trim(),
      };

      await payrollPeriodApi.adjustPayrollItem(periodId, item.id, data);
      toast.success(t("adjustmentSuccess"));
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate new net salary
  const calculateNewNetSalary = (): number => {
    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount)) return item.netSalary;
    return item.netSalary + amount;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("adjustmentTitle")}</DialogTitle>
          <DialogDescription>{t("adjustmentDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Info */}
          <div className="bg-muted rounded-md p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{t("table.employee")}</span>
              <span>{item.employeeName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {t("breakdown.currentNetSalary")}
              </span>
              <span className="font-bold text-green-600">
                {formatCurrency(item.netSalary)}
              </span>
            </div>
          </div>

          {/* Adjustment Amount */}
          <div className="grid gap-2">
            <Label htmlFor="adjustmentAmount">
              {t("adjustmentAmount")}
              <span className="text-muted-foreground text-xs ml-2">
                ({t("adjustmentAmountHint")})
              </span>
            </Label>
            <Input
              id="adjustmentAmount"
              type="number"
              step="1000"
              value={adjustmentAmount}
              onChange={(e) => {
                setAdjustmentAmount(e.target.value);
                if (errors.adjustmentAmount) {
                  setErrors((prev) => ({ ...prev, adjustmentAmount: "" }));
                }
              }}
              placeholder="100000"
              className={errors.adjustmentAmount ? "border-destructive" : ""}
            />
            {errors.adjustmentAmount && (
              <p className="text-sm text-destructive">
                {errors.adjustmentAmount}
              </p>
            )}
          </div>

          {/* Adjustment Reason */}
          <div className="grid gap-2">
            <Label htmlFor="adjustmentReason">{t("adjustmentReason")}</Label>
            <Textarea
              id="adjustmentReason"
              value={adjustmentReason}
              onChange={(e) => {
                setAdjustmentReason(e.target.value);
                if (errors.adjustmentReason) {
                  setErrors((prev) => ({ ...prev, adjustmentReason: "" }));
                }
              }}
              placeholder={t("adjustmentReasonPlaceholder")}
              rows={3}
              className={errors.adjustmentReason ? "border-destructive" : ""}
            />
            {errors.adjustmentReason && (
              <p className="text-sm text-destructive">
                {errors.adjustmentReason}
              </p>
            )}
          </div>

          {/* Preview New Net Salary */}
          {adjustmentAmount && !isNaN(parseFloat(adjustmentAmount)) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {t("breakdown.newNetSalary")}
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(calculateNewNetSalary())}
                </span>
              </div>
            </div>
          )}
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
