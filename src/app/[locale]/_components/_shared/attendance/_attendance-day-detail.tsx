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
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AttendanceStatusBadge } from "../display/_status-badge";
import {
  formatDateWithDayOfWeek,
  formatTime,
  formatMinutesToTime,
} from "@/lib/utils/format-date-time";
import type {
  UnifiedAttendanceRecord,
  BreakRecord,
} from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

export type AttendanceDetailMode = "employee" | "manager";

interface AttendanceDayDetailProps {
  date: string;
  record: UnifiedAttendanceRecord | null;
  isLoading: boolean;
  mode?: AttendanceDetailMode;
  onAction: () => void;
  hasPendingRequest?: boolean;
  employeeName?: string;
  breakRecords?: BreakRecord[];
  minimumBreakRequired?: number;
  maxBreaksPerDay?: number;
  hideBreakTimeline?: boolean;
  BreakTimelineComponent?: React.ComponentType<{
    breakRecords: BreakRecord[];
    totalBreakMinutes: number;
    minimumRequired: number;
    maxBreaksPerDay: number;
    isCompliant: boolean;
  }>;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  isToday?: boolean;
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
  breakRecords = [],
  minimumBreakRequired = 0,
  maxBreaksPerDay = 3,
  hideBreakTimeline = false,
  BreakTimelineComponent,
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

  // Employee mode: dùng Glass style
  if (!isManager) {
    return (
      <GlassAttendanceDetailEmployee
        date={date}
        record={record}
        isLoading={isLoading}
        hasPendingRequest={hasPendingRequest}
        onAction={onAction}
        onPreviousDay={onPreviousDay}
        onNextDay={onNextDay}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isToday={isToday}
        t={t}
        tCommon={tCommon}
        locale={locale}
      />
    );
  }

  // Manager mode: giữ nguyên style cũ
  return (
    <ManagerAttendanceDetail
      date={date}
      record={record}
      isLoading={isLoading}
      onAction={onAction}
      employeeName={employeeName}
      breakRecords={breakRecords}
      minimumBreakRequired={minimumBreakRequired}
      maxBreaksPerDay={maxBreaksPerDay}
      hideBreakTimeline={hideBreakTimeline}
      BreakTimelineComponent={BreakTimelineComponent}
      onPreviousDay={onPreviousDay}
      onNextDay={onNextDay}
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      isToday={isToday}
      t={t}
      tCommon={tCommon}
      locale={locale}
    />
  );
}

// ============================================
// Glass Style for Employee Mode
// ============================================

interface GlassEmployeeProps {
  date: string;
  record: UnifiedAttendanceRecord | null;
  isLoading: boolean;
  hasPendingRequest: boolean;
  onAction: () => void;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isToday: boolean;
  t: ReturnType<typeof useTranslations<"attendance">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
  locale: SupportedLocale;
}

