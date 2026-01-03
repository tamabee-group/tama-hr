"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Clock,
  LogIn,
  LogOut,
  Timer,
  AlertTriangle,
  Coffee,
  FileEdit,
  Moon,
  TrendingUp,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Edit,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AttendanceStatusBadge } from "./_status-badge";
import {
  formatDate,
  formatTime,
  formatMinutesToTime,
} from "@/lib/utils/format-date";
import type { UnifiedAttendanceRecord } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

export type AttendanceDetailMode = "employee" | "manager";

interface AttendanceDayDetailProps {
  date: string;
  record: UnifiedAttendanceRecord | null;
  isLoading: boolean;
  /** Mode: employee = yêu cầu điều chỉnh, manager = chỉnh sửa trực tiếp */
  mode?: AttendanceDetailMode;
  /** Callback khi click nút điều chỉnh/chỉnh sửa */
  onAction: () => void;
  hasPendingRequest?: boolean;
  /** Tên nhân viên (chỉ hiển thị ở mode manager) */
  employeeName?: string;
  /** Navigation props */
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  isToday?: boolean;
}

// Navigation Header - extracted outside to avoid creating during render
interface NavigationHeaderProps {
  date: string;
  locale: SupportedLocale;
  isToday: boolean;
  employeeName?: string;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  todayLabel: string;
}

function NavigationHeader({
  date,
  locale,
  isToday,
  employeeName,
  onPreviousDay,
  onNextDay,
  canGoPrevious,
  canGoNext,
  todayLabel,
}: NavigationHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
      {onPreviousDay ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousDay}
          disabled={!canGoPrevious}
          className="h-8 w-8 touch-manipulation"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      ) : (
        <div className="w-8" />
      )}

      <div className="flex-1 text-center">
        {employeeName && (
          <p className="text-sm text-muted-foreground">{employeeName}</p>
        )}
        <p className="font-semibold">{formatDate(date, locale)}</p>
        {isToday && (
          <p className="text-xs text-muted-foreground">{todayLabel}</p>
        )}
      </div>

      {onNextDay ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextDay}
          disabled={!canGoNext}
          className="h-8 w-8 touch-manipulation"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
}

// ============================================
// AttendanceDayDetail Component
// ============================================

