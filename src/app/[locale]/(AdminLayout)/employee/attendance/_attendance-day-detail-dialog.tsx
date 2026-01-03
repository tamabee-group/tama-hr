"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  FileEdit,
} from "lucide-react";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import {
  formatDate,
  formatTime,
  formatMinutesToTime,
} from "@/lib/utils/format-date";
import type {
  UnifiedAttendanceRecord,
  BreakRecord,
  AdjustmentRequest,
  AppliedSettingsSnapshot,
} from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import { AdjustmentDialog } from "./_adjustment-dialog";

// ============================================
// Types
// ============================================

interface AttendanceDayDetailDialogProps {
  open: boolean;
  onClose: () => void;
  attendance: UnifiedAttendanceRecord | null;
  adjustmentHistory?: AdjustmentRequest[];
  isLoading?: boolean;
  onAdjustmentSubmitted?: () => void;
}

// ============================================
// Main Component
// ============================================

export function AttendanceDayDetailDialog({
  open,
  onClose,
  attendance,
  adjustmentHistory = [],
  isLoading = false,
  onAdjustmentSubmitted,
}: AttendanceDayDetailDialogProps) {
  const t = useTranslations("attendance");
  const tBreak = useTranslations("break.history");
  const locale = useLocale() as SupportedLocale;

  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  const handleOpenAdjustment = () => {
    onClose(); // Đóng dialog cha trước
    setAdjustmentDialogOpen(true);
  };

  const handleAdjustmentClose = () => {
    setAdjustmentDialogOpen(false);
  };

  const handleAdjustmentSuccess = () => {
    setAdjustmentDialogOpen(false);
    onAdjustmentSubmitted?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {attendance
                ? formatDate(attendance.workDate, locale)
                : t("title")}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <DialogSkeleton />
          ) : !attendance ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("messages.noRecords")}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mt-4">
                <AttendanceStatusBadge status={attendance.status} />
              </div>

              <TimeSection attendance={attendance} t={t} locale={locale} />
              <Separator />
              <WorkingSummarySection
                attendance={attendance}
                t={t}
                locale={locale}
              />

              {(attendance.nightMinutes > 0 ||
                attendance.nightOvertimeMinutes > 0) && (
                <>
                  <Separator />
                  <NightHoursSection
                    attendance={attendance}
                    t={t}
                    locale={locale}
                  />
                </>
              )}

              {attendance.breakRecords &&
                attendance.breakRecords.length > 0 && (
                  <>
                    <Separator />
                    <BreakRecordsSection
                      breakRecords={attendance.breakRecords}
                      totalBreakMinutes={attendance.totalBreakMinutes}
                      effectiveBreakMinutes={attendance.effectiveBreakMinutes}
                      breakCompliant={attendance.breakCompliant}
                      t={t}
                      tBreak={tBreak}
                      locale={locale}
                    />
                  </>
                )}

              {attendance.appliedSettings && (
                <>
                  <Separator />
                  <AppliedSettingsSection
                    settings={attendance.appliedSettings}
                    locale={locale}
                    t={t}
                  />
                </>
              )}

              {attendance.shiftInfo && (
                <>
                  <Separator />
                  <ShiftInfoSection
                    attendance={attendance}
                    locale={locale}
                    t={t}
                  />
                </>
              )}

              {adjustmentHistory.length > 0 && (
                <>
                  <Separator />
                  <AdjustmentHistorySection
                    adjustments={adjustmentHistory}
                    t={t}
                    locale={locale}
                  />
                </>
              )}
            </div>
          )}

          {attendance && !isLoading && (
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={handleOpenAdjustment}
                className="w-full sm:w-auto"
              >
                <FileEdit className="h-4 w-4 mr-2" />
                {t("requestAdjustment")}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {attendance && (
        <AdjustmentDialog
          record={attendance}
          open={adjustmentDialogOpen}
          onClose={handleAdjustmentClose}
          onSuccess={handleAdjustmentSuccess}
        />
      )}
    </>
  );
}

// ============================================
// Time Section
// ============================================

interface TimeSectionProps {
  attendance: UnifiedAttendanceRecord;
  t: ReturnType<typeof useTranslations<"attendance">>;
  locale: SupportedLocale;
}

function TimeSection({ attendance, t, locale }: TimeSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        {t("checkIn")} / {t("checkOut")}
      </h4>
      <div className="grid grid-cols-2 gap-4">
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
  t: ReturnType<typeof useTranslations<"attendance">>;
  locale: SupportedLocale;
}

function WorkingSummarySection({
  attendance,
  t,
  locale,
}: WorkingSummarySectionProps) {
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
  t: ReturnType<typeof useTranslations<"attendance">>;
  locale: SupportedLocale;
}

function NightHoursSection({ attendance, t, locale }: NightHoursSectionProps) {
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
  t: ReturnType<typeof useTranslations<"attendance">>;
  tBreak: ReturnType<typeof useTranslations<"break.history">>;
  locale: SupportedLocale;
}

function BreakRecordsSection({
  breakRecords,
  totalBreakMinutes,
  effectiveBreakMinutes,
  breakCompliant,
  t,
  tBreak,
  locale,
}: BreakRecordsSectionProps) {
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
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function AppliedSettingsSection({
  settings,
  locale,
  t,
}: AppliedSettingsSectionProps) {
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
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function ShiftInfoSection({ attendance, locale, t }: ShiftInfoSectionProps) {
  if (!attendance.shiftInfo) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">{t("shiftInfo.title")}</h4>
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
  t: ReturnType<typeof useTranslations<"attendance">>;
  locale: SupportedLocale;
}

function AdjustmentHistorySection({
  adjustments,
  t,
  locale,
}: AdjustmentHistorySectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <History className="h-4 w-4" />
        {t("adjustment.requestHistory")}
      </h4>
      <div className="space-y-2">
        {adjustments.map((adj) => (
          <div
            key={adj.id}
            className="p-3 rounded-lg border bg-card text-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {formatDate(adj.createdAt, locale)}
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
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Stat Item
// ============================================

interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatItem({ label, value, highlight }: StatItemProps) {
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
// Dialog Skeleton
// ============================================

function DialogSkeleton() {
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
