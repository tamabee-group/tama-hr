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
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { BreakTimeline } from "./_break-timeline";
import { BreakTimer } from "./_break-timer";
import { BreakAdjustmentDialog } from "./_break-adjustment-dialog";
import { formatDate, formatTime } from "@/lib/utils/format-date";
import type { AttendanceRecord, BreakRecord } from "@/types/attendance-records";
import type { BreakConfig } from "@/types/attendance-config";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface AttendanceDayDetailProps {
  date: string;
  record: AttendanceRecord | null;
  isLoading: boolean;
  onRequestAdjustment: () => void;
  breakRecords?: BreakRecord[];
  minimumBreakRequired?: number;
  // Props mới cho multiple breaks
  breakConfig?: BreakConfig;
  onStartBreak?: () => Promise<void>;
  onEndBreak?: (breakRecordId: number) => Promise<void>;
  onBreakAdjustmentSuccess?: () => void;
  // Kiểm tra có yêu cầu pending không
  hasPendingRequest?: boolean;
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
// AttendanceDayDetail Component
// ============================================

export function AttendanceDayDetail({
  date,
  record,
  isLoading,
  onRequestAdjustment,
  breakRecords = [],
  minimumBreakRequired = 0,
  breakConfig,
  onStartBreak,
  onEndBreak,
  onBreakAdjustmentSuccess,
  hasPendingRequest = false,
}: AttendanceDayDetailProps) {
  const t = useTranslations("attendance");
  const locale = useLocale() as SupportedLocale;

  // State cho break adjustment dialog
  const [selectedBreakForAdjustment, setSelectedBreakForAdjustment] =
    React.useState<BreakRecord | null>(null);

  // Tìm break đang active (chưa có breakEnd)
  const activeBreak = breakRecords.find((br) => !br.breakEnd);

  // Xử lý khi click vào break card trong timeline
  const handleBreakClick = (breakRecord: BreakRecord) => {
    // Chỉ cho phép điều chỉnh break đã hoàn thành
    if (breakRecord.breakEnd) {
      setSelectedBreakForAdjustment(breakRecord);
    }
  };

  // Xử lý khi adjustment thành công
  const handleAdjustmentSuccess = () => {
    setSelectedBreakForAdjustment(null);
    onBreakAdjustmentSuccess?.();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!record) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {formatDate(date, locale)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("messages.noRecords")}
          </div>
          {/* Cho phép yêu cầu điều chỉnh ngay cả khi không có record */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={onRequestAdjustment}
              disabled={hasPendingRequest}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t("requestAdjustment")}
            </Button>
            {hasPendingRequest && (
              <p className="text-sm text-muted-foreground">
                {t("adjustment.hasPendingRequest")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {formatDate(date, locale)}
        </CardTitle>
        <AttendanceStatusBadge status={record.status} />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Check-in/out times */}
        <div className="grid grid-cols-2 gap-4">
          <TimeCard
            icon={<LogIn className="h-5 w-5 text-green-600" />}
            label={t("table.checkInTime")}
            time={record.originalCheckIn}
            roundedTime={record.roundedCheckIn}
            roundedTimeLabel={t("roundedTime")}
            warning={
              record.lateMinutes > 0
                ? `${t("lateMinutes")}: ${record.lateMinutes}m`
                : undefined
            }
            warningType="late"
          />
          <TimeCard
            icon={<LogOut className="h-5 w-5 text-red-600" />}
            label={t("table.checkOutTime")}
            time={record.originalCheckOut}
            roundedTime={record.roundedCheckOut}
            roundedTimeLabel={t("roundedTime")}
            warning={
              record.earlyLeaveMinutes > 0
                ? `${t("earlyLeaveMinutes")}: ${record.earlyLeaveMinutes}m`
                : undefined
            }
            warningType="early"
          />
        </div>

        <Separator />

        {/* Working hours summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Timer className="h-4 w-4" />}
            label={t("workingHours")}
            value={formatMinutesToHours(record.workingMinutes)}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label={t("overtime")}
            value={
              record.overtimeMinutes > 0
                ? formatMinutesToHours(record.overtimeMinutes)
                : "-"
            }
            highlight={record.overtimeMinutes > 0}
          />
          <StatCard
            icon={<Coffee className="h-4 w-4" />}
            label={t("breakTime")}
            value={formatMinutesToHours(record.totalBreakMinutes)}
          />
          <StatCard
            icon={<Timer className="h-4 w-4" />}
            label={t("netWorkingHours")}
            value={formatMinutesToHours(record.netWorkingMinutes)}
          />
        </div>

        {/* Night hours if any */}
        {(record.nightMinutes > 0 || record.nightOvertimeMinutes > 0) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {record.nightMinutes > 0 && (
                <StatCard
                  icon={<Clock className="h-4 w-4" />}
                  label={t("table.nightHours")}
                  value={formatMinutesToHours(record.nightMinutes)}
                />
              )}
              {record.nightOvertimeMinutes > 0 && (
                <StatCard
                  icon={<Clock className="h-4 w-4" />}
                  label={t("table.nightOvertimeHours")}
                  value={formatMinutesToHours(record.nightOvertimeMinutes)}
                  highlight
                />
              )}
            </div>
          </>
        )}

        {/* Break compliance */}
        {record.totalBreakMinutes > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("breakStatus")}
              </span>
              {record.isBreakCompliant ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  {t("breakCompliant")}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-600"
                >
                  {t("breakNonCompliant")}
                </Badge>
              )}
            </div>
          </>
        )}

        {/* Break Timer - Hiển thị khi có breakConfig và đã check-in */}
        {breakConfig && record && onStartBreak && onEndBreak && (
          <>
            <Separator />
            <BreakTimer
              attendanceRecordId={record.id}
              breakConfig={breakConfig}
              currentBreak={activeBreak}
              breakRecords={breakRecords}
              onStartBreak={onStartBreak}
              onEndBreak={onEndBreak}
            />
          </>
        )}

        {/* Break Timeline - Thay thế BreakHistory */}
        {breakRecords.length > 0 && (
          <>
            <Separator />
            <BreakTimeline
              breakRecords={breakRecords}
              totalBreakMinutes={record.totalBreakMinutes}
              minimumRequired={minimumBreakRequired}
              maxBreaksPerDay={breakConfig?.maxBreaksPerDay ?? 3}
              isCompliant={record.isBreakCompliant}
              onBreakClick={handleBreakClick}
            />
          </>
        )}

        {/* Break Adjustment Dialog */}
        {selectedBreakForAdjustment && (
          <BreakAdjustmentDialog
            breakRecord={selectedBreakForAdjustment}
            otherBreaks={breakRecords.filter(
              (br) => br.id !== selectedBreakForAdjustment.id,
            )}
            open={!!selectedBreakForAdjustment}
            onClose={() => setSelectedBreakForAdjustment(null)}
            onSuccess={handleAdjustmentSuccess}
          />
        )}

        <Separator />

        {/* Request adjustment button */}
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="outline"
            onClick={onRequestAdjustment}
            disabled={hasPendingRequest}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("requestAdjustment")}
          </Button>
          {hasPendingRequest && (
            <p className="text-sm text-muted-foreground">
              {t("adjustment.hasPendingRequest")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// TimeCard Component
// ============================================

interface TimeCardProps {
  icon: React.ReactNode;
  label: string;
  time?: string;
  roundedTime?: string;
  roundedTimeLabel: string;
  warning?: string;
  warningType?: "late" | "early";
}

function TimeCard({
  icon,
  label,
  time,
  roundedTime,
  roundedTimeLabel,
  warning,
  warningType,
}: TimeCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{time ? formatTime(time) : "-"}</p>
      {roundedTime && time !== roundedTime && (
        <p className="text-xs text-muted-foreground">
          {roundedTimeLabel}: {formatTime(roundedTime)}
        </p>
      )}
      {warning && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs ${
            warningType === "late" ? "text-orange-600" : "text-yellow-600"
          }`}
        >
          <AlertTriangle className="h-3 w-3" />
          {warning}
        </div>
      )}
    </div>
  );
}

// ============================================
// StatCard Component
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, highlight }: StatCardProps) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={`text-lg font-semibold ${highlight ? "text-blue-600" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
