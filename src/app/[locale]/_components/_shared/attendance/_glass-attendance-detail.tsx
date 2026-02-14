"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Coffee,
  Clock,
  TrendingUp,
  Moon,
  FileEdit,
  AlertTriangle,
  History,
  Edit,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/app/[locale]/_components/_glass-style/_glass-card";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared";
import {
  formatDateWithDayOfWeek,
  formatTime,
  formatDateTime,
  formatMinutesToTime,
} from "@/lib/utils/format-date-time";
import type {
  UnifiedAttendanceRecord,
  BreakRecord,
  AdjustmentRequest,
} from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

type DetailMode = "employee" | "manager";

interface GlassAttendanceDetailProps {
  mode: DetailMode;
  date: string;
  record: UnifiedAttendanceRecord | null;
  isLoading: boolean;
  // Employee mode: adjustment requests + navigation
  adjustmentRequests?: AdjustmentRequest[];
  onCreateRequest?: () => void;
  onViewRequest?: (request: AdjustmentRequest) => void;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  isToday?: boolean;
  // Manager mode: edit trực tiếp
  onEdit?: () => void;
}

// ============================================
// Main Component
// ============================================

export function GlassAttendanceDetail({
  mode,
  date,
  record,
  isLoading,
  adjustmentRequests = [],
  onCreateRequest,
  onViewRequest,
  onPreviousDay,
  onNextDay,
  canGoPrevious = true,
  canGoNext = true,
  isToday = false,
  onEdit,
}: GlassAttendanceDetailProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const isEmployee = mode === "employee";
  const isManager = mode === "manager";

  // Kiểm tra có yêu cầu đang pending không (employee mode)
  const pendingRequest = adjustmentRequests.find((r) => r.status === "PENDING");
  const hasPendingRequest = !!pendingRequest;

  if (isLoading) {
    return <GlassDetailSkeleton showNav={isEmployee} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
      {/* Employee mode: Navigation Header */}
      {isEmployee && (
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
      )}

      {/* Manager mode: Header với tên nhân viên và ngày */}
      {isManager && record && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{record.employeeName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateWithDayOfWeek(record.workDate, locale)}
                </p>
              </div>
            </div>
            <AttendanceStatusBadge status={record.status} />
          </div>
        </GlassCard>
      )}

      {!record ? (
        <>
          {isEmployee && (
            <NoRecordCardEmployee
              t={t}
              onCreateRequest={onCreateRequest!}
              onViewRequest={onViewRequest!}
              hasPendingRequest={hasPendingRequest}
              pendingRequest={pendingRequest}
            />
          )}
          {isManager && <NoRecordCardManager t={t} onEdit={onEdit!} />}
          {/* Lịch sử yêu cầu điều chỉnh (employee mode) */}
          {isEmployee && (
            <AdjustmentHistoryCard
              requests={adjustmentRequests}
              onViewRequest={onViewRequest!}
              t={t}
              locale={locale}
            />
          )}
        </>
      ) : (
        <>
          {/* Status Badge (employee mode - manager đã hiển thị ở header) */}
          {isEmployee && (
            <div className="flex justify-center">
              <AttendanceStatusBadge status={record.status} />
            </div>
          )}

          {/* Desktop: 2 columns layout */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
            {/* Left Column: Check In/Out + Stats */}
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

              {/* Night Hours */}
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

            {/* Right Column: Break Records + Action */}
            <div className="space-y-4">
              <BreakRecordsCard
                breakRecords={record.breakRecords || []}
                totalBreakMinutes={record.totalBreakMinutes}
                isCompliant={record.breakCompliant}
                t={t}
              />

              {/* Action Button */}
              <GlassCard className="p-4">
                {isManager && (
                  <Button onClick={onEdit} className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit")}
                  </Button>
                )}
                {isEmployee && hasPendingRequest ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t("adjustment.hasPendingRequest")}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        pendingRequest && onViewRequest?.(pendingRequest)
                      }
                      className="backdrop-blur-sm"
                    >
                      <FileEdit className="h-4 w-4 mr-2" />
                      {t("adjustment.viewDetail")}
                    </Button>
                  </div>
                ) : isEmployee ? (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={onCreateRequest}
                      className="backdrop-blur-sm"
                    >
                      <FileEdit className="h-4 w-4 mr-2" />
                      {t("requestAdjustment")}
                    </Button>
                  </div>
                ) : null}
              </GlassCard>
            </div>
          </div>

          {/* Lịch sử yêu cầu điều chỉnh (employee mode) */}
          {isEmployee && (
            <AdjustmentHistoryCard
              requests={adjustmentRequests}
              onViewRequest={onViewRequest!}
              t={t}
              locale={locale}
            />
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// TimeCard Component
// ============================================

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
    <GlassCard className={`p-4 lg:p-5 bg-linear-to-br ${bgGradient}`}>
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

// ============================================
// StatGlassCard Component
// ============================================

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

// ============================================
// BreakRecordsCard Component
// ============================================

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
        {breakRecords.length > 0 && (
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
        )}
      </div>

      {breakRecords.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("messages.noBreakRecords")}
        </p>
      ) : (
        <>
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
                    {record.breakStart
                      ? formatTime(record.breakStart)
                      : "--:--"}
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
        </>
      )}
    </GlassCard>
  );
}

