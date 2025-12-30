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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { depositApi } from "@/lib/apis/deposit-api";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface RejectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  depositId: number;
  onSuccess: () => void;
  locale?: SupportedLocale;
}

/**
 * Form từ chối yêu cầu nạp tiền
 * - Field: rejectionReason (bắt buộc)
 * - Hỗ trợ đa ngôn ngữ (vi, en, ja)
 */
export function RejectForm({
  open,
  onOpenChange,
  depositId,
  onSuccess,
  locale = "vi",
}: RejectFormProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Labels theo locale
  const labels = {
    vi: {
      title: "Từ chối yêu cầu nạp tiền",
      description: "Vui lòng nhập lý do từ chối yêu cầu này",
      rejectionReason: "Lý do từ chối",
      placeholder: "Nhập lý do từ chối...",
      cancel: "Hủy",
      reject: "Từ chối",
      rejecting: "Đang xử lý...",
      required: "Vui lòng nhập lý do từ chối",
      successReject: "Từ chối yêu cầu thành công",
      errorReject: "Không thể từ chối yêu cầu",
    },
    en: {
      title: "Reject Deposit Request",
      description: "Please enter the reason for rejecting this request",
      rejectionReason: "Rejection Reason",
      placeholder: "Enter rejection reason...",
      cancel: "Cancel",
      reject: "Reject",
      rejecting: "Processing...",
      required: "Please enter rejection reason",
      successReject: "Request rejected successfully",
      errorReject: "Failed to reject request",
    },
    ja: {
      title: "入金リクエストを却下",
      description: "このリクエストを却下する理由を入力してください",
      rejectionReason: "却下理由",
      placeholder: "却下理由を入力...",
      cancel: "キャンセル",
      reject: "却下",
      rejecting: "処理中...",
      required: "却下理由を入力してください",
      successReject: "リクエストが却下されました",
      errorReject: "リクエストの却下に失敗しました",
    },
  };

  const t = labels[locale];

  const resetForm = () => {
    setRejectionReason("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!rejectionReason.trim()) {
      setError(t.required);
      return;
    }

    setIsSubmitting(true);
    try {
      await depositApi.reject(depositId, {
        rejectionReason: rejectionReason.trim(),
      });
      toast.success(t.successReject);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to reject deposit:", error);
      handleApiError(error, {
        forbiddenMessage: "Bạn không có quyền từ chối yêu cầu này",
        defaultMessage: t.errorReject,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleReasonChange = (value: string) => {
    setRejectionReason(value);
    if (error) {
      setError("");
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
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">{t.rejectionReason}</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder={t.placeholder}
              disabled={isSubmitting}
              className={error ? "border-destructive" : ""}
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
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
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? t.rejecting : t.reject}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
