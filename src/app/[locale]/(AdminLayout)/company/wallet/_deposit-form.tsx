"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import { DepositRequestResponse } from "@/types/deposit";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export interface DepositFormData {
  amount: number;
  transferProofUrl: string;
}

// Hàm validate amount - export để test
// Note: Error messages should be translated at the component level
export function validateAmount(amount: number): {
  valid: boolean;
  errorKey?: string;
} {
  if (typeof amount !== "number" || isNaN(amount)) {
    return { valid: false, errorKey: "invalidNumber" };
  }
  if (amount <= 0) {
    return { valid: false, errorKey: "positiveNumber" };
  }
  return { valid: true };
}

interface DepositFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /** Deposit để edit (nếu có) - chỉ cho phép edit khi status = REJECTED */
  editDeposit?: DepositRequestResponse | null;
}

/**
 * Component form tạo/sửa yêu cầu nạp tiền
 * - Fields: amount (number input), transferProofUrl (image upload)
 * - Validation: amount > 0, transferProofUrl required
 * - Preview ảnh trước khi submit
 * - Hỗ trợ edit yêu cầu bị từ chối
 */
export function DepositForm({
  open,
  onOpenChange,
  onSuccess,
  editDeposit,
}: DepositFormProps) {
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [amount, setAmount] = useState<string>("");
  const [transferProofUrl, setTransferProofUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    transferProofUrl?: string;
  }>({});

  const isEditMode = !!editDeposit;

  // Populate form khi edit
  useEffect(() => {
    if (editDeposit && open) {
      setAmount(editDeposit.amount.toString());
      setTransferProofUrl(editDeposit.transferProofUrl || "");
    }
  }, [editDeposit, open]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { amount?: string; transferProofUrl?: string } = {};

    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || amount.trim() === "") {
      newErrors.amount = tValidation("required");
    } else if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = tValidation("positiveNumber");
    }

    // Validate transferProofUrl
    if (!transferProofUrl || transferProofUrl.trim() === "") {
      newErrors.transferProofUrl = tValidation("required");
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
      const data = {
        amount: parseFloat(amount),
        transferProofUrl: transferProofUrl,
      };

      if (isEditMode && editDeposit) {
        await depositApi.update(editDeposit.id, data);
        toast.success(t("messages.updateSuccess"));
      } else {
        await depositApi.create(data);
        toast.success(t("messages.createSuccess"));
      }

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to save deposit request:", error);
      toast.error(
        isEditMode ? t("messages.updateError") : t("messages.createError"),
      );
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
          <DialogTitle>
            {isEditMode ? t("editRequest") : t("createRequest")}
          </DialogTitle>
          <DialogDescription>{t("form.transferProofHint")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount field */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("form.amount")}</Label>
            <Input
              id="amount"
              type="number"
              placeholder={t("form.amountPlaceholder")}
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
            <Label>{t("form.transferProof")}</Label>
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
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? tCommon("loading") : tCommon("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
