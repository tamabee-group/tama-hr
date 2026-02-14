"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Template lý do từ chối
const REJECTION_TEMPLATES = [
  "invalidTime",
  "insufficientEvidence",
  "notMatchPolicy",
  "duplicateRequest",
  "other",
] as const;

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

/**
 * Dialog từ chối yêu cầu điều chỉnh đơn lẻ
 */
export function RejectDialog({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  onConfirm,
  isProcessing,
}: RejectDialogProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");

  // Xử lý chọn template
  const handleTemplateChange = (templateKey: string) => {
    const templateText = t(`adjustment.rejectTemplates.${templateKey}`);
    onReasonChange(templateText);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("adjustment.reject")}</DialogTitle>
          <DialogDescription>
            {t("adjustment.rejectionReasonPlaceholder")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Template select */}
          <div className="space-y-2">
            <Label>{t("adjustment.rejectTemplate")}</Label>
            <Select onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("adjustment.selectTemplate")} />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_TEMPLATES.map((template) => (
                  <SelectItem key={template} value={template}>
                    {t(`adjustment.rejectTemplates.${template}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("adjustment.rejectionReason")}</Label>
            <Textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={t("adjustment.rejectionReasonPlaceholder")}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing || !reason.trim()}
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("adjustment.reject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BulkRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
  selectedCount: number;
}

/**
 * Dialog từ chối hàng loạt yêu cầu điều chỉnh
 */
export function BulkRejectDialog({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  onConfirm,
  isProcessing,
  selectedCount,
}: BulkRejectDialogProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");

  // Xử lý chọn template
  const handleTemplateChange = (templateKey: string) => {
    const templateText = t(`adjustment.rejectTemplates.${templateKey}`);
    onReasonChange(templateText);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("adjustment.bulkReject")}</DialogTitle>
          <DialogDescription>
            {t("adjustment.selectRequests")} ({selectedCount}{" "}
            {tCommon("rowsSelected")})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Template select */}
          <div className="space-y-2">
            <Label>{t("adjustment.rejectTemplate")}</Label>
            <Select onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("adjustment.selectTemplate")} />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_TEMPLATES.map((template) => (
                  <SelectItem key={template} value={template}>
                    {t(`adjustment.rejectTemplates.${template}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("adjustment.rejectionReason")}</Label>
            <Textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={t("adjustment.rejectionReasonPlaceholder")}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing || !reason.trim()}
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("adjustment.bulkReject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