export function AttendanceDayDetail({
  date,
  record,
  isLoading,
  mode = "employee",
  onAction,
  hasPendingRequest = false,
  employeeName,
  onPreviousDay,
  onNextDay,
  canGoPrevious = true,
  canGoNext = true,
  isToday = false,
}: AttendanceDayDetailProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const isManager = mode === "manager";
  const actionLabel = isManager ? t("edit") : t("requestAdjustment");
  const ActionIcon = isManager ? Edit : FileEdit;

  // Navigation header props
  const navHeaderProps: NavigationHeaderProps = {
    date,
    locale,
    isToday,
    employeeName,
    onPreviousDay,
    onNextDay,
    canGoPrevious,
    canGoNext,
    todayLabel: tCommon("today"),
  };

  if (isLoading) {
    return <DetailSkeleton showNavigation={!!onPreviousDay || !!onNextDay} />;
  }

  if (!record) {
    return (
      <Card>
        <CardContent>
          {/* Navigation header */}
          {(onPreviousDay || onNextDay) && (
            <NavigationHeader {...navHeaderProps} />
          )}

          {/* Empty state */}
          <div className="p-6">
            {!(onPreviousDay || onNextDay) && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">
                    {formatDate(date, locale)}
                  </span>
                </div>
              </div>
            )}

            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{t("messages.noRecords")}</p>
            </div>

            <div className="flex flex-col items-center gap-2 mt-6">
              <Button
                onClick={onAction}
                disabled={!isManager && hasPendingRequest}
              >
                <ActionIcon className="h-4 w-4 mr-2" />
                {actionLabel}
              </Button>
              {!isManager && hasPendingRequest && (
                <p className="text-sm text-muted-foreground">
                  {t("adjustment.hasPendingRequest")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Navigation header hoặc simple header */}
        {onPreviousDay || onNextDay ? (
          <NavigationHeader {...navHeaderProps} />
        ) : (
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                {employeeName && (
                  <p className="text-sm text-muted-foreground">
                    {employeeName}
                  </p>
                )}
                <span className="font-semibold">
                  {formatDate(date, locale)}
                </span>
              </div>
            </div>
            <AttendanceStatusBadge status={record.status} />
          </div>
        )}

        {/* Status badge - hiển thị riêng khi có navigation */}
        {(onPreviousDay || onNextDay) && (
          <div className="flex justify-end px-4 pt-3">
            <AttendanceStatusBadge status={record.status} />
          </div>
        )}

        {/* Check-in/out - Modern card style */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Check-in */}
            <div className="rounded-lg border bg-green-50/50 dark:bg-green-950/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/50">
                  <LogIn className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {t("checkIn")}
                </span>
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {record.originalCheckIn
                  ? formatTime(record.originalCheckIn)
                  : "-"}
              </p>
              {record.roundedCheckIn &&
                record.originalCheckIn !== record.roundedCheckIn && (
                  <p className="text-xs text-muted-foreground mt-1">
                    → {formatTime(record.roundedCheckIn)}
                  </p>
                )}
              {record.lateMinutes > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    {t("table.lateMinutes")}:{" "}
                    {formatMinutesToTime(record.lateMinutes, { locale })}
                  </span>
                </div>
              )}
            </div>

            {/* Check-out */}
            <div className="rounded-lg border bg-red-50/50 dark:bg-red-950/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/50">
                  <LogOut className="h-3.5 w-3.5 text-red-600" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {t("checkOut")}
                </span>
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {record.originalCheckOut
                  ? formatTime(record.originalCheckOut)
                  : "-"}
              </p>
              {record.roundedCheckOut &&
                record.originalCheckOut !== record.roundedCheckOut && (
                  <p className="text-xs text-muted-foreground mt-1">
                    → {formatTime(record.roundedCheckOut)}
                  </p>
                )}
              {record.earlyLeaveMinutes > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    {t("table.earlyLeaveMinutes")}:{" "}
                    {formatMinutesToTime(record.earlyLeaveMinutes, { locale })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats - Clean grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard
              icon={<Briefcase className="h-4 w-4" />}
              label={t("workingHours")}
              value={formatMinutesToTime(record.workingMinutes, { locale })}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label={t("overtime")}
              value={formatMinutesToTime(record.overtimeMinutes, {
                zeroAsEmpty: true,
                locale,
              })}
              valueColor={
                record.overtimeMinutes > 0 ? "text-blue-600" : undefined
              }
            />
            <StatCard
              icon={<Coffee className="h-4 w-4" />}
              label={t("breakTime")}
              value={formatMinutesToTime(record.totalBreakMinutes, { locale })}
            />
            <StatCard
              icon={<Timer className="h-4 w-4" />}
              label={t("netWorkingHours")}
              value={formatMinutesToTime(record.netWorkingMinutes, { locale })}
              valueColor={
                record.netWorkingMinutes < 0 ? "text-red-600" : "text-green-600"
              }
            />
          </div>
        </div>

        {/* Night hours */}
        {(record.nightMinutes > 0 || record.nightOvertimeMinutes > 0) && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={<Moon className="h-4 w-4" />}
                label={t("table.nightHours")}
                value={formatMinutesToTime(record.nightMinutes, { locale })}
                valueColor="text-indigo-600"
                variant="dark"
              />
              <StatCard
                icon={<Moon className="h-4 w-4" />}
                label={t("table.nightOvertimeHours")}
                value={formatMinutesToTime(record.nightOvertimeMinutes, {
                  locale,
                })}
                valueColor="text-purple-600"
                variant="dark"
              />
            </div>
          </div>
        )}

        {/* Break compliance */}
        {record.totalBreakMinutes > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <span className="text-sm text-muted-foreground">
              {t("breakStatus")}
            </span>
            {record.breakCompliant ? (
              <Badge
                variant="outline"
                className="text-green-600 border-green-300 bg-green-50"
              >
                {t("breakCompliant")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-300 bg-orange-50"
              >
                {t("breakNonCompliant")}
              </Badge>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-muted/20">
          {!isManager && hasPendingRequest && (
            <span className="text-sm text-muted-foreground mr-2">
              {t("adjustment.hasPendingRequest")}
            </span>
          )}
          <Button
            variant={isManager ? "default" : "outline"}
            onClick={onAction}
            disabled={!isManager && hasPendingRequest}
          >
            <ActionIcon className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// StatCard Component
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  variant?: "default" | "dark";
}

function StatCard({
  icon,
  label,
  value,
  valueColor,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        variant === "dark"
          ? "bg-slate-50 dark:bg-slate-900/50"
          : "bg-background"
      }`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-lg font-semibold tabular-nums ${valueColor || ""}`}>
        {value}
      </p>
    </div>
  );
}

// ============================================
// Skeleton
// ============================================

function DetailSkeleton({
  showNavigation = false,
}: {
  showNavigation?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        {showNavigation ? (
          <div className="flex items-center justify-between p-4 border-b">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 border-b">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
        )}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
