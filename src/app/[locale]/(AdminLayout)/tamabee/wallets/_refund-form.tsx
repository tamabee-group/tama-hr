"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RefundRequest } from "@/types/wallet";
import { createRefund } from "@/lib/apis/wallet-api";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

interface RefundFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  companyName: string;
  onSuccess: () => void;
}

/**
 * Component form tạo hoàn tiền cho công ty
 * - Fields: amount (number), reason (textarea)
 * - Validation: amount > 0, reason required
 */
export function RefundForm({
  open,
  onOpenChange,
  companyId,
  companyName,
  onSuccess,
}: RefundFormProps) {
  const t = useTranslations("wallet.refund");
  const tCommon = useTranslations("common");

  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>(
    {},
  );

  // Reset form
  const resetForm = () => {
    setAmount("");
    setReason("");
    setErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { amount?: string; reason?: string } = {};

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      newErrors.amount = t("amountRequired");
    } else if (amountNum <= 0) {
      newErrors.amount = t("amountInvalid");
    }

    if (!reason.trim()) {
      newErrors.reason = t("reasonRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const data: RefundRequest = {
        amount: parseFloat(amount),
        reason: reason.trim(),
      };

      await createRefund(companyId, data);
      toast.success(t("success"));
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create refund:", error);
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name (read-only) */}
          <div className="space-y-2">
            <Label>{t("company")}</Label>
            <Input value={companyName} disabled className="bg-muted" />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount")} *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder={t("amountPlaceholder")}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors((prev) => ({ ...prev, amount: undefined }));
                }
              }}
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t("reason")} *</Label>
            <Textarea
              id="reason"
              placeholder={t("reasonPlaceholder")}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors((prev) => ({ ...prev, reason: undefined }));
                }
              }}
              className={errors.reason ? "border-destructive" : ""}
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Validate refund amount
 * Export để sử dụng trong property test
 */
export function validateRefundAmount(amount: number): boolean {
  return typeof amount === "number" && !isNaN(amount) && amount > 0;
}

/**
 * Validate refund reason
 * Export để sử dụng trong property test
 */
export function validateRefundReason(reason: string): boolean {
  return typeof reason === "string" && reason.trim().length > 0;
}
