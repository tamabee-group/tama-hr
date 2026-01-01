"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Coffee, Play, Square, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { BreakConfig } from "@/types/attendance-config";
import type { BreakRecord } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

interface BreakTimerProps {
  attendanceRecordId: number;
  breakConfig: BreakConfig;
  currentBreak?: BreakRecord;
  breakRecords: BreakRecord[];
  onStartBreak: () => Promise<void>;
  onEndBreak: (breakRecordId: number) => Promise<void>;
}

// ============================================
// Utilities
// ============================================

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes * 60) % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function calculateElapsedMinutes(startTime: string): number {
  const start = new Date(startTime);
  const now = new Date();
  return (now.getTime() - start.getTime()) / (1000 * 60);
}

// ============================================
// BreakTimer Component
// ============================================

export function BreakTimer({
  breakConfig,
  currentBreak,
  breakRecords,
  onStartBreak,
  onEndBreak,
}: BreakTimerProps) {
  const t = useTranslations("break");
  const tErrors = useTranslations("errors");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [elapsedMinutes, setElapsedMinutes] = React.useState(0);

  // Tính toán các giá trị cần thiết
  const isOnBreak = !!currentBreak && !currentBreak.breakEnd;
  const totalBreaksToday = breakRecords.length;
  const maxBreaksReached = totalBreaksToday >= breakConfig.maxBreaksPerDay;
  const remainingMinutes = breakConfig.maximumBreakMinutes - elapsedMinutes;
  const isOvertime = remainingMinutes < 0;
  const progressPercent = Math.min(
    (elapsedMinutes / breakConfig.maximumBreakMinutes) * 100,
    100,
  );

  // Cập nhật thời gian đã nghỉ mỗi giây khi đang nghỉ
  React.useEffect(() => {
    if (!isOnBreak || !currentBreak?.breakStart) return;

    const updateElapsed = () => {
      setElapsedMinutes(calculateElapsedMinutes(currentBreak.breakStart!));
    };

    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);

    return () => clearInterval(timer);
  }, [isOnBreak, currentBreak?.breakStart]);

  // Reset elapsed khi không còn nghỉ
  React.useEffect(() => {
    if (!isOnBreak) {
      setElapsedMinutes(0);
    }
  }, [isOnBreak]);

  // Kiểm tra nếu đang trong fixed break mode thì không hiển thị
  if (breakConfig.fixedBreakMode) {
    return null;
  }

  // Kiểm tra nếu break tracking không được bật
  if (!breakConfig.breakTrackingEnabled) {
    return null;
  }

  // Xử lý bắt đầu nghỉ
  const handleStartBreak = async () => {
    if (maxBreaksReached) {
      toast.error(t("messages.maxBreaksReached"));
      return;
    }

    try {
      setIsSubmitting(true);
      await onStartBreak();
      toast.success(t("messages.startBreakSuccess"));
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý kết thúc nghỉ
  const handleEndBreak = async () => {
    if (!currentBreak) return;

    try {
      setIsSubmitting(true);
      await onEndBreak(currentBreak.id);
      toast.success(t("messages.endBreakSuccess"));
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("title")}
          </div>
          <BreakStatusBadge isOnBreak={isOnBreak} t={t} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hiển thị thời gian đang nghỉ */}
        {isOnBreak && (
          <div className="text-center space-y-3">
            {/* Thời gian đã nghỉ */}
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                {t("elapsedTime")}
              </p>
              <p
                className={`text-3xl sm:text-4xl font-bold tabular-nums ${
                  isOvertime ? "text-red-600" : ""
                }`}
              >
                {formatDuration(elapsedMinutes)}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <Progress
                value={progressPercent}
                className={`h-2 ${isOvertime ? "[&>div]:bg-red-600" : ""}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>
                  {t("maxBreakMinutes", {
                    minutes: breakConfig.maximumBreakMinutes,
                  })}
                </span>
              </div>
            </div>

            {/* Thời gian còn lại */}
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isOvertime ? t("overtimeBy") : t("remainingTime")}
              </p>
              <p
                className={`text-lg sm:text-xl font-semibold ${
                  isOvertime ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatDuration(Math.abs(remainingMinutes))}
              </p>
            </div>

            {/* Cảnh báo vượt quá thời gian */}
            {isOvertime && (
              <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg p-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">
                  {t("warnings.exceededMax")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Số lần nghỉ trong ngày */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>
            {t("breakCount", {
              current: totalBreaksToday,
              max: breakConfig.maxBreaksPerDay,
            })}
          </span>
        </div>

        {/* Nút Start/End Break - Large tappable button cho mobile */}
        <div className="flex justify-center">
          {!isOnBreak ? (
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:max-w-xs min-h-[56px] sm:min-h-[64px] h-auto py-4 text-base sm:text-lg font-semibold touch-manipulation active:scale-[0.98] transition-transform"
              onClick={handleStartBreak}
              disabled={isSubmitting || maxBreaksReached}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
              ) : (
                <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              )}
              {t("startBreak")}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:max-w-xs min-h-[56px] sm:min-h-[64px] h-auto py-4 text-base sm:text-lg font-semibold touch-manipulation active:scale-[0.98] transition-transform bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-950 dark:hover:bg-orange-900 dark:text-orange-300"
              onClick={handleEndBreak}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
              ) : (
                <Square className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              )}
              {t("endBreak")}
            </Button>
          )}
        </div>

        {/* Thông báo đã đạt giới hạn */}
        {maxBreaksReached && !isOnBreak && (
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            {t("messages.maxBreaksReached")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// BreakStatusBadge Component
// ============================================

interface BreakStatusBadgeProps {
  isOnBreak: boolean;
  t: ReturnType<typeof useTranslations<"break">>;
}

function BreakStatusBadge({ isOnBreak, t }: BreakStatusBadgeProps) {
  if (isOnBreak) {
    return (
      <Badge variant="default" className="bg-orange-600">
        {t("status.onBreak")}
      </Badge>
    );
  }
  return <Badge variant="secondary">{t("status.notOnBreak")}</Badge>;
}
