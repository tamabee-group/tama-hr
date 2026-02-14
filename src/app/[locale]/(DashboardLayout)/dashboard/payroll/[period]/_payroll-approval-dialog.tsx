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
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface PayrollApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  periodId: number;
  action: "submit" | "approve" | "pay" | "reject";
  onSuccess: () => void;
}

/**
 * Dialog xác nhận workflow actions cho payroll period
 * Hỗ trợ: submit, approve, pay, reject
 */
export function PayrollApprovalDialog({
  open,
  onClose,
  periodId,
  action,
  onSuccess,
}: PayrollApprovalDialogProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");

  // Form state
  const [paymentReference, setPaymentReference] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRejectTemplate, setSelectedRejectTemplate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setPaymentReference("");
    setRejectReason("");
    setSelectedRejectTemplate("");
    setErrors({});
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get dialog content based on action
  const getDialogContent = () => {
    switch (action) {
      case "submit":
        return {
          title: t("submitConfirmTitle"),
          description: t("submitConfirmDesc"),
          confirmText: t("submitForReview"),
          variant: "default" as const,
        };
      case "approve":
        return {
          title: t("approveConfirmTitle"),
          description: t("approveConfirmDesc"),
          confirmText: t("approve"),
          variant: "default" as const,
        };
      case "pay":
        return {
          title: t("payConfirmTitle"),
          description: t("payConfirmDesc"),
          confirmText: t("markAsPaid"),
          variant: "default" as const,
        };
      case "reject":
        return {
          title: t("rejectConfirmTitle"),
          description: t("rejectConfirmDesc"),
          confirmText: tCommon("confirm"),
          variant: "destructive" as const,
        };
      default:
        return {
          title: "",
          description: "",
          confirmText: tCommon("confirm"),
          variant: "default" as const,
        };
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (action === "reject" && !rejectReason.trim()) {
      newErrors.rejectReason = tValidation("required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      switch (action) {
        case "submit":
          await payrollPeriodApi.submitForReview(periodId);
          toast.success(t("submitSuccess"));
          break;
        case "approve":
          await payrollPeriodApi.approvePayroll(periodId);
          toast.success(t("approveSuccess"));
          break;
        case "pay":
          await payrollPeriodApi.markAsPaid(
            periodId,
            paymentReference || undefined,
          );
          toast.success(t("markPaidSuccess"));
          break;
        case "reject":
          await payrollPeriodApi.rejectPayroll(periodId, rejectReason.trim());
          toast.success(t("rejectSuccess"));
          break;
      }
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setSubmitting(false);
    }
  };

  const content = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Payment Reference - only for pay action */}
          {action === "pay" && (
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="paymentReference">
                  {t("paymentReference")}
                </Label>
                <span className="text-xs text-muted-foreground">
                  ({tCommon("optional")})
                </span>
              </div>
              <Input
                id="paymentReference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder={t("paymentReferencePlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("paymentReferenceHint")}
              </p>
            </div>
          )}

          {/* Reject Reason - only for reject action */}
          {action === "reject" && (
            <div className="grid gap-3">
              <Label>{t("rejectReason")}</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "wrongData",
                  "missingEmployee",
                  "wrongCalculation",
                  "other",
                ].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedRejectTemplate(key);
                      if (key !== "other") {
                        setRejectReason(t(`rejectTemplates.${key}`));
                        if (errors.rejectReason) {
                          setErrors((prev) => ({ ...prev, rejectReason: "" }));
                        }
                      } else {
                        setRejectReason("");
                      }
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selectedRejectTemplate === key
                        ? "bg-destructive/10 border-destructive text-destructive"
                        : "border-border text-muted-foreground hover:border-foreground/50"
                    }`}
                  >
                    {t(`rejectTemplates.${key}`)}
                  </button>
                ))}
              </div>
              {selectedRejectTemplate === "other" && (
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (errors.rejectReason) {
                      setErrors((prev) => ({ ...prev, rejectReason: "" }));
                    }
                  }}
                  placeholder={t("rejectReasonPlaceholder")}
                  rows={3}
                />
              )}
              {errors.rejectReason && (
                <p className="text-sm text-destructive">
                  {errors.rejectReason}
                </p>
              )}
            </div>
          )}

          {/* Warning for approve action */}
          {action === "approve" && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t("approveWarning")}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant={
              content.variant === "destructive" ? "destructive" : "default"
            }
          >
            {submitting ? tCommon("loading") : content.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
