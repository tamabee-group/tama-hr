"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LogIn,
  LogOut,
  Coffee,
  Play,
  Clock,
  Loader2,
  Calendar,
} from "lucide-react";
import { attendanceApi } from "@/lib/apis/attendance-api";
import { breakApi, type BreakSummaryResponse } from "@/lib/apis/break-api";
import { formatTime, formatDate } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { AttendanceCalendar } from "./_attendance-calendar";
import type { AttendanceRecord, BreakRecord } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

type AttendanceStep = "check_in" | "break_start" | "break_end" | "check_out";

interface TimelineEvent {
  type: AttendanceStep;
  time: string;
  label: string;
}

// ============================================
// Utilities
// ============================================

/**
 * Kiểm tra xem break record có đang active không
 * Active = có breakStart và chưa có breakEnd
 */
function isBreakActive(breakRecord: BreakRecord): boolean {
  // Phải có breakStart
  if (!breakRecord.breakStart) return false;

  // breakEnd phải là null/undefined/empty để được coi là active
  const breakEnd = breakRecord.breakEnd;
  return breakEnd === null || breakEnd === undefined || breakEnd === "";
}

// ============================================
// Main Component
// ============================================

export function EmployeeAttendancePageContent() {
  const t = useTranslations("attendance");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const [todayRecord, setTodayRecord] = React.useState<AttendanceRecord | null>(
    null,
  );
  const [breakSummary, setBreakSummary] =
    React.useState<BreakSummaryResponse | null>(null);
  const [currentBreak, setCurrentBreak] = React.useState<BreakRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());

  // Cập nhật thời gian mỗi giây
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch trạng thái hôm nay
  const fetchTodayStatus = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch attendance record
      const record = await attendanceApi.getTodayStatus();
      setTodayRecord(record);

      // Fetch break records - chỉ khi đã check-in
      if (record?.originalCheckIn) {
        try {
          const breaks = await breakApi.getTodayBreaks();
          setBreakSummary(breaks);

          // Tìm break đang active sử dụng helper function
          if (breaks?.breakRecords && breaks.breakRecords.length > 0) {
            const activeBreak = breaks.breakRecords.find(isBreakActive);
            setCurrentBreak(activeBreak || null);
          } else {
            setCurrentBreak(null);
          }
        } catch (breakError) {
          console.error("Error fetching breaks:", breakError);
          setBreakSummary(null);
          setCurrentBreak(null);
        }
      } else {
        setBreakSummary(null);
        setCurrentBreak(null);
      }
    } catch (error) {
      console.error("Error fetching today status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  // Xác định trạng thái các nút
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

    return {
      checkIn: { active: !hasCheckedIn, completed: hasCheckedIn },
      breakStart: {
        active: hasCheckedIn && !hasCheckedOut && !isOnBreak,
        completed: false, // Luôn cho phép bắt đầu break mới
      },
      breakEnd: { active: isOnBreak, completed: false },
      checkOut: {
        active: hasCheckedIn && !hasCheckedOut && !isOnBreak,
        completed: hasCheckedOut,
      },
    };
  };

  const buttonStates = getButtonStates();

  // Handlers
  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      await attendanceApi.checkIn({});
      toast.success(t("messages.checkInSuccess"));
      await fetchTodayStatus();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBreakStart = async () => {
    if (!todayRecord) return;
    try {
      setIsSubmitting(true);
      await breakApi.startBreak({ attendanceRecordId: todayRecord.id });
      toast.success(t("messages.breakStartSuccess"));
      await fetchTodayStatus();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBreakEnd = async () => {
    if (!currentBreak) return;
    try {
      setIsSubmitting(true);
      await breakApi.endBreak(currentBreak.id);
      toast.success(t("messages.breakEndSuccess"));
      await fetchTodayStatus();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      await attendanceApi.checkOut();
      toast.success(t("messages.checkOutSuccess"));
      await fetchTodayStatus();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tạo timeline events
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    if (todayRecord?.originalCheckIn) {
      events.push({
        type: "check_in",
        time: todayRecord.originalCheckIn,
        label: t("checkIn"),
      });
    }

    // Thêm break events
    if (breakSummary?.breakRecords) {
      for (const br of breakSummary.breakRecords) {
        if (br.breakStart) {
          events.push({
            type: "break_start",
            time: br.breakStart,
            label: t("breakStart"),
          });
        }
        if (br.breakEnd) {
          events.push({
            type: "break_end",
            time: br.breakEnd,
            label: t("breakEnd"),
          });
        }
      }
    }

    if (todayRecord?.originalCheckOut) {
      events.push({
        type: "check_out",
        time: todayRecord.originalCheckOut,
        label: t("checkOut"),
      });
    }

    // Sắp xếp theo thời gian - gần nhất lên trên
    events.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );

    return events;
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Desktop: 2 columns layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Check-in buttons + Timeline */}
        <div className="md:col-span-2 space-y-6">
          {/* Current Time Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold tabular-nums">
                  {currentTime.toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(currentTime.toISOString(), locale)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 4 Action Buttons */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("todayAttendance")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Check In */}
              <ActionButton
                icon={<LogIn className="h-5 w-5" />}
                label={t("checkIn")}
                time={todayRecord?.originalCheckIn}
                state={buttonStates.checkIn}
                onClick={handleCheckIn}
                isSubmitting={isSubmitting}
                variant="success"
              />

              {/* Break Start - hiển thị thời gian bắt đầu của break gần nhất đã hoàn thành */}
              <ActionButton
                icon={<Coffee className="h-5 w-5" />}
                label={t("breakStart")}
                time={
                  // Nếu đang có break active, hiển thị thời gian bắt đầu của nó
                  // Nếu không, hiển thị thời gian bắt đầu của break hoàn thành gần nhất
                  currentBreak?.breakStart ||
                  breakSummary?.breakRecords
                    ?.filter((b) => b.breakStart && b.breakEnd)
                    .sort(
                      (a, b) =>
                        new Date(b.breakStart!).getTime() -
                        new Date(a.breakStart!).getTime(),
                    )[0]?.breakStart
                }
                state={buttonStates.breakStart}
                onClick={handleBreakStart}
                isSubmitting={isSubmitting}
                variant="warning"
              />

              {/* Break End - hiển thị thời gian kết thúc của break gần nhất đã hoàn thành */}
              <ActionButton
                icon={<Play className="h-5 w-5" />}
                label={t("breakEnd")}
                time={
                  breakSummary?.breakRecords
                    ?.filter((b) => b.breakEnd)
                    .sort(
                      (a, b) =>
                        new Date(b.breakEnd!).getTime() -
                        new Date(a.breakEnd!).getTime(),
                    )[0]?.breakEnd
                }
                state={buttonStates.breakEnd}
                onClick={handleBreakEnd}
                isSubmitting={isSubmitting}
                variant="info"
              />

              {/* Check Out */}
              <ActionButton
                icon={<LogOut className="h-5 w-5" />}
                label={t("checkOut")}
                time={todayRecord?.originalCheckOut}
                state={buttonStates.checkOut}
                onClick={handleCheckOut}
                isSubmitting={isSubmitting}
                variant="destructive"
              />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("history")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={getTimelineEvents()} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Calendar */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("calendar")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceCalendar
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                hideCard
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ActionButton Component
// ============================================

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  time?: string;
  state: { active: boolean; completed: boolean };
  onClick: () => void;
  isSubmitting: boolean;
  variant: "success" | "warning" | "info" | "destructive";
}

function ActionButton({
  icon,
  label,
  time,
  state,
  onClick,
  isSubmitting,
  variant,
}: ActionButtonProps) {
  const { active, completed } = state;

  // Màu sắc theo variant
  const variantStyles = {
    success: {
      active: "bg-green-600 hover:bg-green-700 text-white",
      completed: "bg-green-100 text-green-700 border-green-300",
    },
    warning: {
      active: "bg-yellow-500 hover:bg-yellow-600 text-white",
      completed: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    info: {
      active: "bg-blue-600 hover:bg-blue-700 text-white",
      completed: "bg-blue-100 text-blue-700 border-blue-300",
    },
    destructive: {
      active: "bg-red-600 hover:bg-red-700 text-white",
      completed: "bg-red-100 text-red-700 border-red-300",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Button
      className={`w-full h-14 justify-between px-4 ${
        completed
          ? styles.completed + " border"
          : active
            ? styles.active
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }`}
      onClick={onClick}
      disabled={!active || isSubmitting}
    >
      <span className="flex items-center gap-3">
        {isSubmitting && active ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          icon
        )}
        <span className="font-medium">{label}</span>
      </span>
      {time && (
        <Badge variant="secondary" className="text-xs">
          {formatTime(time)}
        </Badge>
      )}
      {completed && !time && (
        <Badge variant="secondary" className="text-xs">
          ✓
        </Badge>
      )}
    </Button>
  );
}

// ============================================
// Timeline Component
// ============================================

interface TimelineProps {
  events: TimelineEvent[];
}

function Timeline({ events }: TimelineProps) {
  const t = useTranslations("attendance");

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {t("noRecordsToday")}
      </div>
    );
  }

  const getEventColor = (type: AttendanceStep) => {
    switch (type) {
      case "check_in":
        return "bg-green-500";
      case "break_start":
        return "bg-yellow-500";
      case "break_end":
        return "bg-blue-500";
      case "check_out":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${getEventColor(event.type)}`}
          />
          <div className="flex-1">
            <p className="text-sm font-medium">{event.label}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(event.time)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Skeleton Component
// ============================================

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-12 w-32 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="xl:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
