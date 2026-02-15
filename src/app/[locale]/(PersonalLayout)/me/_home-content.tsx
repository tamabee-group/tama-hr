"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  LogIn,
  LogOut,
  Coffee,
  Play,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { GlassCard } from "../../_components/_glass-style/_glass-card";
import { Button } from "@/components/ui/button";
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
import { ActionButton } from "./_components/_action-button";
import {
  AttendanceTimeline,
  type TimelineEvent,
} from "./_components/_attendance-timeline";
import { ScheduleReminder } from "./_components/_schedule-reminder";
import { useAuth } from "@/hooks/use-auth";
import { unifiedAttendanceApi } from "@/lib/apis/unified-attendance-api";
import { shiftApi } from "@/lib/apis/shift-api";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import {
  formatTime,
  formatDateWithDayOfWeek,
  formatDateForApi,
} from "@/lib/utils/format-date-time";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import {
  getCurrentPosition,
  isWithinAnyLocation,
  type GeoPosition,
} from "@/lib/utils/geolocation";
import type {
  UnifiedAttendanceRecord,
  BreakRecord,
  ShiftAssignment,
} from "@/types/attendance-records";
import type { AttendanceLocation } from "@/types/attendance-config";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Utilities
// ============================================

function isBreakActive(breakRecord: BreakRecord): boolean {
  if (!breakRecord.breakStart) return false;
  const breakEnd = breakRecord.breakEnd;
  return breakEnd === null || breakEnd === undefined || breakEnd === "";
}

// ============================================
// Main Component
// ============================================

