"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  formatTime,
  formatDateWithDayOfWeek,
} from "@/lib/utils/format-date-time";
import type {
  UnifiedAttendanceRecord,
  BreakRecord,
} from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface UnifiedAttendanceCardProps {
  attendance: UnifiedAttendanceRecord | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onStartBreak: () => void;
  onEndBreak: (breakId: number) => void;
  isLoading: boolean;
  isSubmitting?: boolean;
}

// ============================================
// Utilities
// ============================================

function isBreakActive(breakRecord: BreakRecord): boolean {
  if (!breakRecord.breakStart) return false;
  const breakEnd = breakRecord.breakEnd;
  return breakEnd === null || breakEnd === undefined || breakEnd === "";
}

function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// ============================================
// Main Component
// ============================================

export function UnifiedAttendanceCard({
  attendance,
  onCheckIn,
  onCheckOut,
  onStartBreak,
  onEndBreak,
  isLoading,
  isSubmitting = false,
}: UnifiedAttendanceCardProps) {
  const t = useTranslations("attendance");
  const tBreak = useTranslations("break");
  const locale = useLocale() as SupportedLocale;
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Cập nhật thời gian mỗi giây
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Tìm break đang active
  const breakRecords = attendance?.breakRecords;
  const activeBreak = React.useMemo(() => {
    if (!breakRecords) return null;
    return breakRecords.find(isBreakActive) || null;
  }, [breakRecords]);

  // Xác định trạng thái
  const hasCheckedIn = !!attendance?.originalCheckIn;
  const hasCheckedOut = !!attendance?.originalCheckOut;
  const isOnBreak = !!activeBreak;

  // Tính thời gian làm việc hiện tại
  const calculateWorkingTime = (): string => {
    if (!attendance?.originalCheckIn) return "0h 0m";
    const checkInTime = new Date(attendance.originalCheckIn);
    const endTime = attendance.originalCheckOut
      ? new Date(attendance.originalCheckOut)
      : currentTime;
    const diffMinutes = Math.floor(
      (endTime.getTime() - checkInTime.getTime()) / (1000 * 60),
    );
    return formatMinutesToHours(Math.max(0, diffMinutes));
  };

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <GlassSection
      title={t("todayAttendance")}
      icon={<Clock className="h-4 w-4" />}
      headerAction={
        <StatusBadge
          hasCheckedIn={hasCheckedIn}
          hasCheckedOut={hasCheckedOut}
          isOnBreak={isOnBreak}
          t={t}
        />
      }
    >
      <div className="space-y-4">
        {/* Thời gian hiện tại */}
        <div className="text-center py-2">
          <p className="text-3xl font-bold tabular-nums">
            {currentTime.toLocaleTimeString(locale, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDateWithDayOfWeek(currentTime.toISOString(), locale)}
          </p>
        </div>

        <Separator />

        {/* Thông tin check-in/out */}
        {attendance && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <TimeInfo
              label={t("checkIn")}
              time={attendance.originalCheckIn}
              roundedTime={attendance.roundedCheckIn}
              icon={<LogIn className="h-4 w-4 text-green-600" />}
            />
            <TimeInfo
              label={t("checkOut")}
              time={attendance.originalCheckOut}
              roundedTime={attendance.roundedCheckOut}
              icon={<LogOut className="h-4 w-4 text-red-600" />}
            />
          </div>
        )}

        {/* Thống kê làm việc */}
        {attendance && hasCheckedIn && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <StatItem
                label={t("workingHours")}
                value={calculateWorkingTime()}
              />
              <StatItem
                label={t("overtime")}
                value={formatMinutesToHours(attendance.overtimeMinutes || 0)}
              />
              <StatItem
                label={t("breakTime")}
                value={formatMinutesToHours(attendance.totalBreakMinutes || 0)}
              />
              <StatItem
                label={t("netWorkingHours")}
                value={formatMinutesToHours(attendance.netWorkingMinutes || 0)}
              />
            </div>
          </>
        )}

        {/* Break Records */}
        {attendance?.breakRecords && attendance.breakRecords.length > 0 && (
          <>
            <Separator />
            <BreakRecordsList
              breakRecords={attendance.breakRecords}
              breakCompliant={attendance.breakCompliant}
              activeBreak={activeBreak}
              tBreak={tBreak}
              t={t}
            />
          </>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {!hasCheckedIn && (
            <Button
              className="col-span-2 h-12 bg-green-600 hover:bg-green-700"
              onClick={onCheckIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              {t("checkIn")}
            </Button>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <>
              {!isOnBreak ? (
                <>
                  <Button
                    className="h-12 bg-yellow-500 hover:bg-yellow-600"
                    onClick={onStartBreak}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Coffee className="h-5 w-5 mr-2" />
                    )}
                    {t("breakStart")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-12"
                    onClick={onCheckOut}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <LogOut className="h-5 w-5 mr-2" />
                    )}
                    {t("checkOut")}
                  </Button>
                </>
              ) : (
                <Button
                  className="col-span-2 h-12 bg-blue-600 hover:bg-blue-700"
                  onClick={() => activeBreak && onEndBreak(activeBreak.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Play className="h-5 w-5 mr-2" />
                  )}
                  {t("breakEnd")}
                </Button>
              )}
            </>
          )}

          {hasCheckedOut && (
            <div className="col-span-2 text-center py-4 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm">{t("status.checkedOut")}</p>
              <p className="text-xs mt-1">
                {t("workingHours")}: {calculateWorkingTime()}
              </p>
            </div>
          )}
        </div>

        {/* Late/Early warning */}
        {attendance &&
          (attendance.lateMinutes > 0 || attendance.earlyLeaveMinutes > 0) && (
            <div className="flex flex-wrap justify-center gap-2">
              {attendance.lateMinutes > 0 && (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-600"
                >
                  {t("lateMinutes")}: {attendance.lateMinutes}m
                </Badge>
              )}
              {attendance.earlyLeaveMinutes > 0 && (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-600"
                >
                  {t("earlyLeaveMinutes")}: {attendance.earlyLeaveMinutes}m
                </Badge>
              )}
            </div>
          )}
      </div>
    </GlassSection>
  );
}

