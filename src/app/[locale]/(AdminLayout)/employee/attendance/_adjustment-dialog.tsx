"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { adjustmentApi } from "@/lib/apis/adjustment-api";
import { getApprovers, ApproverInfo } from "@/lib/apis/company-employees";
import { formatDate, formatTime } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import type { AttendanceRecord } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface AdjustmentDialogProps {
  record: AttendanceRecord | null;
  date?: string; // Ngày cần điều chỉnh (khi không có record)
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  requestedCheckIn: string;
  requestedCheckOut: string;
  requestedBreakStart: string;
  requestedBreakEnd: string;
  reason: string;
  assignedTo: string;
}

interface FormErrors {
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  requestedBreakStart?: string;
  requestedBreakEnd?: string;
  reason?: string;
  assignedTo?: string;
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

// ============================================
// AdjustmentDialog Component
// ============================================

export function AdjustmentDialog({
  record,
  date,
  open,
  onClose,
  onSuccess,
}: AdjustmentDialogProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  // Xác định ngày làm việc (từ record hoặc prop date)
  const workDate = record?.workDate || date || "";

  const [formData, setFormData] = React.useState<FormData>({
    requestedCheckIn: "",
    requestedCheckOut: "",
    requestedBreakStart: "",
    requestedBreakEnd: "",
    reason: "",
    assignedTo: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [approvers, setApprovers] = React.useState<ApproverInfo[]>([]);
  const [isLoadingApprovers, setIsLoadingApprovers] = React.useState(false);
  const tEnums = useTranslations("enums");

  // Fetch approvers khi dialog mở
  React.useEffect(() => {
    if (open) {
      setIsLoadingApprovers(true);
      getApprovers()
        .then((data) => {
          setApprovers(data);
        })
        .catch((err) => console.error("Error fetching approvers:", err))
        .finally(() => setIsLoadingApprovers(false));
    }
  }, [open]);

  // Reset form khi dialog mở
  React.useEffect(() => {
    if (open) {
      setFormData({
        requestedCheckIn: record
          ? extractTimeFromDateTime(record.originalCheckIn)
          : "",
        requestedCheckOut: record
          ? extractTimeFromDateTime(record.originalCheckOut)
          : "",
        requestedBreakStart: "",
        requestedBreakEnd: "",
        reason: "",
        assignedTo: "",
      });
      setErrors({});
    }
  }, [open, record]);

  // Xử lý thay đổi input
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error khi user sửa
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.reason.trim()) {
      newErrors.reason = t("adjustment.reasonRequired");
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = t("adjustment.assignedToRequired");
    }

    // Nếu có record, kiểm tra ít nhất một thời gian được thay đổi
    if (record) {
      const originalCheckIn = extractTimeFromDateTime(record.originalCheckIn);
      const originalCheckOut = extractTimeFromDateTime(record.originalCheckOut);

      const checkInChanged = formData.requestedCheckIn !== originalCheckIn;
      const checkOutChanged = formData.requestedCheckOut !== originalCheckOut;
      const breakStartChanged = !!formData.requestedBreakStart;
      const breakEndChanged = !!formData.requestedBreakEnd;

      if (
        !checkInChanged &&
        !checkOutChanged &&
        !breakStartChanged &&
        !breakEndChanged
      ) {
        newErrors.requestedCheckIn = t("adjustment.timeChangeRequired");
      }
    } else {
      // Nếu không có record, yêu cầu ít nhất một thời gian
      if (
        !formData.requestedCheckIn &&
        !formData.requestedCheckOut &&
        !formData.requestedBreakStart &&
        !formData.requestedBreakEnd
      ) {
        newErrors.requestedCheckIn = t("adjustment.timeRequired");
      }
    }

    // Validate break times: nếu có một thì phải có cả hai
    if (
      (formData.requestedBreakStart && !formData.requestedBreakEnd) ||
      (!formData.requestedBreakStart && formData.requestedBreakEnd)
    ) {
      newErrors.requestedBreakStart = t("adjustment.breakTimeBothRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await adjustmentApi.createAdjustmentRequest({
        attendanceRecordId: record?.id,
        workDate: workDate,
        requestedCheckIn: formData.requestedCheckIn
          ? combineDateTime(workDate, formData.requestedCheckIn)
          : undefined,
        requestedCheckOut: formData.requestedCheckOut
          ? combineDateTime(workDate, formData.requestedCheckOut)
          : undefined,
        requestedBreakStart: formData.requestedBreakStart
          ? combineDateTime(workDate, formData.requestedBreakStart)
          : undefined,
        requestedBreakEnd: formData.requestedBreakEnd
          ? combineDateTime(workDate, formData.requestedBreakEnd)
          : undefined,
        reason: formData.reason.trim(),
        assignedTo: parseInt(formData.assignedTo),
      });

      toast.success(t("messages.adjustmentSubmitted"));
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
            {formatDate(workDate, locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 sm:py-4">
          {/* Original times - Chỉ hiển thị khi có record */}
          {record && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("adjustment.originalTime")} - {t("checkIn")}
                </p>
                <p className="font-medium text-sm sm:text-base">
                  {record.originalCheckIn
                    ? formatTime(record.originalCheckIn)
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("adjustment.originalTime")} - {t("checkOut")}
                </p>
                <p className="font-medium text-sm sm:text-base">
                  {record.originalCheckOut
                    ? formatTime(record.originalCheckOut)
                    : "-"}
                </p>
              </div>
            </div>
          )}

          {/* Thông báo khi không có record */}
          {!record && (
            <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t("adjustment.noRecordNote")}
              </p>
            </div>
          )}

          {/* Requested times - Responsive grid, stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="requestedCheckIn" className="text-sm">
                {t("adjustment.requestedTime")} - {t("checkIn")}
              </Label>
              <Input
                id="requestedCheckIn"
                type="time"
                value={formData.requestedCheckIn}
                onChange={(e) =>
                  handleChange("requestedCheckIn", e.target.value)
                }
                className="w-full h-10 sm:h-9"
              />
              {errors.requestedCheckIn && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.requestedCheckIn}
                </p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="requestedCheckOut" className="text-sm">
                {t("adjustment.requestedTime")} - {t("checkOut")}
              </Label>
              <Input
                id="requestedCheckOut"
                type="time"
                value={formData.requestedCheckOut}
                onChange={(e) =>
                  handleChange("requestedCheckOut", e.target.value)
                }
                className="w-full h-10 sm:h-9"
              />
              {errors.requestedCheckOut && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.requestedCheckOut}
                </p>
              )}
            </div>
          </div>

          {/* Break times - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="requestedBreakStart" className="text-sm">
                {t("adjustment.requestedTime")} - {t("breakStart")}
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
                {t("adjustment.requestedTime")} - {t("breakEnd")}
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

          {/* Reason - Full width */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="reason" className="text-sm">
              {t("adjustment.reason")}
            </Label>
            <Textarea
              id="reason"
              placeholder={t("adjustment.reasonPlaceholder")}
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

          {/* Assigned To - Select approver */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="assignedTo" className="text-sm">
              {t("adjustment.assignedTo")}
            </Label>
            {isLoadingApprovers ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : (
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => handleChange("assignedTo", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("adjustment.selectApprover")} />
                </SelectTrigger>
                <SelectContent>
                  {approvers.map((approver) => (
                    <SelectItem key={approver.id} value={String(approver.id)}>
                      {approver.name} (
                      {getEnumLabel("userRole", approver.role, tEnums)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.assignedTo && (
              <p className="text-xs sm:text-sm text-destructive">
                {errors.assignedTo}
              </p>
            )}
          </div>
        </div>

        {/* Footer - Responsive buttons */}
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
            {t("adjustment.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
