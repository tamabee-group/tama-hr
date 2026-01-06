"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Briefcase,
} from "lucide-react";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { formatDate, formatTime } from "@/lib/utils/format-date";
import { unifiedAttendanceApi } from "@/lib/apis/unified-attendance-api";
import type {
  UnifiedAttendanceRecord,
  BreakRecord,
  AdjustmentRequest,
  AppliedSettingsSnapshot,
} from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface AttendanceDetailDialogProps {
  open: boolean;
  onClose: () => void;
  attendance: UnifiedAttendanceRecord | null;
}

// ============================================
// Utilities
// ============================================

function formatMinutesToHours(minutes: number | undefined | null): string {
  if (minutes === undefined || minutes === null || isNaN(minutes)) {
    return "-";
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// ============================================
// Main Component
// ============================================

export function AttendanceDetailDialog({
  open,
  onClose,
  attendance,
}: AttendanceDetailDialogProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tBreak = useTranslations("break");
  const locale = useLocale() as SupportedLocale;

  // State for adjustment history
  const [adjustmentHistory, setAdjustmentHistory] = useState<
    AdjustmentRequest[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch adjustment history when dialog opens
  useEffect(() => {
    if (open && attendance?.id) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const history =
            await unifiedAttendanceApi.getCompanyAdjustmentHistory(
              attendance.id,
            );
          setAdjustmentHistory(history);
        } catch (error) {
          console.error("Error fetching adjustment history:", error);
          setAdjustmentHistory([]);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [open, attendance?.id]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {attendance
              ? `${attendance.employeeName} - ${formatDate(attendance.workDate, locale)}`
              : t("title")}
          </DialogTitle>
        </DialogHeader>

        {!attendance ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("messages.noRecords")}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("currentStatus")}
              </span>
              <AttendanceStatusBadge status={attendance.status} />
            </div>

            <Separator />

            {/* Check-in/out times - Original và Rounded */}
            <TimeSection attendance={attendance} t={t} />

            <Separator />

            {/* Working hours summary */}
            <WorkingSummarySection attendance={attendance} t={t} />

            {/* Night hours if any */}
            {(attendance.nightMinutes > 0 ||
              attendance.nightOvertimeMinutes > 0) && (
              <>
                <Separator />
                <NightHoursSection attendance={attendance} t={t} />
              </>
            )}

            {/* Break Records */}
            {attendance.breakRecords && attendance.breakRecords.length > 0 && (
              <>
                <Separator />
                <BreakRecordsSection
                  breakRecords={attendance.breakRecords}
                  totalBreakMinutes={attendance.totalBreakMinutes}
                  effectiveBreakMinutes={attendance.effectiveBreakMinutes}
                  breakCompliant={attendance.breakCompliant}
                  t={t}
                  tBreak={tBreak}
                />
              </>
            )}

            {/* Applied Settings Snapshot */}
            {attendance.appliedSettings && (
              <>
                <Separator />
                <AppliedSettingsSection
                  settings={attendance.appliedSettings}
                  t={t}
                  tCommon={tCommon}
                />
              </>
            )}

            {/* Shift Info */}
            {attendance.shiftInfo && (
              <>
                <Separator />
                <ShiftInfoSection
                  attendance={attendance}
                  t={t}
                  tCommon={tCommon}
                />
              </>
            )}

            {/* Adjustment History */}
            <Separator />
            <AdjustmentHistorySection
              adjustments={adjustmentHistory}
              isLoading={loadingHistory}
              t={t}
              tCommon={tCommon}
              locale={locale}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Time Section
// ============================================

interface TimeSectionProps {
  attendance: UnifiedAttendanceRecord;
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function TimeSection({ attendance, t }: TimeSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {t("table.checkInTime")} / {t("table.checkOutTime")}
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {/* Check-in */}
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <LogIn className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">
              {t("table.checkInTime")}
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
                {t("roundedTime")}: {formatTime(attendance.roundedCheckIn)}
              </p>
            )}
          {attendance.lateMinutes > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              {t("lateMinutes")}: {attendance.lateMinutes}m
            </div>
          )}
        </div>

        {/* Check-out */}
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <LogOut className="h-4 w-4 text-red-600" />
            <span className="text-sm text-muted-foreground">
              {t("table.checkOutTime")}
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
                {t("roundedTime")}: {formatTime(attendance.roundedCheckOut)}
              </p>
            )}
          {attendance.earlyLeaveMinutes > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              {t("earlyLeaveMinutes")}: {attendance.earlyLeaveMinutes}m
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
}

function WorkingSummarySection({ attendance, t }: WorkingSummarySectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Timer className="h-4 w-4" />
        {t("workingHours")}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem
          label={t("workingHours")}
          value={formatMinutesToHours(attendance.workingMinutes)}
        />
        <StatItem
          label={t("overtime")}
          value={
            attendance.overtimeMinutes > 0
              ? formatMinutesToHours(attendance.overtimeMinutes)
              : "-"
          }
          highlight={attendance.overtimeMinutes > 0}
        />
        <StatItem
          label={t("breakTime")}
          value={formatMinutesToHours(attendance.totalBreakMinutes)}
        />
        <StatItem
          label={t("netWorkingHours")}
          value={formatMinutesToHours(attendance.netWorkingMinutes)}
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
}

function NightHoursSection({ attendance, t }: NightHoursSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {attendance.nightMinutes > 0 && (
        <StatItem
          label={t("table.nightHours")}
          value={formatMinutesToHours(attendance.nightMinutes)}
        />
      )}
      {attendance.nightOvertimeMinutes > 0 && (
        <StatItem
          label={t("table.nightOvertimeHours")}
          value={formatMinutesToHours(attendance.nightOvertimeMinutes)}
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
  tBreak: ReturnType<typeof useTranslations<"break">>;
}

function BreakRecordsSection({
  breakRecords,
  totalBreakMinutes,
  effectiveBreakMinutes,
  breakCompliant,
  t,
  tBreak,
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

      {/* Break list */}
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
            <span className="font-medium">{record.actualBreakMinutes}m</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {tBreak("history.totalBreakTime")}
          </span>
          <span className="font-medium">{totalBreakMinutes}m</span>
        </div>
        {effectiveBreakMinutes !== totalBreakMinutes && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {tBreak("history.effectiveBreakTime")}
            </span>
            <span className="font-medium">{effectiveBreakMinutes}m</span>
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
  t: ReturnType<typeof useTranslations<"attendance">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
}

function AppliedSettingsSection({
  settings,
  tCommon,
}: AppliedSettingsSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Cấu hình áp dụng
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Làm tròn check-in</p>
          <p className="font-medium">
            {settings.checkInRounding?.interval || "--"} (
            {settings.checkInRounding?.direction || "--"})
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Làm tròn check-out</p>
          <p className="font-medium">
            {settings.checkOutRounding?.interval || "--"} (
            {settings.checkOutRounding?.direction || "--"})
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Grace đi muộn</p>
          <p className="font-medium">
            {settings.lateGraceMinutes || 0} {tCommon("minutes")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Grace về sớm</p>
          <p className="font-medium">
            {settings.earlyLeaveGraceMinutes || 0} {tCommon("minutes")}
          </p>
        </div>
        {settings.breakConfig && (
          <>
            <div>
              <p className="text-muted-foreground">Giờ nghỉ tối thiểu</p>
              <p className="font-medium">
                {settings.breakConfig.minimumBreakMinutes || 0}{" "}
                {tCommon("minutes")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Giờ nghỉ tối đa</p>
              <p className="font-medium">
                {settings.breakConfig.maximumBreakMinutes || 0}{" "}
                {tCommon("minutes")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// Shift Info Section
// ============================================

interface ShiftInfoSectionProps {
  attendance: UnifiedAttendanceRecord;
  t: ReturnType<typeof useTranslations<"attendance">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
}

function ShiftInfoSection({ attendance, tCommon }: ShiftInfoSectionProps) {
  if (!attendance.shiftInfo) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        Thông tin ca làm việc
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Tên ca</p>
          <p className="font-medium">{attendance.shiftInfo.shiftName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Thời gian</p>
          <p className="font-medium">
            {attendance.shiftInfo.startTime} - {attendance.shiftInfo.endTime}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Giờ nghỉ</p>
          <p className="font-medium">
            {attendance.shiftInfo.breakMinutes} {tCommon("minutes")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Hệ số</p>
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
  isLoading: boolean;
  t: ReturnType<typeof useTranslations<"attendance">>;
  tCommon: ReturnType<typeof useTranslations<"common">>;
  locale: SupportedLocale;
}

function AdjustmentHistorySection({
  adjustments,
  isLoading,
  t,
  tCommon,
  locale,
}: AdjustmentHistorySectionProps) {
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
