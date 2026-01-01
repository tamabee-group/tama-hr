"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { breakApi, CreateBreakAdjustmentRequest } from "@/lib/apis/break-api";
import { formatDate, formatTime } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { BreakRecord } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface BreakAdjustmentDialogProps {
  breakRecord: BreakRecord;
  otherBreaks: BreakRecord[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  requestedBreakStart: string;
  requestedBreakEnd: string;
  reason: string;
}

interface FormErrors {
  requestedBreakStart?: string;
  requestedBreakEnd?: string;
  reason?: string;
  overlap?: string;
}

// ============================================
// Utilities
// ============================================

function extractTimeFromDateTime(dateTime?: string): string {
  if (!dateTime) return "";
  // Nếu là ISO string, lấy phần time
  if (dateTime.includes("T")) {
    return dateTime.split("T")[1]?.substring(0, 5) || "";
  }
  // Nếu đã là time format
  return dateTime.substring(0, 5);
}

function combineDateTime(date: string, time: string): string {
  if (!time) return "";
  return `${date}T${time}:00`;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function checkTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  if (!start1 || !end1 || !start2 || !end2) return false;

  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  // Kiểm tra overlap: không overlap nếu một khoảng kết thúc trước khi khoảng kia bắt đầu
  return !(e1 <= s2 || e2 <= s1);
}

// ============================================
// BreakAdjustmentDialog Component
// ============================================

export function BreakAdjustmentDialog({
  breakRecord,
  otherBreaks,
  open,
  onClose,
  onSuccess,
}: BreakAdjustmentDialogProps) {
  const t = useTranslations("break");
  const tAttendance = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const [formData, setFormData] = React.useState<FormData>({
    requestedBreakStart: "",
    requestedBreakEnd: "",
    reason: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form khi dialog mở
  React.useEffect(() => {
    if (open) {
      setFormData({
        requestedBreakStart: extractTimeFromDateTime(breakRecord.breakStart),
        requestedBreakEnd: extractTimeFromDateTime(breakRecord.breakEnd),
        reason: "",
      });
      setErrors({});
    }
  }, [open, breakRecord]);

  // Xử lý thay đổi input
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error khi user sửa
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear overlap error khi thay đổi thời gian
    if (field !== "reason" && errors.overlap) {
      setErrors((prev) => ({ ...prev, overlap: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.reason.trim()) {
      newErrors.reason = tAttendance("adjustment.reasonPlaceholder");
    }

    // Kiểm tra ít nhất một thời gian được thay đổi
    const originalStart = extractTimeFromDateTime(breakRecord.breakStart);
    const originalEnd = extractTimeFromDateTime(breakRecord.breakEnd);

    const startChanged = formData.requestedBreakStart !== originalStart;
    const endChanged = formData.requestedBreakEnd !== originalEnd;

    if (!startChanged && !endChanged) {
      newErrors.requestedBreakStart = t("adjustment.noChangeError");
    }

    // Validate start < end
    if (formData.requestedBreakStart && formData.requestedBreakEnd) {
      const startMinutes = timeToMinutes(formData.requestedBreakStart);
      const endMinutes = timeToMinutes(formData.requestedBreakEnd);
      if (startMinutes >= endMinutes) {
        newErrors.requestedBreakEnd = t("adjustment.invalidTimeRange");
      }
    }

    // Kiểm tra overlap với các break khác
    if (formData.requestedBreakStart && formData.requestedBreakEnd) {
      for (const otherBreak of otherBreaks) {
        if (otherBreak.id === breakRecord.id) continue;
        if (!otherBreak.breakStart || !otherBreak.breakEnd) continue;

        const otherStart = extractTimeFromDateTime(otherBreak.breakStart);
        const otherEnd = extractTimeFromDateTime(otherBreak.breakEnd);

        if (
          checkTimeOverlap(
            formData.requestedBreakStart,
            formData.requestedBreakEnd,
            otherStart,
            otherEnd,
          )
        ) {
          newErrors.overlap = t("adjustment.overlapError", {
            breakNumber: otherBreak.breakNumber,
          });
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const request: CreateBreakAdjustmentRequest = {
        breakRecordId: breakRecord.id,
        requestedBreakStart: formData.requestedBreakStart
          ? combineDateTime(breakRecord.workDate, formData.requestedBreakStart)
          : undefined,
        requestedBreakEnd: formData.requestedBreakEnd
          ? combineDateTime(breakRecord.workDate, formData.requestedBreakEnd)
          : undefined,
        reason: formData.reason.trim(),
      };

      await breakApi.createBreakAdjustment(request);

      toast.success(
        t("adjustment.submitSuccess", { breakNumber: breakRecord.breakNumber }),
      );
      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {t("adjustment.title")}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t("history.breakNumber", { number: breakRecord.breakNumber })} -{" "}
            {formatDate(breakRecord.workDate, locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 sm:py-4">
          {/* Original times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("adjustment.originalStart")}
              </p>
              <p className="font-medium text-sm sm:text-base">
                {breakRecord.breakStart
                  ? formatTime(breakRecord.breakStart)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("adjustment.originalEnd")}
              </p>
              <p className="font-medium text-sm sm:text-base">
                {breakRecord.breakEnd ? formatTime(breakRecord.breakEnd) : "-"}
              </p>
            </div>
          </div>

          {/* Requested times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="requestedBreakStart" className="text-sm">
                {t("adjustment.requestedStart")}
              </Label>
              <Input
                id="requestedBreakStart"
                type="time"
                value={formData.requestedBreakStart}
                onChange={(e) =>
                  handleChange("requestedBreakStart", e.target.value)
                }
                className="w-full h-10 sm:h-9"
              />
              {errors.requestedBreakStart && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.requestedBreakStart}
                </p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="requestedBreakEnd" className="text-sm">
                {t("adjustment.requestedEnd")}
              </Label>
              <Input
                id="requestedBreakEnd"
                type="time"
                value={formData.requestedBreakEnd}
                onChange={(e) =>
                  handleChange("requestedBreakEnd", e.target.value)
                }
                className="w-full h-10 sm:h-9"
              />
              {errors.requestedBreakEnd && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.requestedBreakEnd}
                </p>
              )}
            </div>
          </div>

          {/* Overlap error alert */}
          {errors.overlap && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.overlap}</AlertDescription>
            </Alert>
          )}

          {/* Reason */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="reason" className="text-sm">
              {tAttendance("adjustment.reason")}
            </Label>
            <Textarea
              id="reason"
              placeholder={tAttendance("adjustment.reasonPlaceholder")}
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              rows={3}
              className="w-full resize-none"
            />
            {errors.reason && (
              <p className="text-xs sm:text-sm text-destructive">
                {errors.reason}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {tAttendance("adjustment.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
