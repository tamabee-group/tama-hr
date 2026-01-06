"use client";

import { useState } from "react";
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

export function RejectForm({
  open,
  onOpenChange,
  depositId,
  onSuccess,
}: RejectFormProps) {
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");

  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setRejectionReason("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      setError(t("messages.required"));
      return;
    }

    setIsSubmitting(true);
    try {
      await depositApi.reject(depositId, {
        rejectionReason: rejectionReason.trim(),
      });
      toast.success(t("messages.rejectSuccess"));
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to reject deposit:", error);
      handleApiError(error, {
        defaultMessage: t("messages.rejectError"),
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
          <DialogTitle>{t("dialog.rejectTitle")}</DialogTitle>
          <DialogDescription>{t("dialog.rejectDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">{t("dialog.rejectReason")}</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder={t("dialog.rejectReasonPlaceholder")}
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
              {tCommon("cancel")}
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? t("dialog.rejecting") : t("actions.reject")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
