"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import type {
  AttendanceRecord,
  UnifiedAttendanceRecord,
  BreakRecord,
} from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface AdjustmentDialogProps {
  record: AttendanceRecord | UnifiedAttendanceRecord | null;
  date?: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BreakFormData {
  breakRecordId: number;
  breakNumber: number;
  originalStart: string;
  originalEnd: string;
  newStart: string;
  newEnd: string;
  isEditing: boolean;
}

interface FormData {
  requestedCheckIn: string;
  requestedCheckOut: string;
  breaks: BreakFormData[];
  reason: string;
  assignedTo: string;
}

interface FormErrors {
  requestedCheckIn?: string;
  reason?: string;
  assignedTo?: string;
}

// ============================================
// Utilities
// ============================================

function extractTimeFromDateTime(dateTime?: string): string {
  if (!dateTime) return "";
  if (dateTime.includes("T")) {
    return dateTime.split("T")[1]?.substring(0, 5) || "";
  }
  return dateTime.substring(0, 5);
}

function combineDateTime(date: string, time: string): string {
  if (!time) return "";
  return `${date}T${time}:00`;
}

function calculateBreakMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  return endH * 60 + endM - (startH * 60 + startM);
}

function formatDurationByLocale(minutes: number, locale: string): string {
  if (minutes <= 0) return "--:--";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale === "ja") {
    return hours > 0
      ? `${hours}時${mins.toString().padStart(2, "0")}分`
      : `${mins}分`;
  }
  // vi, en: format HH:MM
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function formatTotalBreakMinutes(
  breaks: BreakFormData[],
  locale: string,
): string {
  const totalMinutes = breaks.reduce((sum, br) => {
    const minutes = calculateBreakMinutes(br.newStart, br.newEnd);
    return sum + (minutes > 0 ? minutes : 0);
  }, 0);
  return formatDurationByLocale(totalMinutes, locale);
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
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const workDate = record?.workDate || date || "";

  const [formData, setFormData] = React.useState<FormData>({
    requestedCheckIn: "",
    requestedCheckOut: "",
    breaks: [],
    reason: "",
    assignedTo: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [approvers, setApprovers] = React.useState<ApproverInfo[]>([]);
  const [isLoadingApprovers, setIsLoadingApprovers] = React.useState(false);

  // Fetch approvers khi dialog mở
  React.useEffect(() => {
    if (open) {
      setIsLoadingApprovers(true);
      getApprovers()
        .then((data) => setApprovers(data))
        .catch((err) => console.error("Error fetching approvers:", err))
        .finally(() => setIsLoadingApprovers(false));
    }
  }, [open]);

  // Reset form khi dialog mở hoặc record thay đổi
  React.useEffect(() => {
    if (open) {
      const breakRecords: BreakRecord[] =
        (record as UnifiedAttendanceRecord)?.breakRecords || [];

      setFormData({
        requestedCheckIn: record
          ? extractTimeFromDateTime(record.originalCheckIn)
          : "",
        requestedCheckOut: record
          ? extractTimeFromDateTime(record.originalCheckOut)
          : "",
        breaks: breakRecords.map((br) => ({
          breakRecordId: br.id,
          breakNumber: br.breakNumber,
          originalStart: extractTimeFromDateTime(br.breakStart),
          originalEnd: extractTimeFromDateTime(br.breakEnd),
          newStart: extractTimeFromDateTime(br.breakStart),
          newEnd: extractTimeFromDateTime(br.breakEnd),
          isEditing: false,
        })),
        reason: "",
        assignedTo: "",
      });
      setErrors({});
    }
  }, [open, record]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBreakToggle = (index: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      breaks: prev.breaks.map((br, i) =>
        i === index ? { ...br, isEditing: checked } : br,
      ),
    }));
  };

  const handleBreakChange = (
    index: number,
    field: "newStart" | "newEnd",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      breaks: prev.breaks.map((br, i) =>
        i === index ? { ...br, [field]: value } : br,
      ),
    }));
  };

  // Kiểm tra có thay đổi gì không
  const hasChanges = React.useMemo(() => {
    if (!record) {
      // Không có record → cho phép tạo mới nếu có nhập thời gian
      return (
        !!formData.requestedCheckIn ||
        !!formData.requestedCheckOut ||
        formData.breaks.some((br) => br.isEditing)
      );
    }

    const originalCheckIn = extractTimeFromDateTime(record.originalCheckIn);
    const originalCheckOut = extractTimeFromDateTime(record.originalCheckOut);

    const checkInChanged = formData.requestedCheckIn !== originalCheckIn;
    const checkOutChanged = formData.requestedCheckOut !== originalCheckOut;
    const hasBreakChanges = formData.breaks.some(
      (br) =>
        br.isEditing &&
        (br.newStart !== br.originalStart || br.newEnd !== br.originalEnd),
    );

    return checkInChanged || checkOutChanged || hasBreakChanges;
  }, [record, formData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.reason.trim()) {
      newErrors.reason = t("adjustment.reasonRequired");
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = t("adjustment.assignedToRequired");
    }

    if (!hasChanges) {
      newErrors.requestedCheckIn = record
        ? t("adjustment.timeChangeRequired")
        : t("adjustment.timeRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Tìm break đầu tiên được chỉnh sửa (API hiện tại chỉ hỗ trợ 1 break)
      const editedBreak = formData.breaks.find(
        (br) =>
          br.isEditing &&
          (br.newStart !== br.originalStart || br.newEnd !== br.originalEnd),
      );

      await adjustmentApi.createAdjustmentRequest({
        attendanceRecordId: record?.id,
        workDate: workDate,
        requestedCheckIn: formData.requestedCheckIn
          ? combineDateTime(workDate, formData.requestedCheckIn)
          : undefined,
        requestedCheckOut: formData.requestedCheckOut
          ? combineDateTime(workDate, formData.requestedCheckOut)
          : undefined,
        breakRecordId: editedBreak?.breakRecordId,
        requestedBreakStart:
          editedBreak && editedBreak.newStart !== editedBreak.originalStart
            ? combineDateTime(workDate, editedBreak.newStart)
            : undefined,
        requestedBreakEnd:
          editedBreak && editedBreak.newEnd !== editedBreak.originalEnd
            ? combineDateTime(workDate, editedBreak.newEnd)
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
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("adjustment.title")}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {formatDate(workDate, locale)}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Thời gian gốc */}
          {record && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t("checkIn")} ({t("adjustment.original")})
                </p>
                <p className="text-lg font-semibold">
                  {record.originalCheckIn
                    ? formatTime(record.originalCheckIn)
                    : "--:--"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t("checkOut")} ({t("adjustment.original")})
                </p>
                <p className="text-lg font-semibold">
                  {record.originalCheckOut
                    ? formatTime(record.originalCheckOut)
                    : "--:--"}
                </p>
              </div>
            </div>
          )}

          {/* Check in/out inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="requestedCheckIn" className="text-sm">
                {t("checkIn")}
              </Label>
              <Input
                id="requestedCheckIn"
                type="time"
                value={formData.requestedCheckIn}
                onChange={(e) =>
                  handleChange("requestedCheckIn", e.target.value)
                }
              />
              {errors.requestedCheckIn && (
                <p className="text-xs text-destructive">
                  {errors.requestedCheckIn}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requestedCheckOut" className="text-sm">
                {t("checkOut")}
              </Label>
              <Input
                id="requestedCheckOut"
                type="time"
                value={formData.requestedCheckOut}
                onChange={(e) =>
                  handleChange("requestedCheckOut", e.target.value)
                }
              />
            </div>
          </div>

          {/* Multiple break records */}
          {formData.breaks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">
                  {t("editDialog.breakRecords")}
                </Label>
                <span className="text-sm text-muted-foreground">
                  {t("editDialog.totalBreak")}:{" "}
                  {formatTotalBreakMinutes(formData.breaks, locale)}
                </span>
              </div>
              {formData.breaks.map((br, index) => (
                <div
                  key={br.breakRecordId}
                  className="p-3 border rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`break-${br.breakRecordId}`}
                      checked={br.isEditing}
                      onCheckedChange={(checked) =>
                        handleBreakToggle(index, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`break-${br.breakRecordId}`}
                      className="text-sm cursor-pointer"
                    >
                      {t("adjustment.breakLabel", {
                        number: br.breakNumber,
                        start: br.originalStart || "--:--",
                        end: br.originalEnd || "--:--",
                      })}
                    </Label>
                  </div>

                  {br.isEditing && (
                    <div className="grid grid-cols-2 gap-3 pl-6">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("breakStart")}</Label>
                        <Input
                          type="time"
                          value={br.newStart}
                          onChange={(e) =>
                            handleBreakChange(index, "newStart", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("breakEnd")}</Label>
                        <Input
                          type="time"
                          value={br.newEnd}
                          onChange={(e) =>
                            handleBreakChange(index, "newEnd", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Lý do */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-sm">
              {t("adjustment.reason")}
            </Label>
            <Textarea
              id="reason"
              placeholder={t("adjustment.reasonPlaceholder")}
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              rows={2}
              className="resize-none"
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason}</p>
            )}
          </div>

          {/* Người duyệt */}
          <div className="space-y-1.5">
            <Label htmlFor="assignedTo" className="text-sm">
              {t("adjustment.assignedTo")}
            </Label>
            {isLoadingApprovers ? (
              <div className="flex items-center gap-2 h-9 px-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {tCommon("loading")}
                </span>
              </div>
            ) : (
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => handleChange("assignedTo", value)}
              >
                <SelectTrigger>
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
              <p className="text-xs text-destructive">{errors.assignedTo}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t("adjustment.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
