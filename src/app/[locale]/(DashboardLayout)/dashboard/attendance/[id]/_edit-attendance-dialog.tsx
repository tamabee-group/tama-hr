"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, ArrowRight } from "lucide-react";
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
import { toast } from "sonner";
import { apiClient } from "@/lib/utils/fetch-client";
import { formatDate, formatTime } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { UnifiedAttendanceRecord } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface EditAttendanceDialogProps {
  record: UnifiedAttendanceRecord | null;
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
  checkInTime: string;
  checkOutTime: string;
  breaks: BreakFormData[];
  reason: string;
}

interface FormErrors {
  checkInTime?: string;
  reason?: string;
}

type DialogStep = "form" | "comparison";

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
// EditAttendanceDialog Component
// ============================================

export function EditAttendanceDialog({
  record,
  open,
  onClose,
  onSuccess,
}: EditAttendanceDialogProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const workDate = record?.workDate || "";

  const [step, setStep] = React.useState<DialogStep>("form");
  const [formData, setFormData] = React.useState<FormData>({
    checkInTime: "",
    checkOutTime: "",
    breaks: [],
    reason: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form khi dialog mở
  React.useEffect(() => {
    if (open && record) {
      const breakRecords = record.breakRecords || [];
      setFormData({
        checkInTime: extractTimeFromDateTime(record.originalCheckIn),
        checkOutTime: extractTimeFromDateTime(record.originalCheckOut),
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
      });
      setErrors({});
      setStep("form");
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
    if (!record) return false;
    const originalCheckIn = extractTimeFromDateTime(record.originalCheckIn);
    const originalCheckOut = extractTimeFromDateTime(record.originalCheckOut);

    const checkInChanged = formData.checkInTime !== originalCheckIn;
    const checkOutChanged = formData.checkOutTime !== originalCheckOut;
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

    if (!hasChanges) {
      newErrors.checkInTime = t("adjustment.timeChangeRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep("comparison");
    }
  };

  const handleBack = () => {
    setStep("form");
  };

  const handleSubmit = async () => {
    if (!record) return;

    try {
      setIsSubmitting(true);

      // Build break adjustments array
      const breakAdjustments = formData.breaks
        .filter(
          (br) =>
            br.isEditing &&
            (br.newStart !== br.originalStart || br.newEnd !== br.originalEnd),
        )
        .map((br) => ({
          breakRecordId: br.breakRecordId,
          breakStartTime:
            br.newStart !== br.originalStart
              ? combineDateTime(workDate, br.newStart)
              : null,
          breakEndTime:
            br.newEnd !== br.originalEnd
              ? combineDateTime(workDate, br.newEnd)
              : null,
        }));

      await apiClient.put(`/api/company/attendance/${record.id}/adjust`, {
        checkInTime: formData.checkInTime
          ? combineDateTime(workDate, formData.checkInTime)
          : null,
        checkOutTime: formData.checkOutTime
          ? combineDateTime(workDate, formData.checkOutTime)
          : null,
        breakAdjustments: breakAdjustments.length > 0 ? breakAdjustments : null,
        reason: formData.reason.trim(),
      });

      toast.success(t("messages.editSuccess"));
      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get changed items for comparison
  const getChangedItems = () => {
    if (!record) return [];
    const items: { label: string; original: string; newValue: string }[] = [];

    const originalCheckIn = extractTimeFromDateTime(record.originalCheckIn);
    const originalCheckOut = extractTimeFromDateTime(record.originalCheckOut);

    if (formData.checkInTime !== originalCheckIn) {
      items.push({
        label: t("checkIn"),
        original: originalCheckIn || "--:--",
        newValue: formData.checkInTime || "--:--",
      });
    }

    if (formData.checkOutTime !== originalCheckOut) {
      items.push({
        label: t("checkOut"),
        original: originalCheckOut || "--:--",
        newValue: formData.checkOutTime || "--:--",
      });
    }

    formData.breaks.forEach((br) => {
      if (br.isEditing) {
        if (br.newStart !== br.originalStart) {
          items.push({
            label: `${t("breakStart")} #${br.breakNumber}`,
            original: br.originalStart || "--:--",
            newValue: br.newStart || "--:--",
          });
        }
        if (br.newEnd !== br.originalEnd) {
          items.push({
            label: `${t("breakEnd")} #${br.breakNumber}`,
            original: br.originalEnd || "--:--",
            newValue: br.newEnd || "--:--",
          });
        }
      }
    });

    return items;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "form"
              ? t("editDialog.title")
              : t("editDialog.confirmTitle")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {record?.employeeName} - {formatDate(workDate, locale)}
          </p>
        </DialogHeader>

        {step === "form" ? (
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
                <Label htmlFor="checkInTime" className="text-sm">
                  {t("checkIn")}
                </Label>
                <Input
                  id="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => handleChange("checkInTime", e.target.value)}
                />
                {errors.checkInTime && (
                  <p className="text-xs text-destructive">
                    {errors.checkInTime}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkOutTime" className="text-sm">
                  {t("checkOut")}
                </Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => handleChange("checkOutTime", e.target.value)}
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
                              handleBreakChange(
                                index,
                                "newStart",
                                e.target.value,
                              )
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
                placeholder={t("editDialog.reasonPlaceholder")}
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                rows={2}
                className="resize-none"
              />
              {errors.reason && (
                <p className="text-xs text-destructive">{errors.reason}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {t("editDialog.confirmChanges")}
            </p>

            {getChangedItems().map((item, index) => (
              <ComparisonRow
                key={index}
                label={item.label}
                original={item.original}
                newValue={item.newValue}
              />
            ))}

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                {t("adjustment.reason")}
              </p>
              <p className="text-sm">{formData.reason}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "form" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleNext} disabled={!hasChanges}>
                {t("editDialog.next")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                {tCommon("back")}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {tCommon("save")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// ComparisonRow Component
// ============================================

interface ComparisonRowProps {
  label: string;
  original: string;
  newValue: string;
}

function ComparisonRow({ label, original, newValue }: ComparisonRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground line-through">
          {original}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-primary">{newValue}</span>
      </div>
    </div>
  );
}
