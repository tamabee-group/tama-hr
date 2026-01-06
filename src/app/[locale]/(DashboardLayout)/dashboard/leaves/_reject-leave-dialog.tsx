"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RejectLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  isProcessing: boolean;
}

/**
 * Dialog từ chối yêu cầu nghỉ phép
 */
export function RejectLeaveDialog({
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
}: RejectLeaveDialogProps) {
  const tCommon = useTranslations("common");
  const tDialogs = useTranslations("dialogs");

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // Reset when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setReason("");
      setError("");
    }
    onOpenChange(newOpen);
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError(tDialogs("rejectReasonRequired"));
      return;
    }

    await onConfirm(reason.trim());
    setReason("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tDialogs("rejectTitle")}</DialogTitle>
          <DialogDescription>{tDialogs("rejectDescription")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">{tDialogs("rejectReason")}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder={tDialogs("rejectReasonPlaceholder")}
              rows={3}
              className={error ? "border-destructive" : ""}
            />
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isProcessing}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isProcessing || !reason.trim()}
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {tDialogs("reject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