// ============================================
// NoRecordCardEmployee Component
// ============================================

interface NoRecordCardEmployeeProps {
  t: ReturnType<typeof useTranslations<"attendance">>;
  onCreateRequest: () => void;
  onViewRequest: (request: AdjustmentRequest) => void;
  hasPendingRequest: boolean;
  pendingRequest?: AdjustmentRequest;
}

function NoRecordCardEmployee({
  t,
  onCreateRequest,
  onViewRequest,
  hasPendingRequest,
  pendingRequest,
}: NoRecordCardEmployeeProps) {
  return (
    <GlassCard className="p-8 lg:p-12 text-center max-w-md mx-auto">
      <Clock className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 text-muted-foreground/30" />
      <p className="text-muted-foreground mb-6">{t("messages.noRecords")}</p>
      {hasPendingRequest ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {t("adjustment.hasPendingRequest")}
          </p>
          <Button
            variant="outline"
            onClick={() => pendingRequest && onViewRequest(pendingRequest)}
          >
            <FileEdit className="h-4 w-4 mr-2" />
            {t("adjustment.viewDetail")}
          </Button>
        </>
      ) : (
        <Button onClick={onCreateRequest}>
          <FileEdit className="h-4 w-4 mr-2" />
          {t("requestAdjustment")}
        </Button>
      )}
    </GlassCard>
  );
}

// ============================================
// NoRecordCardManager Component
// ============================================

interface NoRecordCardManagerProps {
  t: ReturnType<typeof useTranslations<"attendance">>;
  onEdit: () => void;
}

function NoRecordCardManager({ t, onEdit }: NoRecordCardManagerProps) {
  return (
    <GlassCard className="p-8 lg:p-12 text-center max-w-md mx-auto">
      <Clock className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 text-muted-foreground/30" />
      <p className="text-muted-foreground mb-6">{t("messages.noRecords")}</p>
      <Button onClick={onEdit}>
        <Edit className="h-4 w-4 mr-2" />
        {t("edit")}
      </Button>
    </GlassCard>
  );
}

// ============================================
// AdjustmentHistoryCard Component (employee mode)
// ============================================

interface AdjustmentHistoryCardProps {
  requests: AdjustmentRequest[];
  onViewRequest: (request: AdjustmentRequest) => void;
  t: ReturnType<typeof useTranslations<"attendance">>;
  locale: SupportedLocale;
}

function AdjustmentHistoryCard({
  requests,
  onViewRequest,
  t,
  locale,
}: AdjustmentHistoryCardProps) {
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

  if (processedRequests.length === 0) {
    return null;
  }

  return (
    <GlassCard className="p-4 lg:p-5">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{t("adjustment.requestHistory")}</span>
      </div>

      <div className="space-y-2">
        {processedRequests.map((request) => (
          <div
            key={request.id}
            onClick={() => onViewRequest(request)}
            className="flex items-center justify-between p-3 rounded-xl bg-white/30 dark:bg-white/5 cursor-pointer hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={
                  request.status === "APPROVED"
                    ? "text-green-600 border-green-300 bg-green-50/50"
                    : "text-red-600 border-red-300 bg-red-50/50"
                }
              >
                {request.status === "APPROVED"
                  ? t("adjustment.timelineApproved")
                  : t("adjustment.timelineRejected")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(request.createdAt, locale)}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      {processedRequests
        .filter((r) => r.status === "REJECTED" && r.rejectionReason)
        .map((request) => (
          <div
            key={`rejection-${request.id}`}
            className="mt-3 p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-200/50"
          >
            <p className="text-xs text-red-600 font-medium mb-1">
              {t("adjustment.rejectionReason")}:
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">
              {request.rejectionReason}
            </p>
          </div>
        ))}
    </GlassCard>
  );
}

// ============================================
// Skeleton
// ============================================

function GlassDetailSkeleton({ showNav }: { showNav: boolean }) {
  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
      {showNav && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      )}
      {!showNav && <Skeleton className="h-20 rounded-3xl" />}
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
