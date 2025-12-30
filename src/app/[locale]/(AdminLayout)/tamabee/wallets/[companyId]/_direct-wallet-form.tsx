"use client";

import { useState } from "react";
import { DirectWalletRequest } from "@/types/wallet";
import { addBalanceDirect, deductBalanceDirect } from "@/lib/apis/wallet-api";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { SupportedLocale, formatCurrency } from "@/lib/utils/format-currency";
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
import { Loader2, Plus, Minus } from "lucide-react";

export type DirectWalletOperation = "add" | "deduct";

interface DirectWalletFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  companyName: string;
  currentBalance: number;
  operation: DirectWalletOperation;
  onSuccess: () => void;
  locale?: SupportedLocale;
}

/**
 * Component form thêm/trừ tiền trực tiếp vào wallet - CHỈ ADMIN_TAMABEE
 * - Fields: amount (number), description (textarea)
 * - Validation: amount > 0, description required
 * - Với deduct: amount <= currentBalance
 */
export function DirectWalletForm({
  open,
  onOpenChange,
  companyId,
  companyName,
  currentBalance,
  operation,
  onSuccess,
  locale = "vi",
}: DirectWalletFormProps) {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
  }>({});

  const isAdd = operation === "add";

  // Labels theo locale
  const labels = {
    vi: {
      addTitle: "Thêm tiền vào ví",
      deductTitle: "Trừ tiền từ ví",
      addDescription: "Thêm tiền trực tiếp vào ví công ty",
      deductDescription: "Trừ tiền trực tiếp từ ví công ty",
      company: "Công ty",
      currentBalance: "Số dư hiện tại",
      amount: "Số tiền",
      amountPlaceholder: "Nhập số tiền",
      description: "Mô tả",
      descriptionPlaceholder: "Nhập lý do thêm/trừ tiền...",
      cancel: "Hủy",
      addSubmit: "Thêm tiền",
      deductSubmit: "Trừ tiền",
      submitting: "Đang xử lý...",
      addSuccess: "Thêm tiền thành công",
      deductSuccess: "Trừ tiền thành công",
      error: "Không thể thực hiện thao tác",
      amountRequired: "Vui lòng nhập số tiền",
      amountInvalid: "Số tiền phải lớn hơn 0",
      amountExceedsBalance: "Số tiền không được vượt quá số dư hiện tại",
      descriptionRequired: "Vui lòng nhập mô tả",
      descriptionTooLong: "Mô tả không được quá 500 ký tự",
      forbidden: "Bạn không có quyền thực hiện thao tác này",
    },
    en: {
      addTitle: "Add Balance",
      deductTitle: "Deduct Balance",
      addDescription: "Add balance directly to company wallet",
      deductDescription: "Deduct balance directly from company wallet",
      company: "Company",
      currentBalance: "Current Balance",
      amount: "Amount",
      amountPlaceholder: "Enter amount",
      description: "Description",
      descriptionPlaceholder: "Enter reason for adding/deducting...",
      cancel: "Cancel",
      addSubmit: "Add Balance",
      deductSubmit: "Deduct Balance",
      submitting: "Processing...",
      addSuccess: "Balance added successfully",
      deductSuccess: "Balance deducted successfully",
      error: "Failed to process operation",
      amountRequired: "Please enter an amount",
      amountInvalid: "Amount must be greater than 0",
      amountExceedsBalance: "Amount cannot exceed current balance",
      descriptionRequired: "Please enter a description",
      descriptionTooLong: "Description cannot exceed 500 characters",
      forbidden: "You do not have permission to perform this action",
    },
    ja: {
      addTitle: "残高追加",
      deductTitle: "残高控除",
      addDescription: "会社のウォレットに直接残高を追加",
      deductDescription: "会社のウォレットから直接残高を控除",
      company: "会社",
      currentBalance: "現在の残高",
      amount: "金額",
      amountPlaceholder: "金額を入力",
      description: "説明",
      descriptionPlaceholder: "追加/控除の理由を入力...",
      cancel: "キャンセル",
      addSubmit: "残高追加",
      deductSubmit: "残高控除",
      submitting: "処理中...",
      addSuccess: "残高が追加されました",
      deductSuccess: "残高が控除されました",
      error: "操作を処理できませんでした",
      amountRequired: "金額を入力してください",
      amountInvalid: "金額は0より大きい必要があります",
      amountExceedsBalance: "金額は現在の残高を超えることはできません",
      descriptionRequired: "説明を入力してください",
      descriptionTooLong: "説明は500文字以内にしてください",
      forbidden: "この操作を実行する権限がありません",
    },
  };

  const t = labels[locale];

  // Reset form
  const resetForm = () => {
    setAmount("");
    setDescription("");
    setErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { amount?: string; description?: string } = {};

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      newErrors.amount = t.amountRequired;
    } else if (amountNum <= 0) {
      newErrors.amount = t.amountInvalid;
    } else if (!isAdd && amountNum > currentBalance) {
      newErrors.amount = t.amountExceedsBalance;
    }

    if (!description.trim()) {
      newErrors.description = t.descriptionRequired;
    } else if (description.trim().length > 500) {
      newErrors.description = t.descriptionTooLong;
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
      const data: DirectWalletRequest = {
        amount: parseFloat(amount),
        description: description.trim(),
      };

      if (isAdd) {
        await addBalanceDirect(companyId, data);
        toast.success(t.addSuccess);
      } else {
        await deductBalanceDirect(companyId, data);
        toast.success(t.deductSuccess);
      }

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to process direct wallet operation:", error);
      handleApiError(error, {
        forbiddenMessage: t.forbidden,
        defaultMessage: t.error,
      });
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
            {isAdd ? (
              <Plus className="h-5 w-5 text-green-600" />
            ) : (
              <Minus className="h-5 w-5 text-red-600" />
            )}
            {isAdd ? t.addTitle : t.deductTitle}
          </DialogTitle>
          <DialogDescription>
            {isAdd ? t.addDescription : t.deductDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name (read-only) */}
          <div className="space-y-2">
            <Label>{t.company}</Label>
            <Input value={companyName} disabled className="bg-muted" />
          </div>

          {/* Current Balance (read-only) */}
          <div className="space-y-2">
            <Label>{t.currentBalance}</Label>
            <Input
              value={formatCurrency(currentBalance, locale)}
              disabled
              className="bg-muted"
            />
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.description} *</Label>
            <Textarea
              id="description"
              placeholder={t.descriptionPlaceholder}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              className={errors.description ? "border-destructive" : ""}
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
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
            <Button
              type="submit"
              disabled={loading}
              variant={isAdd ? "default" : "destructive"}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : isAdd ? (
                t.addSubmit
              ) : (
                t.deductSubmit
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Validate direct wallet amount
 * Export để sử dụng trong tests
 */
export function validateDirectWalletAmount(
  amount: number,
  operation: DirectWalletOperation,
  currentBalance?: number,
): boolean {
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    return false;
  }
  if (operation === "deduct" && currentBalance !== undefined) {
    return amount <= currentBalance;
  }
  return true;
}

/**
 * Validate direct wallet description
 * Export để sử dụng trong tests
 */
export function validateDirectWalletDescription(description: string): boolean {
  return (
    typeof description === "string" &&
    description.trim().length > 0 &&
    description.trim().length <= 500
  );
}