// ============================================
// Sub Components
// ============================================

interface StatusBadgeProps {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  isOnBreak: boolean;
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function StatusBadge({
  hasCheckedIn,
  hasCheckedOut,
  isOnBreak,
  t,
}: StatusBadgeProps) {
  if (!hasCheckedIn) {
    return <Badge variant="secondary">{t("status.notCheckedIn")}</Badge>;
  }
  if (hasCheckedOut) {
    return <Badge variant="outline">{t("status.checkedOut")}</Badge>;
  }
  if (isOnBreak) {
    return <Badge className="bg-orange-500">{t("status.onBreak")}</Badge>;
  }
  return <Badge className="bg-green-600">{t("status.working")}</Badge>;
}

interface TimeInfoProps {
  label: string;
  time?: string;
  roundedTime?: string;
  icon: React.ReactNode;
}

function TimeInfo({ label, time, roundedTime, icon }: TimeInfoProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-lg font-semibold">{time ? formatTime(time) : "-"}</p>
      {roundedTime && time !== roundedTime && (
        <p className="text-xs text-muted-foreground">
          (→ {formatTime(roundedTime)})
        </p>
      )}
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

interface BreakRecordsListProps {
  breakRecords: BreakRecord[];
  breakCompliant: boolean;
  activeBreak: BreakRecord | null;
  tBreak: ReturnType<typeof useTranslations<"break">>;
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function BreakRecordsList({
  breakRecords,
  breakCompliant,
  activeBreak,
  tBreak,
  t,
}: BreakRecordsListProps) {
  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <Coffee className="h-4 w-4" />
          {t("breakTime")}
        </span>
        <ComplianceBadge isCompliant={breakCompliant} t={t} />
      </div>
      <div className="space-y-2">
        {sortedRecords.map((record) => (
          <BreakRecordItem
            key={record.id}
            record={record}
            isActive={activeBreak?.id === record.id}
            tBreak={tBreak}
          />
        ))}
      </div>
    </div>
  );
}

interface BreakRecordItemProps {
  record: BreakRecord;
  isActive: boolean;
  tBreak: ReturnType<typeof useTranslations<"break">>;
}

function BreakRecordItem({ record, isActive, tBreak }: BreakRecordItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg text-sm ${
        isActive
          ? "bg-orange-50 border border-orange-200 dark:bg-orange-950/20"
          : "bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            isActive ? "bg-orange-500 text-white" : "bg-primary/10 text-primary"
          }`}
        >
          {record.breakNumber}
        </div>
        <span>
          {formatTime(record.breakStart)} →{" "}
          {isActive ? (
            <span className="text-orange-600 font-medium">...</span>
          ) : (
            formatTime(record.breakEnd)
          )}
        </span>
        {isActive && (
          <Badge className="bg-orange-500 text-xs px-1.5 py-0">
            {tBreak("history.inProgress")}
          </Badge>
        )}
      </div>
      <span className="font-medium">{record.actualBreakMinutes}m</span>
    </div>
  );
}

interface ComplianceBadgeProps {
  isCompliant: boolean;
  t: ReturnType<typeof useTranslations<"attendance">>;
}

function ComplianceBadge({ isCompliant, t }: ComplianceBadgeProps) {
  if (isCompliant) {
    return (
      <Badge
        variant="outline"
        className="text-green-600 border-green-600 text-xs"
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {t("breakCompliant")}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-orange-600 border-orange-600 text-xs"
    >
      <AlertCircle className="h-3 w-3 mr-1" />
      {t("breakNonCompliant")}
    </Badge>
  );
}

// ============================================
// Skeleton
// ============================================

function CardSkeleton() {
  return (
    <GlassSection>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="text-center py-2">
          <Skeleton className="h-10 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto mt-2" />
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </GlassSection>
  );
}
