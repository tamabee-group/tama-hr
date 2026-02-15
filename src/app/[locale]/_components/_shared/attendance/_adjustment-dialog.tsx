"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ReasonTemplateSelect } from "@/app/[locale]/_components/_shared/_reason-template-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { adjustmentApi } from "@/lib/apis/adjustment-api";
import { apiClient } from "@/lib/utils/fetch-client";
import type { ApproverInfo } from "@/lib/apis/company-employees";
import {
  formatDateWithDayOfWeek,
  formatTime,
} from "@/lib/utils/format-date-time";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import type {
  AttendanceRecord,
  UnifiedAttendanceRecord,
  BreakRecord,
} from "@/types/attendance-records";
import type { DefaultApprover } from "@/types/department";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import type { BreakConfig } from "@/types/attendance-config";

// ============================================
// Types
// ============================================

type DialogMode = "employee" | "manager";

interface AdjustmentDialogProps {
  mode?: DialogMode;
  record: AttendanceRecord | UnifiedAttendanceRecord | null;
  date?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  // Manager mode: cần employeeId để tạo record mới
  employeeId?: number;
  // Employee mode: cần approver
  approvers?: ApproverInfo[];
  defaultApprover?: DefaultApprover | null;
  breakConfig?: BreakConfig | null;
}

interface BreakFormData {
  breakRecordId: number;
  breakNumber: number;
  originalStart: string;
  originalEnd: string;
  newStart: string;
  newEnd: string;
  isEditing: boolean;
  isDeleting: boolean;
  isNew?: boolean; // Đánh dấu break mới tạo (chưa có record)
}

interface FormData {
  requestedCheckIn: string;
  requestedCheckOut: string;
  breaks: BreakFormData[];
  newBreakStart: string; // Break mới khi không có record
  newBreakEnd: string;
  reason: string;
  assignedTo: string;
}

interface FormErrors {
  requestedCheckIn?: string;
  reason?: string;
  assignedTo?: string;
  breakTime?: string;
}

interface DeleteConfirmState {
  open: boolean;
  type: "break" | "record" | null;
  breakIndex?: number;
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

// Format date thành yyyy-MM-dd (local timezone, không dùng toISOString để tránh lệch ngày do UTC)
function addOneDay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day + 1);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// Tạo datetime cho checkOut, hỗ trợ ca qua đêm
function combineDateTimeForCheckOut(
  date: string,
  checkOutTime: string,
  checkInTime: string,
): string {
  if (!checkOutTime) return "";
  const checkInMin = timeToMinutes(checkInTime);
  const checkOutMin = timeToMinutes(checkOutTime);
  // Nếu checkOut <= checkIn → qua đêm → +1 ngày
  if (checkOutMin <= checkInMin && checkInTime) {
    return `${addOneDay(date)}T${checkOutTime}:00`;
  }
  return `${date}T${checkOutTime}:00`;
}

// Tạo datetime cho break time, hỗ trợ ca qua đêm
// Break time trước checkIn (theo giờ) → coi như ngày hôm sau
function combineDateTimeForBreak(
  date: string,
  breakTime: string,
  checkInTime: string,
): string {
  if (!breakTime) return "";
  const checkInMin = timeToMinutes(checkInTime);
  const breakMin = timeToMinutes(breakTime);
  if (breakMin < checkInMin && checkInTime) {
    return `${addOneDay(date)}T${breakTime}:00`;
  }
  return `${date}T${breakTime}:00`;
}

// Kiểm tra có phải ca qua đêm không
function isOvernightShift(checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false;
  return timeToMinutes(checkOut) <= timeToMinutes(checkIn);
}

function calculateBreakMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  let minutes = endH * 60 + endM - (startH * 60 + startM);
  // Hỗ trợ qua đêm: nếu kết quả âm, cộng thêm 24h
  if (minutes < 0) minutes += 24 * 60;
  return minutes;
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
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function formatTotalBreakMinutes(
  breaks: BreakFormData[],
  locale: string,
  newBreakStart?: string,
  newBreakEnd?: string,
): string {
  let totalMinutes = breaks
    .filter((br) => !br.isDeleting)
    .reduce((sum, br) => {
      const minutes = calculateBreakMinutes(br.newStart, br.newEnd);
      return sum + (minutes > 0 ? minutes : 0);
    }, 0);

  // Thêm break mới nếu có
  if (newBreakStart && newBreakEnd) {
    const newBreakMinutes = calculateBreakMinutes(newBreakStart, newBreakEnd);
    if (newBreakMinutes > 0) {
      totalMinutes += newBreakMinutes;
    }
  }

  return formatDurationByLocale(totalMinutes, locale);
}

// Tính tổng số phút break
function calculateTotalBreakMinutes(
  breaks: BreakFormData[],
  newBreakStart?: string,
  newBreakEnd?: string,
): number {
  let totalMinutes = breaks
    .filter((br) => !br.isDeleting)
    .reduce((sum, br) => {
      const minutes = calculateBreakMinutes(br.newStart, br.newEnd);
      return sum + (minutes > 0 ? minutes : 0);
    }, 0);

  if (newBreakStart && newBreakEnd) {
    const newBreakMinutes = calculateBreakMinutes(newBreakStart, newBreakEnd);
    if (newBreakMinutes > 0) {
      totalMinutes += newBreakMinutes;
    }
  }

  return totalMinutes;
}

// Tính thời gian làm việc thực tế (phút)
function calculateWorkingMinutes(
  checkIn: string,
  checkOut: string,
  totalBreakMinutes: number,
): number {
  if (!checkIn || !checkOut) return 0;
  const grossMinutes = calculateBreakMinutes(checkIn, checkOut);
  return Math.max(0, grossMinutes - totalBreakMinutes);
}

// Xác định minimum break cần thiết theo thời gian làm việc (theo luật Nhật)
// Lấy thời gian giải lao mặc định từ cấu hình
function getRequiredBreakMinutes(
  _workingMinutes: number,
  breakConfig: BreakConfig | null,
): number {
  return breakConfig?.defaultBreakMinutes || 0;
}