function GlassAttendanceDetailEmployee({
  date,
  record,
  isLoading,
  hasPendingRequest,
  onAction,
  onPreviousDay,
  onNextDay,
  canGoPrevious,
  canGoNext,
  isToday,
  t,
  tCommon,
  locale,
}: GlassEmployeeProps) {
  if (isLoading) {
    return <GlassDetailSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
      {/* Navigation Header */}
      <GlassCard className="p-3 lg:p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={onPreviousDay}
            disabled={!canGoPrevious}
            className="h-10 w-10 rounded-full cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-center">
            <p className="text-lg lg:text-xl font-semibold">
              {formatDateWithDayOfWeek(date, locale)}
            </p>
            {isToday && (
              <Badge variant="secondary" className="mt-1">
                {tCommon("today")}
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={onNextDay}
            disabled={!canGoNext}
            className="h-10 w-10 rounded-full cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </GlassCard>

      {!record ? (
        <NoRecordCard
          t={t}
          onAction={onAction}
          hasPendingRequest={hasPendingRequest}
        />
      ) : (
        <>
          {/* Status Badge */}
          <div className="flex justify-center">
            <AttendanceStatusBadge status={record.status} />
          </div>

          {/* Desktop: 2 columns layout */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <TimeCard
                  type="in"
                  time={record.originalCheckIn}
                  roundedTime={record.roundedCheckIn}
                  warningMinutes={record.lateMinutes}
                  warningLabel={t("table.lateMinutes")}
                  label={t("checkIn")}
                  locale={locale}
                />
                <TimeCard
                  type="out"
                  time={record.originalCheckOut}
                  roundedTime={record.roundedCheckOut}
                  warningMinutes={record.earlyLeaveMinutes}
                  warningLabel={t("table.earlyLeaveMinutes")}
                  label={t("checkOut")}
                  locale={locale}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatGlassCard
                  icon={<Clock className="h-4 w-4" />}
                  label={t("workingHours")}
                  value={formatMinutesToTime(record.workingMinutes, { locale })}
                />
                <StatGlassCard
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
                <StatGlassCard
                  icon={<Coffee className="h-4 w-4" />}
                  label={t("breakTime")}
                  value={formatMinutesToTime(record.totalBreakMinutes, {
                    locale,
                  })}
                />
                <StatGlassCard
                  icon={<Clock className="h-4 w-4" />}
                  label={t("netWorkingHours")}
                  value={formatMinutesToTime(record.netWorkingMinutes, {
                    locale,
                  })}
                  valueColor={
                    record.netWorkingMinutes < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }
                />
              </div>

              {(record.nightMinutes > 0 || record.nightOvertimeMinutes > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  <StatGlassCard
                    icon={<Moon className="h-4 w-4" />}
                    label={t("table.nightHours")}
                    value={formatMinutesToTime(record.nightMinutes, { locale })}
                    valueColor="text-indigo-600"
                  />
                  <StatGlassCard
                    icon={<Moon className="h-4 w-4" />}
                    label={t("table.nightOvertimeHours")}
                    value={formatMinutesToTime(record.nightOvertimeMinutes, {
                      locale,
                    })}
                    valueColor="text-purple-600"
                  />
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {record.breakRecords && record.breakRecords.length > 0 && (
                <BreakRecordsCard
                  breakRecords={record.breakRecords}
                  totalBreakMinutes={record.totalBreakMinutes}
                  isCompliant={record.breakCompliant}
                  t={t}
                />
              )}

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  {hasPendingRequest && (
                    <span className="text-sm text-muted-foreground">
                      {t("adjustment.hasPendingRequest")}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    onClick={onAction}
                    disabled={hasPendingRequest}
                    className="ml-auto backdrop-blur-sm"
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    {t("requestAdjustment")}
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>

          {(!record.breakRecords || record.breakRecords.length === 0) && (
            <div className="lg:hidden">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  {hasPendingRequest && (
                    <span className="text-sm text-muted-foreground">
                      {t("adjustment.hasPendingRequest")}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    onClick={onAction}
                    disabled={hasPendingRequest}
                    className="ml-auto backdrop-blur-sm"
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    {t("requestAdjustment")}
                  </Button>
                </div>
              </GlassCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// Manager Mode Component (giữ nguyên style cũ)
// ============================================

interface ManagerDetailProps {
  date: string;
  record: UnifiedAttendanceRecord | null;
  isLoading: boolean;
  onAction: () => void;
  employeeName?: string;
  breakRecords: BreakRecord[];
  minimumBreakRequired: number;
  maxBreaksPerDay: number;
  hideBreakTimeline: boolean;
  BreakTimelineComponent?: React.ComponentType<{
    breakRecords: BreakRecord[];
    totalBreakMinutes: number;
    minimumRequired: number;
    maxBreaksPerDay: number;
    isCompliant: boolean;
  }>;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isToday: boolean;
  t: ReturnType<typeof useTranslations<"attendance">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
  locale: SupportedLocale;
}

function ManagerAttendanceDetail({
  date,
  record,
  isLoading,
  onAction,
  employeeName,
  breakRecords,
  minimumBreakRequired,
  maxBreaksPerDay,
  hideBreakTimeline,
  BreakTimelineComponent,
  onPreviousDay,
  onNextDay,
  canGoPrevious,
  canGoNext,
  isToday,
  t,
  tCommon,
  locale,
}: ManagerDetailProps) {
  if (isLoading) {
    return <DetailSkeleton showNavigation={!!onPreviousDay || !!onNextDay} />;
  }

  if (!record) {
    return (
      <GlassCard className="p-0">
        {(onPreviousDay || onNextDay) && (
          <NavigationHeader
            date={date}
            locale={locale}
            isToday={isToday}
            employeeName={employeeName}
            onPreviousDay={onPreviousDay}
            onNextDay={onNextDay}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            todayLabel={tCommon("today")}
          />
        )}
        <div className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>{t("messages.noRecords")}</p>
          </div>
          <div className="flex flex-col items-center gap-2 mt-6">
            <Button onClick={onAction}>
              <Edit className="h-4 w-4 mr-2" />
              {t("edit")}
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-0">
      {onPreviousDay || onNextDay ? (
        <NavigationHeader
          date={date}
          locale={locale}
          isToday={isToday}
          employeeName={employeeName}
          onPreviousDay={onPreviousDay}
          onNextDay={onNextDay}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          todayLabel={tCommon("today")}
        />
      ) : (
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              {employeeName && (
                <p className="text-sm text-muted-foreground">{employeeName}</p>
              )}
              <span className="font-semibold">
                {formatDateWithDayOfWeek(date, locale)}
              </span>
            </div>
          </div>
          <AttendanceStatusBadge status={record.status} />
        </div>
      )}

      {(onPreviousDay || onNextDay) && (
        <div className="flex justify-end px-4 pt-3">
          <AttendanceStatusBadge status={record.status} />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <CheckInOutCard
            type="in"
            time={record.originalCheckIn}
            roundedTime={record.roundedCheckIn}
            warningMinutes={record.lateMinutes}
            warningLabel={t("table.lateMinutes")}
            label={t("checkIn")}
            locale={locale}
          />
          <CheckInOutCard
            type="out"
            time={record.originalCheckOut}
            roundedTime={record.roundedCheckOut}
            warningMinutes={record.earlyLeaveMinutes}
            warningLabel={t("table.earlyLeaveMinutes")}
            label={t("checkOut")}
            locale={locale}
          />
        </div>
      </div>

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

      {!hideBreakTimeline &&
        breakRecords.length > 0 &&
        BreakTimelineComponent && (
          <div className="p-4 border-t">
            <BreakTimelineComponent
              breakRecords={breakRecords}
              totalBreakMinutes={record.totalBreakMinutes}
              minimumRequired={minimumBreakRequired}
              maxBreaksPerDay={maxBreaksPerDay}
              isCompliant={record.breakCompliant}
            />
          </div>
        )}

      <div className="flex items-center justify-end gap-2 p-4 border-t bg-muted/20">
        <Button variant="default" onClick={onAction}>
          <Edit className="h-4 w-4 mr-2" />
          {t("edit")}
        </Button>
      </div>
    </GlassCard>
  );
}

// ============================================
// Shared Sub-Components
// ============================================

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
          variant="outline"
          size="icon"
          onClick={onPreviousDay}
          disabled={!canGoPrevious}
          className="h-8 w-8 rounded-full"
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
        <p className="font-semibold">{formatDateWithDayOfWeek(date, locale)}</p>
        {isToday && (
          <p className="text-xs text-muted-foreground">{todayLabel}</p>
        )}
      </div>
      {onNextDay ? (
        <Button
          variant="outline"
          size="icon"
          onClick={onNextDay}
          disabled={!canGoNext}
          className="h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
}

// Glass style components
interface TimeCardProps {
  type: "in" | "out";
  time?: string;
  roundedTime?: string;
  warningMinutes: number;
  warningLabel: string;
  label: string;
  locale: SupportedLocale;
}

function TimeCard({
  type,
  time,
  roundedTime,
  warningMinutes,
  warningLabel,
  label,
  locale,
}: TimeCardProps) {
  const isIn = type === "in";
  const Icon = isIn ? LogIn : LogOut;
  const iconColor = isIn ? "text-green-600" : "text-red-600";
  const bgGradient = isIn
    ? "from-green-500/20 to-emerald-500/10"
    : "from-red-500/20 to-orange-500/10";

  return (
    <GlassCard className={`p-4 lg:p-5 bg-gradient-to-br ${bgGradient}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-full bg-white/50 dark:bg-white/10">
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-3xl lg:text-4xl font-bold tabular-nums">
        {time ? formatTime(time) : "--:--"}
      </p>
      {roundedTime && time !== roundedTime && (
        <p className="text-xs text-muted-foreground mt-1">
          → {formatTime(roundedTime)}
        </p>
      )}
      {warningMinutes > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
          <AlertTriangle className="h-3 w-3" />
          <span>
            {warningLabel}: {formatMinutesToTime(warningMinutes, { locale })}
          </span>
        </div>
      )}
    </GlassCard>
  );
}

interface StatGlassCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

function StatGlassCard({ icon, label, value, valueColor }: StatGlassCardProps) {
  return (
    <GlassCard className="p-3 lg:p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs lg:text-sm">{label}</span>
      </div>
      <p
        className={`text-xl lg:text-2xl font-semibold tabular-nums ${valueColor || ""}`}
      >
        {value || "--:--"}
      </p>
    </GlassCard>
  );
}

interface BreakRecordsCardProps {
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
  isCompliant: boolean;
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function BreakRecordsCard({
  breakRecords,
  totalBreakMinutes,
  isCompliant,
  t,
}: BreakRecordsCardProps) {
  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  return (
    <GlassCard className="p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coffee className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{t("editDialog.breakRecords")}</span>
        </div>
        <Badge
          variant="outline"
          className={
            isCompliant
              ? "text-green-600 border-green-300 bg-green-50/50"
              : "text-orange-600 border-orange-300 bg-orange-50/50"
          }
        >
          {isCompliant ? t("breakCompliant") : t("breakNonCompliant")}
        </Badge>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {sortedRecords.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-2.5 lg:p-3 rounded-xl bg-white/30 dark:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {record.breakNumber}
              </div>
              <span className="text-sm tabular-nums">
                {record.breakStart ? formatTime(record.breakStart) : "--:--"}
                <span className="mx-1.5 text-muted-foreground">→</span>
                {record.breakEnd ? formatTime(record.breakEnd) : "..."}
              </span>
            </div>
            <span className="text-sm font-medium tabular-nums">
              {record.actualBreakMinutes || 0}分
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-white/20">
        <span className="text-muted-foreground">
          {t("editDialog.totalBreak")}
        </span>
        <span className="font-semibold">{totalBreakMinutes}分</span>
      </div>
    </GlassCard>
  );
}

interface NoRecordCardProps {
  t: ReturnType<typeof useTranslations<"attendance">>;
  onAction: () => void;
  hasPendingRequest: boolean;
}

function NoRecordCard({ t, onAction, hasPendingRequest }: NoRecordCardProps) {
  return (
    <GlassCard className="p-8 lg:p-12 text-center max-w-md mx-auto">
      <Clock className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 text-muted-foreground/30" />
      <p className="text-muted-foreground mb-6">{t("messages.noRecords")}</p>
      <Button onClick={onAction} disabled={hasPendingRequest}>
        <FileEdit className="h-4 w-4 mr-2" />
        {t("requestAdjustment")}
      </Button>
      {hasPendingRequest && (
        <p className="text-sm text-muted-foreground mt-2">
          {t("adjustment.hasPendingRequest")}
        </p>
      )}
    </GlassCard>
  );
}

// Manager style components
interface CheckInOutCardProps {
  type: "in" | "out";
  time?: string;
  roundedTime?: string;
  warningMinutes: number;
  warningLabel: string;
  label: string;
  locale: SupportedLocale;
}

function CheckInOutCard({
  type,
  time,
  roundedTime,
  warningMinutes,
  warningLabel,
  label,
  locale,
}: CheckInOutCardProps) {
  const isIn = type === "in";
  const bgClass = isIn
    ? "bg-green-50/50 dark:bg-green-950/20"
    : "bg-red-50/50 dark:bg-red-950/20";
  const iconBgClass = isIn
    ? "bg-green-100 dark:bg-green-900/50"
    : "bg-red-100 dark:bg-red-900/50";
  const iconColorClass = isIn ? "text-green-600" : "text-red-600";
  const Icon = isIn ? LogIn : LogOut;

  return (
    <div className={`rounded-lg border ${bgClass} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-full ${iconBgClass}`}>
          <Icon className={`h-3.5 w-3.5 ${iconColorClass}`} />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold tabular-nums">
        {time ? formatTime(time) : "-"}
      </p>
      {roundedTime && time !== roundedTime && (
        <p className="text-xs text-muted-foreground mt-1">
          → {formatTime(roundedTime)}
        </p>
      )}
      {warningMinutes > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
          <AlertTriangle className="h-3 w-3" />
          <span>
            {warningLabel}: {formatMinutesToTime(warningMinutes, { locale })}
          </span>
        </div>
      )}
    </div>
  );
}

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
      className={`rounded-lg border p-3 ${variant === "dark" ? "bg-slate-50 dark:bg-slate-900/50" : "bg-background"}`}
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

// Skeletons
function GlassDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 lg:h-32 rounded-3xl" />
            <Skeleton className="h-28 lg:h-32 rounded-3xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 lg:h-24 rounded-3xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-16 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton({
  showNavigation = false,
}: {
  showNavigation?: boolean;
}) {
  return (
    <GlassCard className="p-0">
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
    </GlassCard>
  );
}
