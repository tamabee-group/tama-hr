"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  LogIn,
  LogOut,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { attendanceApi } from "@/lib/apis/attendance-api";
import { formatDateTime } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { BreakTimer } from "./_break-timer";
import type { AttendanceRecord, BreakRecord } from "@/types/attendance-records";
import type { BreakConfig } from "@/types/attendance-config";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface CheckInSectionProps {
  todayRecord: AttendanceRecord | null;
  isLoading: boolean;
  onSuccess: () => void;
  // Break-related props (optional để backward compatible)
  breakConfig?: BreakConfig;
  breakRecords?: BreakRecord[];
  currentBreak?: BreakRecord;
  onStartBreak?: () => Promise<void>;
  onEndBreak?: (breakRecordId: number) => Promise<void>;
  onBreakSuccess?: () => void;
}

type CheckInStatus = "not_checked_in" | "checked_in" | "checked_out";

interface LocationState {
  status: "idle" | "requesting" | "granted" | "denied" | "error";
  latitude?: number;
  longitude?: number;
  error?: string;
}

// ============================================
// Utilities
// ============================================

function getCheckInStatus(record: AttendanceRecord | null): CheckInStatus {
  if (!record) return "not_checked_in";
  if (record.originalCheckOut) return "checked_out";
  if (record.originalCheckIn) return "checked_in";
  return "not_checked_in";
}

function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// ============================================
// CheckInSection Component
// ============================================

