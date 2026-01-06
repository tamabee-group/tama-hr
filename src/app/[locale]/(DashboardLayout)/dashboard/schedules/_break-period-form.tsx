"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

export interface BreakPeriodData {
  name: string;
  startTime: string;
  endTime: string;
  isFlexible: boolean;
}

interface BreakPeriodFormProps {
  breakPeriods: BreakPeriodData[];
  onChange: (periods: BreakPeriodData[]) => void;
  isOvernight: boolean;
  maxPeriods?: number;
  errors?: Record<string, string>;
}

/**
 * Tính duration của break period (phút)
 * Hỗ trợ break qua nửa đêm
 */
export function calculateBreakDuration(
  startTime: string,
  endTime: string,
  isOvernight: boolean = false,
): number {
  if (!startTime || !endTime) return 0;

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Nếu break qua nửa đêm (end < start)
  if (endMinutes < startMinutes && isOvernight) {
    endMinutes += 24 * 60;
  }

  return Math.max(0, endMinutes - startMinutes);
}

/**
 * Tính tổng thời gian nghỉ từ tất cả break periods
 */
export function calculateTotalBreakMinutes(
  breakPeriods: BreakPeriodData[],
  isOvernight: boolean = false,
): number {
  return breakPeriods.reduce((total, period) => {
    return (
      total +
      calculateBreakDuration(period.startTime, period.endTime, isOvernight)
    );
  }, 0);
}

/**
 * Component form cho break periods trong work schedule
 * Hỗ trợ add/remove break periods, time pickers, flexible toggle
 */
export function BreakPeriodForm({
  breakPeriods,
  onChange,
  isOvernight,
  maxPeriods = 5,
  errors = {},
}: BreakPeriodFormProps) {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");

  // Thêm break period mới
  const handleAddPeriod = () => {
    if (breakPeriods.length >= maxPeriods) return;

    const newPeriod: BreakPeriodData = {
      name: "",
      startTime: "12:00",
      endTime: "13:00",
      isFlexible: false,
    };

    onChange([...breakPeriods, newPeriod]);
  };

  // Xóa break period
  const handleRemovePeriod = (index: number) => {
    const newPeriods = breakPeriods.filter((_, i) => i !== index);
    onChange(newPeriods);
  };

  // Cập nhật break period
  const handleUpdatePeriod = (
    index: number,
    field: keyof BreakPeriodData,
    value: string | boolean,
  ) => {
    const newPeriods = [...breakPeriods];
    newPeriods[index] = { ...newPeriods[index], [field]: value };
    onChange(newPeriods);
  };

  // Tính tổng thời gian nghỉ
  const totalBreakMinutes = calculateTotalBreakMinutes(
    breakPeriods,
    isOvernight,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">
            {t("form.breakPeriods")}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t("form.breakPeriodsDescription")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddPeriod}
          disabled={breakPeriods.length >= maxPeriods}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t("form.addBreakPeriod")}
        </Button>
      </div>

      {/* Hiển thị thông báo khi đạt max */}
      {breakPeriods.length >= maxPeriods && (
        <p className="text-sm text-muted-foreground">
          {t("form.maxBreakPeriods")}
        </p>
      )}

      {/* Danh sách break periods */}
      {breakPeriods.map((period, index) => (
        <Card key={index} className="py-2">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">#{index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemovePeriod(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("form.removeBreakPeriod")}
              </Button>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor={`break-name-${index}`} className="text-sm">
                {t("form.breakPeriodName")}
              </Label>
              <Input
                id={`break-name-${index}`}
                placeholder={t("form.breakPeriodNamePlaceholder")}
                value={period.name}
                onChange={(e) =>
                  handleUpdatePeriod(index, "name", e.target.value)
                }
              />
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`break-start-${index}`} className="text-sm">
                  {t("form.breakPeriodStart")}
                </Label>
                <Input
                  id={`break-start-${index}`}
                  type="time"
                  value={period.startTime}
                  onChange={(e) =>
                    handleUpdatePeriod(index, "startTime", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`break-end-${index}`} className="text-sm">
                  {t("form.breakPeriodEnd")}
                </Label>
                <Input
                  id={`break-end-${index}`}
                  type="time"
                  value={period.endTime}
                  onChange={(e) =>
                    handleUpdatePeriod(index, "endTime", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Duration display */}
            <div className="text-sm text-muted-foreground">
              {calculateBreakDuration(
                period.startTime,
                period.endTime,
                isOvernight,
              )}{" "}
              {tCommon("minutes")}
            </div>

            {/* Flexible toggle */}
            <div className="flex items-center justify-between">
              <Label
                htmlFor={`break-flexible-${index}`}
                className="text-sm cursor-pointer"
              >
                {t("form.breakPeriodFlexible")}
              </Label>
              <Switch
                id={`break-flexible-${index}`}
                checked={period.isFlexible}
                onCheckedChange={(checked) =>
                  handleUpdatePeriod(index, "isFlexible", checked)
                }
              />
            </div>

            {/* Error for this period */}
            {errors[`breakPeriod_${index}`] && (
              <p className="text-sm text-destructive">
                {errors[`breakPeriod_${index}`]}
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Tổng thời gian nghỉ */}
      {breakPeriods.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/50">
          <span className="font-medium">{t("form.totalBreakTime")}</span>
          <span className="text-lg font-bold">
            {totalBreakMinutes} {tCommon("minutes")}
          </span>
        </div>
      )}

      {/* Global break errors */}
      {errors.breakPeriods && (
        <p className="text-sm text-destructive">{errors.breakPeriods}</p>
      )}
    </div>
  );
}
