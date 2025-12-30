"use client";

import { useState } from "react";
import { RefundRequest } from "@/types/wallet";
import { createRefund } from "@/lib/apis/wallet-api";
import { SupportedLocale } from "@/lib/utils/format-currency";
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
  locale?: SupportedLocale;
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
  locale = "vi",
}: RefundFormProps) {
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>(
    {},
  );

  // Labels theo locale
  const labels = {
    vi: {
      title: "Hoàn tiền",
      description: "Tạo giao dịch hoàn tiền cho công ty",
      company: "Công ty",
      amount: "Số tiền",
      amountPlaceholder: "Nhập số tiền hoàn",
      reason: "Lý do",
      reasonPlaceholder: "Nhập lý do hoàn tiền...",
      cancel: "Hủy",
      submit: "Hoàn tiền",
      submitting: "Đang xử lý...",
      success: "Hoàn tiền thành công",
      error: "Không thể hoàn tiền",
      amountRequired: "Vui lòng nhập số tiền",
      amountInvalid: "Số tiền phải lớn hơn 0",
      reasonRequired: "Vui lòng nhập lý do",
    },
    en: {
      title: "Refund",
      description: "Create a refund transaction for the company",
      company: "Company",
      amount: "Amount",
      amountPlaceholder: "Enter refund amount",
      reason: "Reason",
      reasonPlaceholder: "Enter refund reason...",
      cancel: "Cancel",
      submit: "Refund",
      submitting: "Processing...",
      success: "Refund successful",
      error: "Failed to process refund",
      amountRequired: "Please enter an amount",
      amountInvalid: "Amount must be greater than 0",
      reasonRequired: "Please enter a reason",
    },
    ja: {
      title: "返金",
      description: "会社への返金取引を作成",
      company: "会社",
      amount: "金額",
      amountPlaceholder: "返金額を入力",
      reason: "理由",
      reasonPlaceholder: "返金理由を入力...",
      cancel: "キャンセル",
      submit: "返金",
      submitting: "処理中...",
      success: "返金が完了しました",
      error: "返金処理に失敗しました",
      amountRequired: "金額を入力してください",
      amountInvalid: "金額は0より大きい必要があります",
      reasonRequired: "理由を入力してください",
    },
  };

  const t = labels[locale];

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
      newErrors.amount = t.amountRequired;
    } else if (amountNum <= 0) {
      newErrors.amount = t.amountInvalid;
    }

    if (!reason.trim()) {
      newErrors.reason = t.reasonRequired;
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
      toast.success(t.success);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create refund:", error);
      toast.error(t.error);
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
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name (read-only) */}
          <div className="space-y-2">
            <Label>{t.company}</Label>
            <Input value={companyName} disabled className="bg-muted" />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t.amount} *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder={t.amountPlaceholder}
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
            <Label htmlFor="reason">{t.reason} *</Label>
            <Textarea
              id="reason"
              placeholder={t.reasonPlaceholder}
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
              {t.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
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
