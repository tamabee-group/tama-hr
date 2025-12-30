"use client";

import { useState } from "react";
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
import { ImageUpload } from "@/app/[locale]/_components/_image-upload";
import { depositApi } from "@/lib/apis/deposit-api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SupportedLocale } from "@/lib/utils/format-currency";

export interface DepositFormData {
  amount: number;
  transferProofUrl: string;
}

// Hàm validate amount - export để test
export function validateAmount(amount: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof amount !== "number" || isNaN(amount)) {
    return { valid: false, error: "Số tiền phải là số hợp lệ" };
  }
  if (amount <= 0) {
    return { valid: false, error: "Số tiền phải lớn hơn 0" };
  }
  return { valid: true };
}

interface DepositFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  locale?: SupportedLocale;
}

/**
 * Component form tạo yêu cầu nạp tiền
 * - Fields: amount (number input), transferProofUrl (image upload)
 * - Validation: amount > 0, transferProofUrl required
 * - Preview ảnh trước khi submit
 */
export function DepositForm({
  open,
  onOpenChange,
  onSuccess,
  locale = "vi",
}: DepositFormProps) {
  const [amount, setAmount] = useState<string>("");
  const [transferProofUrl, setTransferProofUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    transferProofUrl?: string;
  }>({});

  // Labels theo locale
  const labels = {
    vi: {
      title: "Tạo yêu cầu nạp tiền",
      description: "Nhập số tiền và tải lên ảnh chứng minh chuyển khoản",
      amount: "Số tiền (VND)",
      amountPlaceholder: "Nhập số tiền cần nạp",
      transferProof: "Ảnh chứng minh chuyển khoản",
      cancel: "Hủy",
      submit: "Gửi yêu cầu",
      submitting: "Đang gửi...",
      successMessage: "Yêu cầu nạp tiền đã được gửi thành công",
      errorMessage: "Không thể gửi yêu cầu. Vui lòng thử lại.",
      amountRequired: "Vui lòng nhập số tiền",
      amountInvalid: "Số tiền phải lớn hơn 0",
      transferProofRequired: "Vui lòng tải lên ảnh chứng minh chuyển khoản",
    },
    en: {
      title: "Create Deposit Request",
      description: "Enter amount and upload transfer proof image",
      amount: "Amount (VND)",
      amountPlaceholder: "Enter deposit amount",
      transferProof: "Transfer Proof Image",
      cancel: "Cancel",
      submit: "Submit Request",
      submitting: "Submitting...",
      successMessage: "Deposit request submitted successfully",
      errorMessage: "Failed to submit request. Please try again.",
      amountRequired: "Please enter amount",
      amountInvalid: "Amount must be greater than 0",
      transferProofRequired: "Please upload transfer proof image",
    },
    ja: {
      title: "入金リクエストを作成",
      description: "金額を入力し、振込証明画像をアップロードしてください",
      amount: "金額 (VND)",
      amountPlaceholder: "入金額を入力",
      transferProof: "振込証明画像",
      cancel: "キャンセル",
      submit: "リクエストを送信",
      submitting: "送信中...",
      successMessage: "入金リクエストが正常に送信されました",
      errorMessage: "リクエストの送信に失敗しました。もう一度お試しください。",
      amountRequired: "金額を入力してください",
      amountInvalid: "金額は0より大きくなければなりません",
      transferProofRequired: "振込証明画像をアップロードしてください",
    },
  };

  const t = labels[locale];

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { amount?: string; transferProofUrl?: string } = {};

    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || amount.trim() === "") {
      newErrors.amount = t.amountRequired;
    } else if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = t.amountInvalid;
    }

    // Validate transferProofUrl
    if (!transferProofUrl || transferProofUrl.trim() === "") {
      newErrors.transferProofUrl = t.transferProofRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await depositApi.create({
        amount: parseFloat(amount),
        transferProofUrl: transferProofUrl,
      });
      toast.success(t.successMessage);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create deposit request:", error);
      toast.error(t.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setTransferProofUrl("");
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    // Clear error khi user bắt đầu nhập
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const handleImageChange = (url: string) => {
    setTransferProofUrl(url);
    // Clear error khi user upload ảnh
    if (errors.transferProofUrl) {
      setErrors((prev) => ({ ...prev, transferProofUrl: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount field */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t.amount}</Label>
            <Input
              id="amount"
              type="number"
              placeholder={t.amountPlaceholder}
              value={amount}
              onChange={handleAmountChange}
              disabled={isSubmitting}
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          {/* Transfer proof image upload */}
          <div className="space-y-2">
            <Label>{t.transferProof}</Label>
            <ImageUpload
              value={transferProofUrl}
              onChange={handleImageChange}
              disabled={isSubmitting}
              error={errors.transferProofUrl}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? t.submitting : t.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
