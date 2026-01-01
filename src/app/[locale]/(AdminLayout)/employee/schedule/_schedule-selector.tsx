"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Star, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import type {
  WorkSchedule,
  ScheduleSelection,
} from "@/types/attendance-records";
import { scheduleSelectionApi } from "@/lib/apis/schedule-selection-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface ScheduleSelectorProps {
  availableSchedules: WorkSchedule[];
  suggestedSchedules: WorkSchedule[];
  currentSchedule: ScheduleSelection | null;
  isLoading: boolean;
  onSelectSuccess: () => void;
}

/**
 * Component chọn lịch làm việc cho Employee
 * Hiển thị danh sách lịch có sẵn, highlight lịch đề xuất
 * Cho phép chọn khoảng thời gian áp dụng
 */
export function ScheduleSelector({
  availableSchedules,
  suggestedSchedules,
  currentSchedule,
  isLoading,
  onSelectSuccess,
}: ScheduleSelectorProps) {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");

  // State cho dialog chọn ngày
  const [selectedSchedule, setSelectedSchedule] =
    React.useState<WorkSchedule | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [effectiveFrom, setEffectiveFrom] = React.useState("");
  const [effectiveTo, setEffectiveTo] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Lấy danh sách ID của lịch đề xuất
  const suggestedIds = React.useMemo(
    () => new Set(suggestedSchedules.map((s) => s.id)),
    [suggestedSchedules],
  );

  // Kiểm tra xem lịch có phải là lịch hiện tại không
  const isCurrentSchedule = (scheduleId: number) => {
    return currentSchedule?.scheduleId === scheduleId;
  };

  // Mở dialog chọn ngày
  const handleSelectClick = (schedule: WorkSchedule) => {
    setSelectedSchedule(schedule);
    // Set default dates
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setEffectiveFrom(today.toISOString().split("T")[0]);
    setEffectiveTo(nextMonth.toISOString().split("T")[0]);
    setErrors({});
    setDialogOpen(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!effectiveFrom) {
      newErrors.effectiveFrom = t("form.effectiveFrom");
    }

    if (!effectiveTo) {
      newErrors.effectiveTo = t("form.effectiveTo");
    }

    if (effectiveFrom && effectiveTo && effectiveFrom >= effectiveTo) {
      newErrors.effectiveTo = t("messages.invalidTimeRange");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit chọn lịch
  const handleSubmit = async () => {
    if (!selectedSchedule || !validateForm()) return;

    try {
      setSubmitting(true);
      await scheduleSelectionApi.selectSchedule({
        scheduleId: selectedSchedule.id,
        effectiveFrom,
        effectiveTo,
      });
      toast.success(t("messages.selectSuccess"));
      setDialogOpen(false);
      onSelectSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setSubmitting(false);
    }
  };

  // Format thời gian làm việc
  const formatWorkTime = (schedule: WorkSchedule) => {
    const scheduleData = schedule.scheduleData;
    if (!scheduleData) {
      return "-";
    }
    const { workStartTime, workEndTime, breakMinutes } = scheduleData;
    if (!workStartTime || !workEndTime) {
      return "-";
    }
    return `${workStartTime} - ${workEndTime} (${breakMinutes ?? 0} ${tCommon("minutes")} ${t("table.breakTime").toLowerCase()})`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (availableSchedules.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("messages.noSchedules")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lịch đề xuất */}
      {suggestedSchedules.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            {t("selection.suggested")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestedSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                isSuggested
                isCurrent={isCurrentSchedule(schedule.id)}
                formatWorkTime={formatWorkTime}
                getTypeLabel={(type) =>
                  getEnumLabel("scheduleType", type, tEnums)
                }
                onSelect={() => handleSelectClick(schedule)}
                selectLabel={tCommon("select")}
                currentLabel={t("currentSchedule")}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tất cả lịch có sẵn */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("selection.available")}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableSchedules
            .filter((s) => !suggestedIds.has(s.id))
            .map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                isSuggested={false}
                isCurrent={isCurrentSchedule(schedule.id)}
                formatWorkTime={formatWorkTime}
                getTypeLabel={(type) =>
                  getEnumLabel("scheduleType", type, tEnums)
                }
                onSelect={() => handleSelectClick(schedule)}
                selectLabel={tCommon("select")}
                currentLabel={t("currentSchedule")}
              />
            ))}
        </div>
      </div>

      {/* Dialog chọn ngày */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("selection.title")}</DialogTitle>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-4">
              {/* Thông tin lịch đã chọn */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="font-medium">{selectedSchedule.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatWorkTime(selectedSchedule)}
                </p>
              </div>

              {/* Ngày bắt đầu */}
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">{t("form.effectiveFrom")}</Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => {
                    setEffectiveFrom(e.target.value);
                    if (errors.effectiveFrom) {
                      setErrors((prev) => ({ ...prev, effectiveFrom: "" }));
                    }
                  }}
                />
                {errors.effectiveFrom && (
                  <p className="text-sm text-destructive">
                    {errors.effectiveFrom}
                  </p>
                )}
              </div>

              {/* Ngày kết thúc */}
              <div className="space-y-2">
                <Label htmlFor="effectiveTo">{t("form.effectiveTo")}</Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => {
                    setEffectiveTo(e.target.value);
                    if (errors.effectiveTo) {
                      setErrors((prev) => ({ ...prev, effectiveTo: "" }));
                    }
                  }}
                />
                {errors.effectiveTo && (
                  <p className="text-sm text-destructive">
                    {errors.effectiveTo}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? tCommon("loading") : tCommon("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Schedule Card Component
// ============================================

interface ScheduleCardProps {
  schedule: WorkSchedule;
  isSuggested: boolean;
  isCurrent: boolean;
  formatWorkTime: (schedule: WorkSchedule) => string;
  getTypeLabel: (type: string) => string;
  onSelect: () => void;
  selectLabel: string;
  currentLabel: string;
}

function ScheduleCard({
  schedule,
  isSuggested,
  isCurrent,
  formatWorkTime,
  getTypeLabel,
  onSelect,
  selectLabel,
  currentLabel,
}: ScheduleCardProps) {
  return (
    <Card
      className={
        isSuggested
          ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20"
          : ""
      }
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{schedule.name}</CardTitle>
          <div className="flex gap-1">
            {schedule.isDefault && (
              <Badge variant="secondary">{currentLabel}</Badge>
            )}
            {isSuggested && (
              <Badge
                variant="outline"
                className="border-yellow-500 text-yellow-600"
              >
                <Star className="h-3 w-3 mr-1" />
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{getTypeLabel(schedule.type)}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatWorkTime(schedule)}</span>
        </div>
        <Button
          className="w-full"
          variant={isCurrent ? "secondary" : "default"}
          disabled={isCurrent}
          onClick={onSelect}
        >
          {isCurrent ? currentLabel : selectLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
