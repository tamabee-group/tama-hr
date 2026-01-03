"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { WorkSchedule, WorkScheduleInput } from "@/types/attendance-records";
import { SCHEDULE_TYPES, ScheduleType } from "@/types/attendance-enums";
import { createSchedule, updateSchedule } from "@/lib/apis/work-schedule-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import {
  BreakPeriodForm,
  BreakPeriodData,
  calculateTotalBreakMinutes,
} from "./_break-period-form";
import { ScheduleTimeline } from "../_components/_schedule-timeline";

interface ScheduleFormProps {
  schedule?: WorkSchedule | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  type: ScheduleType;
  workStartTime: string;
  workEndTime: string;
  breakMinutes: number;
  isDefault: boolean;
  flexibleStartRange: string;
  flexibleEndRange: string;
  breakPeriods: BreakPeriodData[];
}

/**
 * Validate time format HH:mm (strict format with leading zeros)
 * Valid: "09:00", "23:59", "00:00"
 * Invalid: "9:00", "1:30", "25:00"
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

/**
 * Compare two time strings
 * Returns true if startTime is before endTime
 * Supports overnight schedules (e.g., 22:00 to 06:00)
 */
export function isStartTimeBeforeEndTime(
  startTime: string,
  endTime: string,
  allowOvernight: boolean = false,
): boolean {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Nếu cho phép overnight, chỉ cần 2 thời gian khác nhau
  if (allowOvernight) {
    return startMinutes !== endMinutes;
  }

  // Không cho phép overnight: start phải trước end
  return startMinutes < endMinutes;
}

/**
 * Kiểm tra xem schedule có phải overnight không (end < start)
 */
export function isOvernightSchedule(
  workStartTime: string,
  workEndTime: string,
): boolean {
  if (!isValidTimeFormat(workStartTime) || !isValidTimeFormat(workEndTime)) {
    return false;
  }

  const [startHour, startMin] = workStartTime.split(":").map(Number);
  const [endHour, endMin] = workEndTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes < startMinutes;
}

/**
 * Chuyển đổi time string sang minutes từ 00:00
 */
function timeToMinutes(time: string): number {
  const [hour, min] = time.split(":").map(Number);
  return hour * 60 + min;
}

/**
 * Kiểm tra break period có nằm trong work hours không
 * Hỗ trợ overnight schedules
 */
export function isBreakWithinWorkHours(
  breakStart: string,
  breakEnd: string,
  workStart: string,
  workEnd: string,
  isOvernight: boolean,
): boolean {
  if (!isValidTimeFormat(breakStart) || !isValidTimeFormat(breakEnd)) {
    return false;
  }

  const breakStartMin = timeToMinutes(breakStart);
  const breakEndMin = timeToMinutes(breakEnd);
  const workStartMin = timeToMinutes(workStart);
  let workEndMin = timeToMinutes(workEnd);

  // Nếu overnight, work end được cộng thêm 24h
  if (isOvernight) {
    workEndMin += 24 * 60;
  }

  // Normalize break times cho overnight schedule
  let normalizedBreakStart = breakStartMin;
  let normalizedBreakEnd = breakEndMin;

  if (isOvernight) {
    // Nếu break start trước work start (tức là sau nửa đêm)
    if (breakStartMin < workStartMin) {
      normalizedBreakStart += 24 * 60;
    }
    // Nếu break end trước break start (break qua nửa đêm)
    if (breakEndMin <= breakStartMin) {
      normalizedBreakEnd += 24 * 60;
    }
  }

  return (
    normalizedBreakStart >= workStartMin && normalizedBreakEnd <= workEndMin
  );
}

/**
 * Kiểm tra 2 break periods có overlap không
 */
