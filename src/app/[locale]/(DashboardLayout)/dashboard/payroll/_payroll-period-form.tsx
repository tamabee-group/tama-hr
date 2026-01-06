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
import { DatePicker } from "@/components/ui/date-picker";

import { payrollPeriodApi } from "@/lib/apis/payroll-period-api";
import { PayrollPeriodInput } from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { formatDateForApi } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface PayrollPeriodFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Dialog form tạo kỳ lương mới
 * Form với period start/end dates
 */
export function PayrollPeriodFormDialog({
  open,
  onClose,
  onSuccess,
}: PayrollPeriodFormDialogProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const locale = useLocale() as SupportedLocale;

  // Form state
  const [periodStart, setPeriodStart] = useState<Date | undefined>(undefined);
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setPeriodStart(undefined);
    setPeriodEnd(undefined);
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

    if (!periodStart) {
      newErrors.periodStart = tValidation("required");
    }

    if (!periodEnd) {
      newErrors.periodEnd = tValidation("required");
    }

    if (periodStart && periodEnd && periodStart > periodEnd) {
      newErrors.periodEnd = tValidation("endDateAfterStart");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const data: PayrollPeriodInput = {
        periodStart: formatDateForApi(periodStart) || "",
        periodEnd: formatDateForApi(periodEnd) || "",
      };

      await payrollPeriodApi.createPayrollPeriod(data);
      toast.success(t("periodCreateSuccess"));
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-fill dates based on selected month
  const handlePeriodStartChange = (value: Date | undefined) => {
    setPeriodStart(value);

    // Auto-fill end date to end of month
    if (value) {
      const endDate = new Date(value.getFullYear(), value.getMonth() + 1, 0);
      setPeriodEnd(endDate);
    }

    // Clear error
    if (errors.periodStart) {
      setErrors((prev) => ({ ...prev, periodStart: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("createPeriod")}</DialogTitle>
          <DialogDescription>{t("createPeriodDescription")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Period Start */}
          <div className="grid gap-2">
            <Label htmlFor="periodStart">{t("periodStart")}</Label>
            <DatePicker
              value={periodStart}
              onChange={handlePeriodStartChange}
              locale={locale}
              placeholder={t("periodStart")}
              className={`w-full ${errors.periodStart ? "border-destructive" : ""}`}
            />
            {errors.periodStart && (
              <p className="text-sm text-destructive">{errors.periodStart}</p>
            )}
          </div>

          {/* Period End */}
          <div className="grid gap-2">
            <Label htmlFor="periodEnd">{t("periodEnd")}</Label>
            <DatePicker
              value={periodEnd}
              onChange={(value) => {
                setPeriodEnd(value);
                if (errors.periodEnd) {
                  setErrors((prev) => ({ ...prev, periodEnd: "" }));
                }
              }}
              locale={locale}
              placeholder={t("periodEnd")}
              className={`w-full ${errors.periodEnd ? "border-destructive" : ""}`}
            />
            {errors.periodEnd && (
              <p className="text-sm text-destructive">{errors.periodEnd}</p>
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