export function CheckInSection({
  todayRecord,
  isLoading,
  onSuccess,
  breakConfig,
  breakRecords = [],
  currentBreak,
  onStartBreak,
  onEndBreak,
  onBreakSuccess,
}: CheckInSectionProps) {
  const t = useTranslations("attendance");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [location, setLocation] = React.useState<LocationState>({
    status: "idle",
  });

  const status = getCheckInStatus(todayRecord);

  // Kiểm tra xem có nên hiển thị BreakTimer không
  const shouldShowBreakTimer =
    status === "checked_in" &&
    breakConfig &&
    breakConfig.breakEnabled &&
    breakConfig.breakTrackingEnabled &&
    !breakConfig.fixedBreakMode &&
    todayRecord &&
    onStartBreak &&
    onEndBreak;

  // Cập nhật thời gian hiện tại mỗi giây
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Yêu cầu quyền vị trí
  const requestLocation = React.useCallback(async (): Promise<{
    latitude?: number;
    longitude?: number;
  }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocation({ status: "error", error: "Geolocation not supported" });
        resolve({});
        return;
      }

      setLocation({ status: "requesting" });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ status: "granted", latitude, longitude });
          resolve({ latitude, longitude });
        },
        (error) => {
          setLocation({ status: "denied", error: error.message });
          resolve({});
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }, []);

  // Xử lý check-in
  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);

      // Lấy vị trí (optional)
      const { latitude, longitude } = await requestLocation();

      await attendanceApi.checkIn({
        latitude,
        longitude,
      });

      toast.success(t("messages.checkInSuccess"));
      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý check-out
  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      await attendanceApi.checkOut();
      toast.success(t("messages.checkOutSuccess"));
      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính thời gian làm việc hiện tại
  const calculateWorkingTime = (): string => {
    if (!todayRecord?.originalCheckIn) return "0h 0m";

    const checkInTime = new Date(todayRecord.originalCheckIn);
    const endTime = todayRecord.originalCheckOut
      ? new Date(todayRecord.originalCheckOut)
      : currentTime;

    const diffMinutes = Math.floor(
      (endTime.getTime() - checkInTime.getTime()) / (1000 * 60),
    );
    return formatMinutesToHours(Math.max(0, diffMinutes));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("todayAttendance")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Thời gian hiện tại - responsive font size */}
          <div className="text-center">
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums">
              {currentTime.toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {currentTime.toLocaleDateString(locale, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Trạng thái hiện tại */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {t("currentStatus")}:
            </span>
            <StatusBadge status={status} t={t} />
          </div>

          {/* Check-in/out button - Large tappable button cho mobile (min 44px height) */}
          <div className="flex justify-center px-2 sm:px-0">
            {status === "not_checked_in" && (
              <Button
                size="lg"
                className="w-full sm:max-w-xs min-h-[56px] sm:min-h-[64px] h-auto py-4 text-base sm:text-lg font-semibold touch-manipulation active:scale-[0.98] transition-transform"
                onClick={handleCheckIn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
                ) : (
                  <LogIn className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                )}
                {t("checkIn")}
              </Button>
            )}

            {status === "checked_in" && (
              <Button
                size="lg"
                variant="destructive"
                className="w-full sm:max-w-xs min-h-[56px] sm:min-h-[64px] h-auto py-4 text-base sm:text-lg font-semibold touch-manipulation active:scale-[0.98] transition-transform"
                onClick={handleCheckOut}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                )}
                {t("checkOut")}
              </Button>
            )}

            {status === "checked_out" && (
              <div className="text-center text-muted-foreground py-4">
                <p className="text-sm sm:text-base">{t("status.checkedOut")}</p>
                <p className="text-xs sm:text-sm mt-1">
                  {t("workingHours")}: {calculateWorkingTime()}
                </p>
              </div>
            )}
          </div>

          {/* Thông tin chấm công - Simplified layout cho mobile */}
          {todayRecord && (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center bg-muted/50 rounded-lg p-3 sm:p-4">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("table.checkInTime")}
                </p>
                <p className="text-sm sm:text-base font-medium">
                  {todayRecord.originalCheckIn
                    ? formatDateTime(todayRecord.originalCheckIn, locale)
                    : "-"}
                </p>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("table.checkOutTime")}
                </p>
                <p className="text-sm sm:text-base font-medium">
                  {todayRecord.originalCheckOut
                    ? formatDateTime(todayRecord.originalCheckOut, locale)
                    : "-"}
                </p>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("workingHours")}
                </p>
                <p className="text-sm sm:text-base font-medium">
                  {calculateWorkingTime()}
                </p>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("overtime")}
                </p>
                <p className="text-sm sm:text-base font-medium">
                  {formatMinutesToHours(todayRecord.overtimeMinutes || 0)}
                </p>
              </div>
            </div>
          )}

          {/* Location status - Compact cho mobile */}
          {location.status === "denied" && (
            <Alert variant="destructive" className="py-2 sm:py-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">
                {t("messages.locationRequired")}
              </AlertDescription>
            </Alert>
          )}

          {location.status === "granted" && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">
                {location.latitude?.toFixed(4)},{" "}
                {location.longitude?.toFixed(4)}
              </span>
            </div>
          )}

          {/* Late/Early warning - Responsive badges */}
          {todayRecord &&
            (todayRecord.lateMinutes > 0 ||
              todayRecord.earlyLeaveMinutes > 0) && (
              <div className="flex flex-wrap justify-center gap-2">
                {todayRecord.lateMinutes > 0 && (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-600 text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1"
                  >
                    {t("lateMinutes")}: {todayRecord.lateMinutes}{" "}
                    {t("common.minutes") || "phút"}
                  </Badge>
                )}
                {todayRecord.earlyLeaveMinutes > 0 && (
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-600 text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1"
                  >
                    {t("earlyLeaveMinutes")}: {todayRecord.earlyLeaveMinutes}{" "}
                    {t("common.minutes") || "phút"}
                  </Badge>
                )}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Break Timer - Hiển thị sau khi check-in */}
      {shouldShowBreakTimer && (
        <BreakTimer
          attendanceRecordId={todayRecord!.id}
          breakConfig={breakConfig!}
          currentBreak={currentBreak}
          breakRecords={breakRecords}
          onStartBreak={async () => {
            await onStartBreak!();
            onBreakSuccess?.();
          }}
          onEndBreak={async (breakRecordId) => {
            await onEndBreak!(breakRecordId);
            onBreakSuccess?.();
          }}
        />
      )}
    </>
  );
}

// ============================================
// StatusBadge Component
// ============================================

interface StatusBadgeProps {
  status: CheckInStatus;
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function StatusBadge({ status, t }: StatusBadgeProps) {
  switch (status) {
    case "not_checked_in":
      return <Badge variant="secondary">{t("status.notCheckedIn")}</Badge>;
    case "checked_in":
      return (
        <Badge variant="default" className="bg-green-600">
          {t("status.working")}
        </Badge>
      );
    case "checked_out":
      return <Badge variant="outline">{t("status.checkedOut")}</Badge>;
    default:
      return null;
  }
}