// Chuyển đổi time string (HH:mm) thành số phút từ 00:00
function timeToMinutes(time: string): number {
  if (!time) return -1;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Kiểm tra break time có nằm trong khoảng checkIn - checkOut không
// Hỗ trợ ca qua đêm (checkOut < checkIn)
function isBreakTimeInRange(
  breakStart: string,
  breakEnd: string,
  checkIn: string,
  checkOut: string,
): { valid: boolean; error?: string } {
  if (!checkIn || !checkOut) {
    return { valid: true }; // Không thể validate nếu chưa có checkIn/checkOut
  }

  const checkInMin = timeToMinutes(checkIn);
  const checkOutMin = timeToMinutes(checkOut);
  const isOvernight = checkOutMin <= checkInMin;

  // Normalize time to continuous range for overnight shifts
  // Overnight: checkIn=23:00(1380) checkOut=02:30(150) → checkOut becomes 1380+150=1530 (26:30)
  const normalizeTime = (minutes: number): number => {
    if (isOvernight && minutes < checkInMin) {
      return minutes + 24 * 60;
    }
    return minutes;
  };

  const normCheckIn = checkInMin;
  const normCheckOut = isOvernight ? checkOutMin + 24 * 60 : checkOutMin;

  if (breakStart) {
    const normBreakStart = normalizeTime(timeToMinutes(breakStart));
    if (normBreakStart < normCheckIn || normBreakStart > normCheckOut) {
      return { valid: false, error: "breakStartOutOfRange" };
    }
  }

  if (breakEnd) {
    const normBreakEnd = normalizeTime(timeToMinutes(breakEnd));
    if (normBreakEnd < normCheckIn || normBreakEnd > normCheckOut) {
      return { valid: false, error: "breakEndOutOfRange" };
    }
  }

  if (breakStart && breakEnd) {
    const normBreakStart = normalizeTime(timeToMinutes(breakStart));
    const normBreakEnd = normalizeTime(timeToMinutes(breakEnd));
    if (normBreakStart >= normBreakEnd) {
      return { valid: false, error: "breakStartAfterEnd" };
    }
  }

  return { valid: true };
}

// ============================================
// AdjustmentDialog Component
// ============================================

export function AdjustmentDialog({
  mode = "employee",
  record,
  date,
  open,
  onOpenChange,
  onSuccess,
  employeeId,
  approvers = [],
  defaultApprover = null,
  breakConfig = null,
}: AdjustmentDialogProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;
  const quickSelectLabel = tCommon("quickSelect");
  const workDate = record?.workDate || date || "";
  const isManager = mode === "manager";

  const [formData, setFormData] = React.useState<FormData>({
    requestedCheckIn: "",
    requestedCheckOut: "",
    breaks: [],
    newBreakStart: "",
    newBreakEnd: "",
    reason: "",
    assignedTo: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<DeleteConfirmState>({
    open: false,
    type: null,
  });
  const [overnightConfirmOpen, setOvernightConfirmOpen] = React.useState(false);

  // Reset form khi dialog mở
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
          isDeleting: false,
          isNew: false,
        })),
        newBreakStart: "",
        newBreakEnd: "",
        reason: "",
        assignedTo: defaultApprover ? String(defaultApprover.id) : "",
      });
      setErrors({});
    }
  }, [open, record, defaultApprover]);

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
        i === index ? { ...br, isEditing: checked, isDeleting: false } : br,
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

  // Xử lý đánh dấu xóa break
  const handleDeleteBreakClick = (index: number) => {
    setDeleteConfirm({ open: true, type: "break", breakIndex: index });
  };

  const handleDeleteRecordClick = () => {
    setDeleteConfirm({ open: true, type: "record" });
  };

  const confirmDelete = () => {
    if (
      deleteConfirm.type === "break" &&
      deleteConfirm.breakIndex !== undefined
    ) {
      setFormData((prev) => ({
        ...prev,
        breaks: prev.breaks.map((br, i) =>
          i === deleteConfirm.breakIndex
            ? { ...br, isDeleting: true, isEditing: false }
            : br,
        ),
      }));
    }
    setDeleteConfirm({ open: false, type: null });
  };

  // Kiểm tra có thay đổi gì không
  const hasChanges = React.useMemo(() => {
    // Có break đang đánh dấu xóa
    const hasDeleteBreak = formData.breaks.some((br) => br.isDeleting);
    if (hasDeleteBreak) return true;

    // Có break mới được nhập
    const hasNewBreak = !!(formData.newBreakStart && formData.newBreakEnd);
    if (hasNewBreak) return true;

    if (!record) {
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

  // Tính toán thời gian làm việc và kiểm tra break
  const workingTimeAnalysis = React.useMemo(() => {
    const checkIn = formData.requestedCheckIn;
    const checkOut = formData.requestedCheckOut;

    if (!checkIn || !checkOut) {
      return {
        workingMinutes: 0,
        totalBreakMinutes: 0,
        requiredBreakMinutes: 0,
        isBreakInsufficient: false,
      };
    }

    const totalBreakMinutes = calculateTotalBreakMinutes(
      formData.breaks,
      formData.newBreakStart,
      formData.newBreakEnd,
    );

    const workingMinutes = calculateWorkingMinutes(
      checkIn,
      checkOut,
      totalBreakMinutes,
    );
    const requiredBreakMinutes = getRequiredBreakMinutes(
      workingMinutes,
      breakConfig,
    );
    const isBreakInsufficient = totalBreakMinutes < requiredBreakMinutes;

    return {
      workingMinutes,
      totalBreakMinutes,
      requiredBreakMinutes,
      isBreakInsufficient,
    };
  }, [formData, breakConfig]);

  // Real-time validation cho break time
  const breakTimeValidation = React.useMemo(() => {
    const checkIn = formData.requestedCheckIn;
    const checkOut = formData.requestedCheckOut;

    // Validate new break
    if (formData.newBreakStart || formData.newBreakEnd) {
      const validation = isBreakTimeInRange(
        formData.newBreakStart,
        formData.newBreakEnd,
        checkIn,
        checkOut,
      );
      if (!validation.valid) {
        return { valid: false, error: validation.error };
      }
    }

    // Validate existing breaks being edited
    for (const br of formData.breaks) {
      if (br.isEditing && !br.isDeleting) {
        const validation = isBreakTimeInRange(
          br.newStart,
          br.newEnd,
          checkIn,
          checkOut,
        );
        if (!validation.valid) {
          return { valid: false, error: validation.error };
        }
      }
    }

    return { valid: true };
  }, [formData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.reason.trim()) {
      newErrors.reason = t("adjustment.reasonRequired");
    }

    if (!isManager && !formData.assignedTo) {
      newErrors.assignedTo = t("adjustment.assignedToRequired");
    }

    if (!hasChanges) {
      newErrors.requestedCheckIn = record
        ? t("adjustment.timeChangeRequired")
        : t("adjustment.timeRequired");
    }

    // Sử dụng real-time validation
    if (!breakTimeValidation.valid && breakTimeValidation.error) {
      newErrors.breakTime = t(`adjustment.${breakTimeValidation.error}`);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Kiểm tra ca qua đêm → hiện dialog xác nhận
    if (
      isOvernightShift(formData.requestedCheckIn, formData.requestedCheckOut) &&
      !overnightConfirmOpen
    ) {
      setOvernightConfirmOpen(true);
      return;
    }

    await doSubmit();
  };

  const doSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Kiểm tra thay đổi check in/out
      const originalCheckIn = record
        ? extractTimeFromDateTime(record.originalCheckIn)
        : "";
      const originalCheckOut = record
        ? extractTimeFromDateTime(record.originalCheckOut)
        : "";
      const checkInChanged = formData.requestedCheckIn !== originalCheckIn;
      const checkOutChanged = formData.requestedCheckOut !== originalCheckOut;

      if (isManager) {
        if (record?.id) {
          // Manager mode: update record hiện có
          const breakAdjustments = formData.breaks
            .filter(
              (br) =>
                br.isEditing &&
                !br.isDeleting &&
                (br.newStart !== br.originalStart ||
                  br.newEnd !== br.originalEnd),
            )
            .map((br) => ({
              breakRecordId: br.breakRecordId,
              breakStartTime:
                br.newStart !== br.originalStart
                  ? combineDateTimeForBreak(
                      workDate,
                      br.newStart,
                      formData.requestedCheckIn,
                    )
                  : null,
              breakEndTime:
                br.newEnd !== br.originalEnd
                  ? combineDateTimeForBreak(
                      workDate,
                      br.newEnd,
                      formData.requestedCheckIn,
                    )
                  : null,
            }));

          await apiClient.put(`/api/company/attendance/${record.id}/adjust`, {
            checkInTime: formData.requestedCheckIn
              ? combineDateTime(workDate, formData.requestedCheckIn)
              : null,
            checkOutTime: formData.requestedCheckOut
              ? combineDateTimeForCheckOut(
                  workDate,
                  formData.requestedCheckOut,
                  formData.requestedCheckIn,
                )
              : null,
            breakAdjustments:
              breakAdjustments.length > 0 ? breakAdjustments : null,
            reason: formData.reason.trim(),
          });
        } else {
          // Manager mode: tạo record mới
          const breakItems =
            formData.newBreakStart && formData.newBreakEnd
              ? [
                  {
                    breakStartTime: combineDateTimeForBreak(
                      workDate,
                      formData.newBreakStart,
                      formData.requestedCheckIn,
                    ),
                    breakEndTime: combineDateTimeForBreak(
                      workDate,
                      formData.newBreakEnd,
                      formData.requestedCheckIn,
                    ),
                  },
                ]
              : undefined;

          await apiClient.post("/api/company/attendance/create", {
            employeeId,
            workDate,
            checkInTime: formData.requestedCheckIn
              ? combineDateTime(workDate, formData.requestedCheckIn)
              : null,
            checkOutTime: formData.requestedCheckOut
              ? combineDateTimeForCheckOut(
                  workDate,
                  formData.requestedCheckOut,
                  formData.requestedCheckIn,
                )
              : null,
            breakItems,
            reason: formData.reason.trim(),
          });
        }

        toast.success(t("messages.editSuccess"));
      } else {
        // Employee mode: gửi adjustment request
        const breakItems: {
          breakRecordId?: number;
          actionType: "ADJUST" | "DELETE" | "CREATE";
          requestedBreakStart?: string;
          requestedBreakEnd?: string;
        }[] = [];

        for (const br of formData.breaks.filter((b) => b.isDeleting)) {
          breakItems.push({
            breakRecordId: br.breakRecordId,
            actionType: "DELETE",
          });
        }

        for (const br of formData.breaks.filter(
          (b) =>
            b.isEditing &&
            !b.isDeleting &&
            (b.newStart !== b.originalStart || b.newEnd !== b.originalEnd),
        )) {
          breakItems.push({
            breakRecordId: br.breakRecordId,
            actionType: "ADJUST",
            requestedBreakStart:
              br.newStart !== br.originalStart
                ? combineDateTimeForBreak(
                    workDate,
                    br.newStart,
                    formData.requestedCheckIn,
                  )
                : undefined,
            requestedBreakEnd:
              br.newEnd !== br.originalEnd
                ? combineDateTimeForBreak(
                    workDate,
                    br.newEnd,
                    formData.requestedCheckIn,
                  )
                : undefined,
          });
        }

        if (formData.newBreakStart && formData.newBreakEnd) {
          breakItems.push({
            actionType: "CREATE",
            requestedBreakStart: combineDateTimeForBreak(
              workDate,
              formData.newBreakStart,
              formData.requestedCheckIn,
            ),
            requestedBreakEnd: combineDateTimeForBreak(
              workDate,
              formData.newBreakEnd,
              formData.requestedCheckIn,
            ),
          });
        }

        await adjustmentApi.createAdjustmentRequest({
          requestType: "ADJUST",
          attendanceRecordId: record?.id,
          workDate: workDate,
          requestedCheckIn:
            checkInChanged && formData.requestedCheckIn
              ? combineDateTime(workDate, formData.requestedCheckIn)
              : undefined,
          requestedCheckOut:
            checkOutChanged && formData.requestedCheckOut
              ? combineDateTimeForCheckOut(
                  workDate,
                  formData.requestedCheckOut,
                  formData.requestedCheckIn,
                )
              : undefined,
          breakItems: breakItems.length > 0 ? breakItems : undefined,
          reason: formData.reason.trim(),
          assignedTo: parseInt(formData.assignedTo),
        });

        toast.success(t("messages.adjustmentSubmitted"));
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit yêu cầu xóa record
  const handleSubmitDeleteRecord = async () => {
    if (isManager) {
      // Manager mode: xóa trực tiếp
      try {
        setIsSubmitting(true);
        await apiClient.delete(`/api/company/attendance/${record?.id}`);
        toast.success(t("messages.deleteSuccess"));
        setDeleteConfirm({ open: false, type: null });
        onOpenChange(false);
        onSuccess();
      } catch (error) {
        const errorCode = (error as { errorCode?: string })?.errorCode;
        toast.error(getErrorMessage(errorCode, tErrors));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Employee mode: gửi yêu cầu duyệt
      if (!formData.reason.trim()) {
        setErrors({ reason: t("adjustment.reasonRequired") });
        setDeleteConfirm({ open: false, type: null });
        return;
      }
      if (!formData.assignedTo) {
        setErrors({ assignedTo: t("adjustment.assignedToRequired") });
        setDeleteConfirm({ open: false, type: null });
        return;
      }

      try {
        setIsSubmitting(true);
        await adjustmentApi.createAdjustmentRequest({
          requestType: "DELETE_RECORD",
          attendanceRecordId: record?.id,
          workDate: workDate,
          reason: formData.reason.trim(),
          assignedTo: parseInt(formData.assignedTo),
        });
        toast.success(t("messages.adjustmentSubmitted"));
        setDeleteConfirm({ open: false, type: null });
        onOpenChange(false);
        onSuccess();
      } catch (error) {
        const errorCode = (error as { errorCode?: string })?.errorCode;
        toast.error(getErrorMessage(errorCode, tErrors));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isManager ? t("editDialog.title") : t("adjustment.title")}
            </DialogTitle>
            <DialogDescription>
              {formatDateWithDayOfWeek(workDate, locale)}
            </DialogDescription>
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
              <div>
                <Label htmlFor="requestedCheckIn" className="text-sm">
                  {t("checkIn")}
                </Label>
                <TimePicker
                  id="requestedCheckIn"
                  value={formData.requestedCheckIn}
                  onChange={(value) => handleChange("requestedCheckIn", value)}
                  quickSelectLabel={quickSelectLabel}
                />
                {errors.requestedCheckIn && (
                  <p className="text-xs text-destructive">
                    {errors.requestedCheckIn}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="requestedCheckOut" className="text-sm">
                  {t("checkOut")}
                </Label>
                <TimePicker
                  id="requestedCheckOut"
                  value={formData.requestedCheckOut}
                  onChange={(value) => handleChange("requestedCheckOut", value)}
                  quickSelectLabel={quickSelectLabel}
                />
              </div>
            </div>

            {/* Break records với nút xóa */}
            {formData.breaks.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">
                    {t("editDialog.breakRecords")}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {t("editDialog.totalBreak")}:{" "}
                    {formatTotalBreakMinutes(
                      formData.breaks,
                      locale,
                      formData.newBreakStart,
                      formData.newBreakEnd,
                    )}
                  </span>
                </div>
                <div className="space-y-3">
                  {formData.breaks.map((br, index) => (
                    <div
                      key={br.breakRecordId}
                      className={`p-3 border rounded-lg space-y-3 ${br.isDeleting ? "bg-destructive/10 border-destructive/30" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {!br.isDeleting && (
                            <Checkbox
                              id={`break-${br.breakRecordId}`}
                              checked={br.isEditing}
                              onCheckedChange={(checked) =>
                                handleBreakToggle(index, checked as boolean)
                              }
                            />
                          )}
                          <Label
                            htmlFor={`break-${br.breakRecordId}`}
                            className={`text-sm cursor-pointer ${br.isDeleting ? "line-through text-muted-foreground" : ""}`}
                          >
                            {t("adjustment.breakLabel", {
                              number: br.breakNumber,
                              start: br.originalStart || "--:--",
                              end: br.originalEnd || "--:--",
                            })}
                          </Label>
                        </div>
                        {br.isDeleting ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                breaks: prev.breaks.map((b, i) =>
                                  i === index ? { ...b, isDeleting: false } : b,
                                ),
                              }))
                            }
                          >
                            {tCommon("undo")}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteBreakClick(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {br.isEditing && !br.isDeleting && (
                        <div className="grid grid-cols-2 gap-3 pl-6">
                          <div className="space-y-1">
                            <Label className="text-xs">{t("breakStart")}</Label>
                            <TimePicker
                              value={br.newStart}
                              onChange={(value) =>
                                handleBreakChange(index, "newStart", value)
                              }
                              quickSelectLabel={quickSelectLabel}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t("breakEnd")}</Label>
                            <TimePicker
                              value={br.newEnd}
                              onChange={(value) =>
                                handleBreakChange(index, "newEnd", value)
                              }
                              quickSelectLabel={quickSelectLabel}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nhập giờ giải lao mới - hiển thị khi không có record */}
            {!record && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newBreakStart" className="text-sm">
                      {t("adjustment.newBreakStart")}
                    </Label>
                    <TimePicker
                      id="newBreakStart"
                      value={formData.newBreakStart}
                      onChange={(value) => handleChange("newBreakStart", value)}
                      quickSelectLabel={quickSelectLabel}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newBreakEnd" className="text-sm">
                      {t("adjustment.newBreakEnd")}
                    </Label>
                    <TimePicker
                      id="newBreakEnd"
                      value={formData.newBreakEnd}
                      onChange={(value) => handleChange("newBreakEnd", value)}
                      quickSelectLabel={quickSelectLabel}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("adjustment.breakTimeHint")}
                </p>
              </div>
            )}

            {/* Tổng kết thời gian làm việc và cảnh báo */}
            {formData.requestedCheckIn && formData.requestedCheckOut && (
              <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("workingHours")}:
                  </span>
                  <span className="font-medium">
                    {formatDurationByLocale(
                      workingTimeAnalysis.workingMinutes,
                      locale,
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("editDialog.totalBreak")}:
                  </span>
                  <span
                    className={
                      !breakTimeValidation.valid
                        ? "text-destructive font-medium"
                        : workingTimeAnalysis.isBreakInsufficient
                          ? "text-amber-600 dark:text-amber-500 font-medium"
                          : ""
                    }
                  >
                    {formatDurationByLocale(
                      workingTimeAnalysis.totalBreakMinutes,
                      locale,
                    )}
                    {workingTimeAnalysis.requiredBreakMinutes > 0 && (
                      <span className="text-muted-foreground ml-1">
                        / {workingTimeAnalysis.requiredBreakMinutes}
                        {t("adjustment.minutesRequired")}
                      </span>
                    )}
                  </span>
                </div>

                {/* Break time validation error - ngoài khoảng check-in/check-out */}
                {!breakTimeValidation.valid && breakTimeValidation.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {t(`adjustment.${breakTimeValidation.error}`)}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Break insufficient warning - chỉ cảnh báo, không bắt buộc */}
                {workingTimeAnalysis.isBreakInsufficient &&
                  breakTimeValidation.valid && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {t("adjustment.breakInsufficientWarning", {
                          current: workingTimeAnalysis.totalBreakMinutes,
                          minimum: workingTimeAnalysis.requiredBreakMinutes,
                        })}
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            )}

            {/* Lý do */}
            <div>
              <Label htmlFor="reason" className="text-sm">
                {t("adjustment.reason")}
              </Label>
              <ReasonTemplateSelect
                category="adjustment"
                value={formData.reason}
                onChange={(value) => handleChange("reason", value)}
                error={errors.reason}
              />
            </div>

            {/* Người duyệt - chỉ hiển thị cho employee */}
            {!isManager && (
              <div>
                <Label htmlFor="assignedTo" className="text-sm">
                  {t("adjustment.assignedTo")}
                </Label>
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
                        {defaultApprover?.id === approver.id && (
                          <span className="text-muted-foreground ml-1">
                            - {t("adjustment.departmentManager")}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedTo && (
                  <p className="text-xs text-destructive">
                    {errors.assignedTo}
                  </p>
                )}
                {defaultApprover && (
                  <p className="text-xs text-muted-foreground">
                    {t("adjustment.defaultApproverHint", {
                      name: defaultApprover.name,
                    })}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between gap-2 mt-4">
            {/* Nút xóa record - bên trái */}
            {record ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDeleteRecordClick}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <div />
            )}

            {/* Nút Hủy/Gửi - bên phải */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || !hasChanges || !breakTimeValidation.valid
                }
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {isManager ? tCommon("save") : t("adjustment.submit")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          !open && setDeleteConfirm({ open: false, type: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteConfirm.type === "record"
                ? t("adjustment.deleteRecordTitle")
                : t("adjustment.deleteBreakTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {deleteConfirm.type === "record"
                  ? isManager
                    ? t("adjustment.deleteRecordDirectDesc")
                    : t("adjustment.deleteRecordDesc")
                  : t("adjustment.deleteBreakDesc")}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={
                deleteConfirm.type === "record"
                  ? handleSubmitDeleteRecord
                  : confirmDelete
              }
            >
              {isSubmitting && deleteConfirm.type === "record" && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Overnight shift confirm dialog */}
      <AlertDialog
        open={overnightConfirmOpen}
        onOpenChange={setOvernightConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("adjustment.overnightConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("adjustment.overnightConfirmDesc", {
                checkIn: formData.requestedCheckIn,
                checkOut: formData.requestedCheckOut,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOvernightConfirmOpen(false);
                doSubmit();
              }}
            >
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
