"use client";

import { useTranslations } from "next-intl";
import {
  Clock,
  LogIn,
  LogOut,
  Timer,
  AlertTriangle,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Settings,
  History,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  formatDateWithDayOfWeek,
  formatTime,
  formatMinutesToTime,
} from "@/lib/utils/format-date-time";
import type {
  UnifiedAttendanceRecord,
  BreakRecord,
  AdjustmentRequest,
  AppliedSettingsSnapshot,
} from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Stat Item - Dùng chung cho các section
// ============================================

interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function StatItem({ label, value, highlight }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-lg font-semibold ${highlight ? "text-blue-600" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================
// Time Section - Check-in/out
// ============================================

interface TimeSectionProps {
  attendance: UnifiedAttendanceRecord;
  locale: SupportedLocale;
}

export function TimeSection({ attendance, locale }: TimeSectionProps) {
  const t = useTranslations("attendance");

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {t("checkIn")} / {t("checkOut")}
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {/* Check-in */}
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <LogIn className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">
              {t("checkIn")}
            </span>
          </div>
          <p className="text-xl font-bold">
            {attendance.originalCheckIn
              ? formatTime(attendance.originalCheckIn)
              : "-"}
          </p>
          {attendance.roundedCheckIn &&
            attendance.originalCheckIn !== attendance.roundedCheckIn && (
              <p className="text-xs text-muted-foreground mt-1">
                → {formatTime(attendance.roundedCheckIn)}
              </p>
            )}
          {attendance.lateMinutes > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              {t("table.lateMinutes")}:{" "}
              {formatMinutesToTime(attendance.lateMinutes, { locale })}
            </div>
          )}
        </div>

        {/* Check-out */}
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <LogOut className="h-4 w-4 text-red-600" />
            <span className="text-sm text-muted-foreground">
              {t("checkOut")}
            </span>
          </div>
          <p className="text-xl font-bold">
            {attendance.originalCheckOut
              ? formatTime(attendance.originalCheckOut)
              : "-"}
          </p>
          {attendance.roundedCheckOut &&
            attendance.originalCheckOut !== attendance.roundedCheckOut && (
              <p className="text-xs text-muted-foreground mt-1">
                → {formatTime(attendance.roundedCheckOut)}
              </p>
            )}
          {attendance.earlyLeaveMinutes > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              {t("table.earlyLeaveMinutes")}:{" "}
              {formatMinutesToTime(attendance.earlyLeaveMinutes, { locale })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Working Summary Section
// ============================================

interface WorkingSummarySectionProps {
  attendance: UnifiedAttendanceRecord;
  locale: SupportedLocale;
}

export function WorkingSummarySection({
  attendance,
  locale,
}: WorkingSummarySectionProps) {
  const t = useTranslations("attendance");

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Timer className="h-4 w-4" />
        {t("workingHours")}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem
          label={t("workingHours")}
          value={formatMinutesToTime(attendance.workingMinutes, { locale })}
        />
        <StatItem
          label={t("overtime")}
          value={formatMinutesToTime(attendance.overtimeMinutes, {
            zeroAsEmpty: true,
            locale,
          })}
          highlight={attendance.overtimeMinutes > 0}
        />
        <StatItem
          label={t("breakTime")}
          value={formatMinutesToTime(attendance.totalBreakMinutes, { locale })}
        />
        <StatItem
          label={t("netWorkingHours")}
          value={formatMinutesToTime(attendance.netWorkingMinutes, { locale })}
        />
      </div>
    </div>
  );
}

// ============================================
// Night Hours Section
// ============================================

interface NightHoursSectionProps {
  attendance: UnifiedAttendanceRecord;
  locale: SupportedLocale;
}

export function NightHoursSection({
  attendance,
  locale,
}: NightHoursSectionProps) {
  const t = useTranslations("attendance");

  return (
    <div className="grid grid-cols-2 gap-4">
      {attendance.nightMinutes > 0 && (
        <StatItem
          label={t("table.nightHours")}
          value={formatMinutesToTime(attendance.nightMinutes, { locale })}
        />
      )}
      {attendance.nightOvertimeMinutes > 0 && (
        <StatItem
          label={t("table.nightOvertimeHours")}
          value={formatMinutesToTime(attendance.nightOvertimeMinutes, {
            locale,
          })}
          highlight
        />
      )}
    </div>
  );
}

// ============================================
// Break Records Section
// ============================================

interface BreakRecordsSectionProps {
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
  effectiveBreakMinutes: number;
  breakCompliant: boolean;
  locale: SupportedLocale;
}

export function BreakRecordsSection({
  breakRecords,
  totalBreakMinutes,
  effectiveBreakMinutes,
  breakCompliant,
  locale,
}: BreakRecordsSectionProps) {
  const t = useTranslations("attendance");
  const tBreak = useTranslations("break.history");

  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Coffee className="h-4 w-4" />
          {tBreak("title")}
        </h4>
        {breakCompliant ? (
          <Badge
            variant="outline"
            className="text-green-600 border-green-600 text-xs"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t("breakCompliant")}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-600 text-xs"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            {t("breakNonCompliant")}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {sortedRecords.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                {record.breakNumber}
              </div>
              <span>
                {formatTime(record.breakStart)} →{" "}
                {record.breakEnd ? formatTime(record.breakEnd) : "..."}
              </span>
            </div>
            <span className="font-medium">
              {formatMinutesToTime(record.actualBreakMinutes, { locale })}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {tBreak("totalBreakTime")}
          </span>
          <span className="font-medium">
            {formatMinutesToTime(totalBreakMinutes, { locale })}
          </span>
        </div>
        {effectiveBreakMinutes !== totalBreakMinutes && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {tBreak("effectiveBreakTime")}
            </span>
            <span className="font-medium">
              {formatMinutesToTime(effectiveBreakMinutes, { locale })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Applied Settings Section
// ============================================

interface AppliedSettingsSectionProps {
  settings: AppliedSettingsSnapshot;
  locale: SupportedLocale;
}

export function AppliedSettingsSection({
  settings,
  locale,
}: AppliedSettingsSectionProps) {
  const t = useTranslations("attendance");

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="h-4 w-4" />
        {t("appliedSettings.title")}
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">
            {t("appliedSettings.checkInRounding")}
          </p>
          <p className="font-medium">
            {settings.checkInRounding?.interval} (
            {settings.checkInRounding?.direction})
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">
            {t("appliedSettings.checkOutRounding")}
          </p>
          <p className="font-medium">
            {settings.checkOutRounding?.interval} (
            {settings.checkOutRounding?.direction})
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">
            {t("appliedSettings.minBreak")}
          </p>
          <p className="font-medium">
            {formatMinutesToTime(settings.breakConfig?.minimumBreakMinutes, {
              locale,
            })}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">
            {t("appliedSettings.maxBreak")}
          </p>
          <p className="font-medium">
            {formatMinutesToTime(settings.breakConfig?.maximumBreakMinutes, {
              locale,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Shift Info Section
// ============================================

interface ShiftInfoSectionProps {
  attendance: UnifiedAttendanceRecord;
  locale: SupportedLocale;
}

export function ShiftInfoSection({
  attendance,
  locale,
}: ShiftInfoSectionProps) {
  const t = useTranslations("attendance");

  if (!attendance.shiftInfo) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        {t("shiftInfo.title")}
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">{t("shiftInfo.shiftName")}</p>
          <p className="font-medium">{attendance.shiftInfo.shiftName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("shiftInfo.time")}</p>
          <p className="font-medium">
            {attendance.shiftInfo.startTime} - {attendance.shiftInfo.endTime}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("shiftInfo.breakTime")}</p>
          <p className="font-medium">
            {formatMinutesToTime(attendance.shiftInfo.breakMinutes, { locale })}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("shiftInfo.multiplier")}</p>
          <p className="font-medium">x{attendance.shiftInfo.multiplier}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Adjustment History Section
// ============================================

interface AdjustmentHistorySectionProps {
  adjustments: AdjustmentRequest[];
  locale: SupportedLocale;
  isLoading?: boolean;
}

export function AdjustmentHistorySection({
  adjustments,
  locale,
  isLoading = false,
}: AdjustmentHistorySectionProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4" />
          {t("adjustment.requestHistory")}
        </h4>
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <History className="h-4 w-4" />
        {t("adjustment.requestHistory")}
      </h4>
      {adjustments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {tCommon("noData")}
        </p>
      ) : (
        <div className="space-y-2">
          {adjustments.map((adj) => (
            <div
              key={adj.id}
              className="p-3 rounded-lg border bg-card text-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {formatDateWithDayOfWeek(adj.createdAt, locale)}
                </span>
                <Badge
                  variant={
                    adj.status === "APPROVED"
                      ? "default"
                      : adj.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {adj.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{adj.reason}</p>
              {adj.approverComment && (
                <p className="text-xs">
                  <span className="text-muted-foreground">
                    {t("adjustment.approverComment")}:
                  </span>{" "}
                  {adj.approverComment}
                </p>
              )}
              {adj.rejectionReason && (
                <p className="text-xs text-red-600">
                  <span className="text-muted-foreground">
                    {t("rejectionReason")}:
                  </span>{" "}
                  {adj.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Dialog Skeleton
// ============================================

export function AttendanceDialogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Separator />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