export function areBreakPeriodsOverlapping(
  period1Start: string,
  period1End: string,
  period2Start: string,
  period2End: string,
  isOvernight: boolean,
): boolean {
  let start1 = timeToMinutes(period1Start);
  let end1 = timeToMinutes(period1End);
  let start2 = timeToMinutes(period2Start);
  let end2 = timeToMinutes(period2End);

  // Normalize cho overnight
  if (isOvernight) {
    if (end1 < start1) end1 += 24 * 60;
    if (end2 < start2) end2 += 24 * 60;
    // Nếu start nhỏ hơn một ngưỡng (giả sử 12:00), coi như sau nửa đêm
    if (start1 < 12 * 60 && end1 > 12 * 60) start1 += 24 * 60;
    if (start2 < 12 * 60 && end2 > 12 * 60) start2 += 24 * 60;
  }

  // Kiểm tra overlap: period1 và period2 overlap nếu start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}

/**
 * Component form tạo/sửa lịch làm việc
 * Hỗ trợ 3 loại: FIXED, FLEXIBLE, SHIFT
 * Hỗ trợ break periods với overnight schedules
 */
export function ScheduleForm({
  schedule,
  open,
  onClose,
  onSuccess,
}: ScheduleFormProps) {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");

  const isEditing = !!schedule;

  // Parse existing break periods từ schedule
  const existingBreakPeriods: BreakPeriodData[] =
    schedule?.scheduleData.breakPeriods?.map((bp) => ({
      name: bp.name,
      startTime: bp.startTime,
      endTime: bp.endTime,
      isFlexible: bp.isFlexible,
    })) || [];

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: schedule?.name || "",
    type: schedule?.type || "FIXED",
    workStartTime: schedule?.scheduleData.workStartTime || "09:00",
    workEndTime: schedule?.scheduleData.workEndTime || "18:00",
    breakMinutes: schedule?.scheduleData.breakMinutes || 60,
    isDefault: schedule?.isDefault || false,
    flexibleStartRange: schedule?.scheduleData.flexibleStartRange || "",
    flexibleEndRange: schedule?.scheduleData.flexibleEndRange || "",
    breakPeriods: existingBreakPeriods,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Kiểm tra overnight schedule
  const isOvernight = isOvernightSchedule(
    formData.workStartTime,
    formData.workEndTime,
  );

  // Handle field change
  const handleChange = (
    field: keyof FormData,
    value: string | number | boolean | BreakPeriodData[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error khi user sửa
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle break periods change
  const handleBreakPeriodsChange = (periods: BreakPeriodData[]) => {
    // Tự động cập nhật breakMinutes từ tổng break periods
    const totalMinutes = calculateTotalBreakMinutes(periods, isOvernight);
    setFormData((prev) => ({
      ...prev,
      breakPeriods: periods,
      breakMinutes: totalMinutes > 0 ? totalMinutes : prev.breakMinutes,
    }));
    // Clear break errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.breakPeriods;
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("breakPeriod_")) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("form.namePlaceholder");
    }

    if (!isValidTimeFormat(formData.workStartTime)) {
      newErrors.workStartTime = t("messages.invalidTimeRange");
    }

    if (!isValidTimeFormat(formData.workEndTime)) {
      newErrors.workEndTime = t("messages.invalidTimeRange");
    }

    // Validate time range - cho phép overnight với SHIFT type
    const allowOvernight = formData.type === "SHIFT";
    if (
      isValidTimeFormat(formData.workStartTime) &&
      isValidTimeFormat(formData.workEndTime) &&
      !isStartTimeBeforeEndTime(
        formData.workStartTime,
        formData.workEndTime,
        allowOvernight,
      )
    ) {
      newErrors.workEndTime = t("messages.invalidTimeRange");
    }

    if (formData.breakMinutes < 0 || formData.breakMinutes > 480) {
      newErrors.breakMinutes = t("messages.invalidTimeRange");
    }

    // Validate break periods
    const currentIsOvernight = isOvernightSchedule(
      formData.workStartTime,
      formData.workEndTime,
    );

    formData.breakPeriods.forEach((period, index) => {
      // Validate time format
      if (
        !isValidTimeFormat(period.startTime) ||
        !isValidTimeFormat(period.endTime)
      ) {
        newErrors[`breakPeriod_${index}`] = t("messages.invalidTimeRange");
        return;
      }

      // Validate break within work hours
      if (
        !isBreakWithinWorkHours(
          period.startTime,
          period.endTime,
          formData.workStartTime,
          formData.workEndTime,
          currentIsOvernight,
        )
      ) {
        newErrors[`breakPeriod_${index}`] = t("form.breakOutsideWorkHours");
      }
    });

    // Validate break periods không overlap
    for (let i = 0; i < formData.breakPeriods.length; i++) {
      for (let j = i + 1; j < formData.breakPeriods.length; j++) {
        if (
          areBreakPeriodsOverlapping(
            formData.breakPeriods[i].startTime,
            formData.breakPeriods[i].endTime,
            formData.breakPeriods[j].startTime,
            formData.breakPeriods[j].endTime,
            currentIsOvernight,
          )
        ) {
          newErrors.breakPeriods = t("form.breakOverlap");
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Convert break periods to API format
      const breakPeriodsData = formData.breakPeriods.map((period, index) => ({
        name: period.name || `Break ${index + 1}`,
        startTime: period.startTime,
        endTime: period.endTime,
        durationMinutes: calculateTotalBreakMinutes([period], isOvernight),
        isFlexible: period.isFlexible,
      }));

      const scheduleData: WorkScheduleInput = {
        name: formData.name,
        type: formData.type,
        isDefault: formData.isDefault,
        scheduleData: {
          workStartTime: formData.workStartTime,
          workEndTime: formData.workEndTime,
          breakMinutes: formData.breakMinutes,
          ...(breakPeriodsData.length > 0 && {
            breakPeriods: breakPeriodsData,
          }),
          ...(formData.type === "FLEXIBLE" && {
            flexibleStartRange: formData.flexibleStartRange,
            flexibleEndRange: formData.flexibleEndRange,
          }),
        },
      };

      if (isEditing && schedule) {
        await updateSchedule(schedule.id, scheduleData);
        toast.success(t("messages.updateSuccess"));
      } else {
        await createSchedule(scheduleData);
        toast.success(t("messages.createSuccess"));
      }

      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editSchedule") : t("createSchedule")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input
              id="name"
              placeholder={t("form.namePlaceholder")}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>{t("form.type")}</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                handleChange("type", value as ScheduleType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getEnumLabel("scheduleType", type, tEnums)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work Start Time */}
          <div className="space-y-2">
            <Label htmlFor="workStartTime">{t("form.workStartTime")}</Label>
            <Input
              id="workStartTime"
              type="time"
              value={formData.workStartTime}
              onChange={(e) => handleChange("workStartTime", e.target.value)}
            />
            {errors.workStartTime && (
              <p className="text-sm text-destructive">{errors.workStartTime}</p>
            )}
          </div>

          {/* Work End Time */}
          <div className="space-y-2">
            <Label htmlFor="workEndTime">{t("form.workEndTime")}</Label>
            <Input
              id="workEndTime"
              type="time"
              value={formData.workEndTime}
              onChange={(e) => handleChange("workEndTime", e.target.value)}
            />
            {errors.workEndTime && (
              <p className="text-sm text-destructive">{errors.workEndTime}</p>
            )}
          </div>

          {/* Overnight indicator */}
          {isOvernight && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {t("form.overnightScheduleHint")}
            </div>
          )}

          {/* Flexible Schedule Fields */}
          {formData.type === "FLEXIBLE" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="flexibleStartRange">
                  {t("table.effectiveFrom")}
                </Label>
                <Input
                  id="flexibleStartRange"
                  type="time"
                  value={formData.flexibleStartRange}
                  onChange={(e) =>
                    handleChange("flexibleStartRange", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flexibleEndRange">
                  {t("table.effectiveTo")}
                </Label>
                <Input
                  id="flexibleEndRange"
                  type="time"
                  value={formData.flexibleEndRange}
                  onChange={(e) =>
                    handleChange("flexibleEndRange", e.target.value)
                  }
                />
              </div>
            </>
          )}

          {/* Break Duration (fallback khi không có break periods) */}
          {formData.breakPeriods.length === 0 && (
            <div className="space-y-2">
              <Label htmlFor="breakMinutes">{t("form.breakDuration")}</Label>
              <Input
                id="breakMinutes"
                type="number"
                min={0}
                max={480}
                value={formData.breakMinutes}
                onChange={(e) =>
                  handleChange("breakMinutes", parseInt(e.target.value) || 0)
                }
              />
              {errors.breakMinutes && (
                <p className="text-sm text-destructive">
                  {errors.breakMinutes}
                </p>
              )}
            </div>
          )}

          {/* Break Periods Section */}
          <div className="border-t pt-4">
            <BreakPeriodForm
              breakPeriods={formData.breakPeriods}
              onChange={handleBreakPeriodsChange}
              isOvernight={isOvernight}
              maxPeriods={5}
              errors={errors}
            />
          </div>

          {/* Timeline Preview */}
          <div className="border-t pt-4">
            <Label className="mb-2 block">{t("timeline")}</Label>
            <ScheduleTimeline
              workStartTime={formData.workStartTime}
              workEndTime={formData.workEndTime}
              breakPeriods={formData.breakPeriods.map((bp) => ({
                name: bp.name,
                startTime: bp.startTime,
                endTime: bp.endTime,
                durationMinutes: calculateTotalBreakMinutes([bp], isOvernight),
                isFlexible: bp.isFlexible,
                order: 0,
              }))}
              isOvernight={isOvernight}
            />
          </div>

          {/* Is Default */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="isDefault" className="cursor-pointer">
              {t("form.isDefault")}
            </Label>
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => handleChange("isDefault", checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? tCommon("loading") : tCommon("save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
