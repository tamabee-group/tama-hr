"use client";

import Link from "next/link";
import {
  Calendar,
  CalendarX,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { Button } from "@/components/ui/button";
import {
  formatDateWithDayOfWeek,
  formatTime,
} from "@/lib/utils/format-date-time";
import { cn } from "@/lib/utils";
import type { ShiftAssignment } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface ScheduleReminderProps {
  todayShifts: ShiftAssignment[];
  nextDayShift: ShiftAssignment | null;
  locale: SupportedLocale;
  labels: {
    todayShifts: string;
    nextShiftLabel: string;
    tomorrow: string;
    noShiftToday: string;
    noShiftScheduled: string;
    completed: string;
    current: string;
    upcoming: string;
    viewDetail: string;
  };
}

type ShiftStatus = "completed" | "current" | "upcoming";

// ============================================
// Helpers
// ============================================

// Lấy trạng thái của ca dựa trên thời gian hiện tại
const getShiftStatus = (shift: ShiftAssignment): ShiftStatus => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const startTime = (
    shift.shiftStartTime ||
    shift.shiftTemplate?.startTime ||
    ""
  ).substring(0, 5);
  const endTime = (
    shift.shiftEndTime ||
    shift.shiftTemplate?.endTime ||
    ""
  ).substring(0, 5);

  // Ca qua đêm (overnight): endTime < startTime (vd: 18:30 - 02:00)
  const isOvernightShift = endTime < startTime;

  if (isOvernightShift) {
    // Ca qua đêm: đang trong ca nếu currentTime >= startTime HOẶC currentTime <= endTime
    if (currentTime >= startTime || currentTime <= endTime) {
      return "current";
    }
    // Ca qua đêm đã kết thúc: currentTime > endTime VÀ currentTime < startTime
    if (currentTime > endTime && currentTime < startTime) {
      return "completed";
    }
    return "upcoming";
  }

  // Ca bình thường (trong ngày)
  if (currentTime > endTime) return "completed";
  if (currentTime >= startTime && currentTime <= endTime) return "current";
  return "upcoming";
};

// Sắp xếp ca theo giờ bắt đầu
const sortShiftsByStartTime = (
  shifts: ShiftAssignment[],
): ShiftAssignment[] => {
  return [...shifts].sort((a, b) => {
    const startA = a.shiftStartTime || a.shiftTemplate?.startTime || "";
    const startB = b.shiftStartTime || b.shiftTemplate?.startTime || "";
    return startA.localeCompare(startB);
  });
};

// ============================================
// Sub Components
// ============================================

interface ShiftItemProps {
  shift: ShiftAssignment;
  status: ShiftStatus;
  statusLabel: string;
}

function ShiftItem({ shift, status, statusLabel }: ShiftItemProps) {
  const shiftName = shift.shiftName || shift.shiftTemplate?.name || "";
  const startTime = formatTime(
    shift.shiftStartTime || shift.shiftTemplate?.startTime,
  );
  const endTime = formatTime(
    shift.shiftEndTime || shift.shiftTemplate?.endTime,
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between py-1.5 px-2 rounded-md text-sm",
        status === "completed" && "bg-gray-100 dark:bg-gray-800 opacity-60",
        status === "current" && "bg-primary/10 border border-primary/30",
        status === "upcoming" && "bg-gray-50 dark:bg-gray-800/50",
      )}
    >
      <div className="flex items-center gap-2">
        {status === "completed" && (
          <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
        )}
        {status === "current" && (
          <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
        )}
        {status === "upcoming" && (
          <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
        )}
        <span
          className={cn(
            "font-medium",
            status === "completed" && "text-gray-500 line-through",
            status === "current" && "text-primary",
            status === "upcoming" && "text-gray-700 dark:text-gray-300",
          )}
        >
          {shiftName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {status === "current" && (
          <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded">
            {statusLabel}
          </span>
        )}
        <span
          className={cn(
            "tabular-nums",
            status === "completed" && "text-gray-400",
            status === "current" && "text-primary font-medium",
            status === "upcoming" && "text-gray-600 dark:text-gray-400",
          )}
        >
          {startTime} - {endTime}
        </span>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ScheduleReminder({
  todayShifts,
  nextDayShift,
  locale,
  labels,
}: ScheduleReminderProps) {
  // Format ngày cho next shift
  const formatNextShiftDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === tomorrow.toDateString()) {
      return labels.tomorrow;
    }
    return formatDateWithDayOfWeek(dateStr, locale);
  };

  // Không có ca nào
  if (todayShifts.length === 0 && !nextDayShift) {
    return (
      <GlassCard className="p-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/50">
            <CalendarX className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            {labels.noShiftScheduled}
          </p>
        </div>
      </GlassCard>
    );
  }

  const sortedTodayShifts = sortShiftsByStartTime(todayShifts);

  return (
    <GlassCard className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3 min-w-0">
          {/* Ca hôm nay */}
          {sortedTodayShifts.length > 0 && (
            <div>
              <p className="flex gap-3 items-center text-sm font-medium text-gray-900 dark:text-white mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                {labels.todayShifts}
              </p>
              <div className="space-y-1.5">
                {sortedTodayShifts.map((shift) => {
                  const status = getShiftStatus(shift);
                  const statusLabel =
                    status === "completed"
                      ? labels.completed
                      : status === "current"
                        ? labels.current
                        : labels.upcoming;
                  return (
                    <ShiftItem
                      key={shift.id}
                      shift={shift}
                      status={status}
                      statusLabel={statusLabel}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Không có ca hôm nay */}
          {sortedTodayShifts.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {labels.noShiftToday}
            </p>
          )}

          {/* Ca ngày mai */}
          {nextDayShift && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {labels.nextShiftLabel}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 gap-1 text-xs text-primary hover:text-primary"
                >
                  <Link href={`/${locale}/me/schedule`}>
                    {labels.viewDetail}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {formatNextShiftDate(nextDayShift.workDate)}:{" "}
                {nextDayShift.shiftName || nextDayShift.shiftTemplate?.name}{" "}
                <span className="font-medium tabular-nums">
                  (
                  {formatTime(
                    nextDayShift.shiftStartTime ||
                      nextDayShift.shiftTemplate?.startTime,
                  )}{" "}
                  -{" "}
                  {formatTime(
                    nextDayShift.shiftEndTime ||
                      nextDayShift.shiftTemplate?.endTime,
                  )}
                  )
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