export function HomeContent() {
  const t = useTranslations("portal.home");
  const tAttendance = useTranslations("attendance");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  useAuth();

  // State
  const [todayRecord, setTodayRecord] =
    React.useState<UnifiedAttendanceRecord | null>(null);
  const [currentBreak, setCurrentBreak] = React.useState<BreakRecord | null>(
    null,
  );
  const [todayShifts, setTodayShifts] = React.useState<ShiftAssignment[]>([]);
  const [nextShift, setNextShift] = React.useState<ShiftAssignment | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [submittingAction, setSubmittingAction] = React.useState<string | null>(
    null,
  );
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [showNextShiftConfirm, setShowNextShiftConfirm] = React.useState(false);
  const [requireGeoLocation, setRequireGeoLocation] = React.useState(false);
  const [activeLocations, setActiveLocations] = React.useState<
    AttendanceLocation[]
  >([]);
  const [showGeofenceWarning, setShowGeofenceWarning] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<
    (() => Promise<void>) | null
  >(null);
  const [, setPendingPosition] = React.useState<GeoPosition | null>(null);

  /**
   * Kiểm tra vị trí trước khi thực hiện action chấm công.
   * Nếu ngoài phạm vi → hiện dialog cảnh báo, user chọn tiếp tục hoặc hủy.
   */
  const checkGeofenceAndExecute = React.useCallback(
    async (
      action: (pos: GeoPosition | null) => Promise<void>,
      actionName?: string,
    ) => {
      try {
        // Bật loading ngay khi bắt đầu lấy vị trí
        setSubmittingAction(actionName || "unknown");

        // Chỉ lấy GPS khi company yêu cầu bắt buộc
        let position: GeoPosition | null = null;
        if (requireGeoLocation) {
          position = await getCurrentPosition();

          // Nếu không lấy được GPS và company yêu cầu bắt buộc
          if (!position) {
            toast.error(t("gpsRequired"));
            setSubmittingAction(null);
            return;
          }

          // Kiểm tra có nằm trong phạm vi không (chỉ khi có locations)
          if (activeLocations.length > 0) {
            const isWithin = isWithinAnyLocation(position, activeLocations);
            if (!isWithin) {
              setPendingPosition(position);
              setPendingAction(() => () => action(position));
              setShowGeofenceWarning(true);
              setSubmittingAction(null);
              return;
            }
          }
        }

        // Hiện spinner ít nhất 300ms trước khi gọi API
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Thực hiện action
        await action(position);
      } catch (error) {
        toast.error(
          getErrorMessage(
            (error as { errorCode?: string })?.errorCode,
            tErrors,
          ),
        );
        setSubmittingAction(null);
      }
    },
    [requireGeoLocation, activeLocations, t, tErrors],
  );

  /**
   * Xác nhận tiếp tục chấm công khi ngoài phạm vi
   */
  const handleGeofenceConfirm = async () => {
    if (pendingAction) {
      setSubmittingAction("geofence");
      await pendingAction();
    }
    setShowGeofenceWarning(false);
    setPendingAction(null);
    setPendingPosition(null);
  };

  /**
   * Hủy chấm công khi ngoài phạm vi
   */
  const handleGeofenceCancel = () => {
    setShowGeofenceWarning(false);
    setPendingAction(null);
    setPendingPosition(null);
  };

  // Tính số ca tiếp theo
  const getNextShiftNumber = (): number => {
    if (!todayRecord?.breakRecords) return 2;
    const autoBreakCount = todayRecord.breakRecords.filter(
      (br) =>
        br.notes?.includes("Tự động tạo giữa các ca") ||
        br.notes?.toLowerCase().includes("auto"),
    ).length;
    return autoBreakCount + 2;
  };

  // Cập nhật thời gian mỗi giây
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch trạng thái hôm nay
  const fetchTodayStatus = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch attendance + company settings + active locations song song
      const [record, attendanceConfig, locations] = await Promise.all([
        unifiedAttendanceApi.getTodayAttendance(),
        companySettingsApi.getAttendanceConfig().catch(() => null),
        unifiedAttendanceApi.getActiveLocations().catch(() => []),
      ]);

      setTodayRecord(record);
      setActiveLocations(locations);
      if (attendanceConfig) {
        setRequireGeoLocation(attendanceConfig.requireGeoLocation);
      }

      if (record?.breakRecords && record.breakRecords.length > 0) {
        const activeBreak = record.breakRecords.find(isBreakActive);
        setCurrentBreak(activeBreak || null);
      } else {
        setCurrentBreak(null);
      }

      // Fetch schedule
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const todayStr = formatDateForApi(today) || "";
      const nextWeekStr = formatDateForApi(nextWeek) || "";

      const schedules = await shiftApi.getMySchedule(todayStr, nextWeekStr);

      setTodayShifts(schedules.filter((s) => s.workDate === todayStr));

      const futureSchedules = schedules
        .filter((s) => s.workDate > todayStr)
        .sort((a, b) => a.workDate.localeCompare(b.workDate));
      setNextShift(futureSchedules[0] || null);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  // Button states
  const getButtonStates = () => {
    if (!todayRecord) {
      return {
        checkIn: { active: true, completed: false },
        breakStart: { active: false, completed: false },
        breakEnd: { active: false, completed: false },
        checkOut: { active: false, completed: false },
      };
    }

    const hasCheckedIn = !!todayRecord.originalCheckIn;
    const hasCheckedOut = !!todayRecord.originalCheckOut;
    const isOnBreak = !!currentBreak;
    const canCheckInAgain = hasCheckedIn && hasCheckedOut;

    return {
      checkIn: { active: !hasCheckedIn || canCheckInAgain, completed: false },
      breakStart: {
        active: hasCheckedIn && !hasCheckedOut && !isOnBreak,
        completed: false,
      },
      breakEnd: { active: isOnBreak, completed: false },
      checkOut: {
        active: hasCheckedIn && !hasCheckedOut && !isOnBreak,
        completed: false,
      },
    };
  };

  const buttonStates = getButtonStates();

  // Handlers
  const handleCheckIn = async () => {
    if (todayRecord?.originalCheckOut) {
      setShowNextShiftConfirm(true);
      return;
    }
    await checkGeofenceAndExecute(async (position) => {
      try {
        await unifiedAttendanceApi.checkIn({
          latitude: position?.latitude,
          longitude: position?.longitude,
        });
        toast.success(t("checkInSuccess"));
        await fetchTodayStatus();
      } catch (error) {
        toast.error(
          getErrorMessage(
            (error as { errorCode?: string })?.errorCode,
            tErrors,
          ),
        );
      } finally {
        setSubmittingAction(null);
      }
    }, "checkIn");
  };

  const performCheckIn = async () => {
    await checkGeofenceAndExecute(async (position) => {
      try {
        await unifiedAttendanceApi.checkIn({
          latitude: position?.latitude,
          longitude: position?.longitude,
        });
        toast.success(t("checkInSuccess"));
        await fetchTodayStatus();
      } catch (error) {
        toast.error(
          getErrorMessage(
            (error as { errorCode?: string })?.errorCode,
            tErrors,
          ),
        );
      } finally {
        setSubmittingAction(null);
        setShowNextShiftConfirm(false);
      }
    }, "checkIn");
  };

  const handleBreakStart = async () => {
    await checkGeofenceAndExecute(async (position) => {
      try {
        await unifiedAttendanceApi.startBreak({
          latitude: position?.latitude,
          longitude: position?.longitude,
        });
        toast.success(t("breakStartSuccess"));
        await fetchTodayStatus();
      } catch (error) {
        toast.error(
          getErrorMessage(
            (error as { errorCode?: string })?.errorCode,
            tErrors,
          ),
        );
      } finally {
        setSubmittingAction(null);
      }
    }, "breakStart");
  };

  const handleBreakEnd = async () => {
    if (!currentBreak) return;
    await checkGeofenceAndExecute(async (position) => {
      try {
        await unifiedAttendanceApi.endBreak(currentBreak.id, {
          latitude: position?.latitude,
          longitude: position?.longitude,
        });
        toast.success(t("breakEndSuccess"));
        await fetchTodayStatus();
      } catch (error) {
        toast.error(
          getErrorMessage(
            (error as { errorCode?: string })?.errorCode,
            tErrors,
          ),
        );
      } finally {
        setSubmittingAction(null);
      }
    }, "breakEnd");
  };

  const handleCheckOut = async () => {
    await checkGeofenceAndExecute(async (position) => {
      try {
        await unifiedAttendanceApi.checkOut({
          latitude: position?.latitude,
          longitude: position?.longitude,
        });
        toast.success(t("checkOutSuccess"));
        await fetchTodayStatus();
      } catch (error) {
        toast.error(
          getErrorMessage(
            (error as { errorCode?: string })?.errorCode,
            tErrors,
          ),
        );
      } finally {
        setSubmittingAction(null);
      }
    }, "checkOut");
  };

  // Timeline events
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    if (todayRecord?.originalCheckIn) {
      events.push({
        type: "check_in",
        time: todayRecord.roundedCheckIn || todayRecord.originalCheckIn,
        label: t("checkIn"),
      });
    }

    if (todayRecord?.breakRecords) {
      const showNumber = todayRecord.breakRecords.length > 1;
      for (const br of todayRecord.breakRecords) {
        const suffix = showNumber ? ` #${br.breakNumber}` : "";
        if (br.breakStart) {
          events.push({
            type: "break_start",
            time: br.breakStart,
            label: t("breakStart") + suffix,
          });
        }
        if (br.breakEnd) {
          events.push({
            type: "break_end",
            time: br.breakEnd,
            label: t("breakEnd") + suffix,
          });
        }
      }
    }

    if (todayRecord?.originalCheckOut) {
      events.push({
        type: "check_out",
        time: todayRecord.roundedCheckOut || todayRecord.originalCheckOut,
        label: t("checkOut"),
      });
    }

    return events.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
  };

  // Break helpers
  const getLastBreakStart = () =>
    currentBreak?.breakStart ||
    todayRecord?.breakRecords
      ?.filter((b) => b.breakStart && b.breakEnd)
      .sort(
        (a, b) =>
          new Date(b.breakStart!).getTime() - new Date(a.breakStart!).getTime(),
      )[0]?.breakStart;

  const getLastBreakEnd = () =>
    todayRecord?.breakRecords
      ?.filter((b) => b.breakEnd)
      .sort(
        (a, b) =>
          new Date(b.breakEnd!).getTime() - new Date(a.breakEnd!).getTime(),
      )[0]?.breakEnd;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Schedule Reminder */}
      <div className="max-w-md md:max-w-5xl w-full mx-auto mb-6">
        <ScheduleReminder
          todayShifts={todayShifts}
          nextDayShift={nextShift}
          locale={locale}
          labels={{
            todayShifts: t("schedule.todayShifts"),
            nextShiftLabel: t("schedule.nextShiftLabel"),
            tomorrow: t("schedule.tomorrow"),
            noShiftToday: t("schedule.noShiftToday"),
            noShiftScheduled: t("schedule.noShiftScheduled"),
            completed: t("schedule.completed"),
            current: t("schedule.current"),
            upcoming: t("schedule.upcoming"),
            viewDetail: t("schedule.viewDetail"),
          }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-md md:max-w-5xl w-full mx-auto grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Current Time */}
          <GlassCard variant="highlighted" className="p-6">
            <div className="flex flex-col justify-center items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <p className="text-4xl font-bold tabular-nums text-gray-900 dark:text-white">
                {currentTime.toLocaleTimeString(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
              <p className="text-md text-gray-500 dark:text-gray-400">
                {formatDateWithDayOfWeek(currentTime.toISOString(), locale)}
              </p>
            </div>
          </GlassCard>

          {/* Action Buttons */}
          <GlassCard className="p-4">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
              <Clock className="h-4 w-4 text-primary" />
              {t("todayAttendance")}
            </h3>
            <div className="space-y-3">
              <ActionButton
                icon={<LogIn className="h-5 w-5" />}
                label={t("checkIn")}
                time={
                  todayRecord?.roundedCheckIn || todayRecord?.originalCheckIn
                }
                state={buttonStates.checkIn}
                onClick={handleCheckIn}
                isSubmitting={submittingAction === "checkIn"}
                isAnySubmitting={!!submittingAction}
                variant="success"
              />
              <ActionButton
                icon={<Coffee className="h-5 w-5" />}
                label={t("breakStart")}
                time={getLastBreakStart()}
                state={buttonStates.breakStart}
                onClick={handleBreakStart}
                isSubmitting={submittingAction === "breakStart"}
                isAnySubmitting={!!submittingAction}
                variant="warning"
              />
              <ActionButton
                icon={<Play className="h-5 w-5" />}
                label={t("breakEnd")}
                time={getLastBreakEnd()}
                state={buttonStates.breakEnd}
                onClick={handleBreakEnd}
                isSubmitting={submittingAction === "breakEnd"}
                isAnySubmitting={!!submittingAction}
                variant="info"
              />
              <ActionButton
                icon={<LogOut className="h-5 w-5" />}
                label={t("checkOut")}
                time={
                  todayRecord?.roundedCheckOut || todayRecord?.originalCheckOut
                }
                state={buttonStates.checkOut}
                onClick={handleCheckOut}
                isSubmitting={submittingAction === "checkOut"}
                isAnySubmitting={!!submittingAction}
                variant="destructive"
              />
            </div>
          </GlassCard>
        </div>

        {/* Timeline */}
        <GlassCard className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {t("history")}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/${locale}/me/attendance`)}
              className="h-8 gap-1.5 text-xs"
            >
              {tAttendance("viewDetail")}
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
          <AttendanceTimeline
            events={getTimelineEvents()}
            emptyMessage={t("noRecordsToday")}
          />
        </GlassCard>
      </div>

      {/* Next Shift Confirmation Dialog */}
      <AlertDialog
        open={showNextShiftConfirm}
        onOpenChange={setShowNextShiftConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("nextShift.title", { shiftNumber: getNextShiftNumber() })}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2" asChild>
              <div>
                <p>
                  {t("nextShift.description", {
                    time: todayRecord?.originalCheckOut
                      ? formatTime(todayRecord.originalCheckOut)
                      : "",
                  })}
                </p>
                <p className="font-medium text-orange-600">
                  {t("nextShift.warning")}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!submittingAction}>
              {t("nextShift.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={performCheckIn}
              disabled={!!submittingAction}
              className="bg-green-600 hover:bg-green-700"
            >
              {submittingAction === "checkIn" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("nextShift.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Geofence Warning Dialog */}
      <AlertDialog
        open={showGeofenceWarning}
        onOpenChange={(open) => {
          if (!open) handleGeofenceCancel();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("outsideGeofence.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("outsideGeofence.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleGeofenceCancel}>
              {t("outsideGeofence.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGeofenceConfirm}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {t("outsideGeofence.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
