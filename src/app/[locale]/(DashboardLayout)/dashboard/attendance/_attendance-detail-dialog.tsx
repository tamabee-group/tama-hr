"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Clock } from "lucide-react";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";
import {
  TimeSection,
  WorkingSummarySection,
  NightHoursSection,
  BreakRecordsSection,
  AppliedSettingsSection,
  ShiftInfoSection,
  AdjustmentHistorySection,
} from "@/app/[locale]/_components/_shared/attendance/_attendance-sections";
import { formatDateWithDayOfWeek } from "@/lib/utils/format-date-time";
import { unifiedAttendanceApi } from "@/lib/apis/unified-attendance-api";
import type {
  UnifiedAttendanceRecord,
  AdjustmentRequest,
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
// Main Component
// ============================================

export function AttendanceDetailDialog({
  open,
  onClose,
  attendance,
}: AttendanceDetailDialogProps) {
  const t = useTranslations("attendance");
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
              ? `${attendance.employeeName} - ${formatDateWithDayOfWeek(attendance.workDate, locale)}`
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
            <TimeSection attendance={attendance} locale={locale} />

            <Separator />
            <WorkingSummarySection attendance={attendance} locale={locale} />

            {(attendance.nightMinutes > 0 ||
              attendance.nightOvertimeMinutes > 0) && (
              <>
                <Separator />
                <NightHoursSection attendance={attendance} locale={locale} />
              </>
            )}

            {attendance.breakRecords && attendance.breakRecords.length > 0 && (
              <>
                <Separator />
                <BreakRecordsSection
                  breakRecords={attendance.breakRecords}
                  totalBreakMinutes={attendance.totalBreakMinutes}
                  effectiveBreakMinutes={attendance.effectiveBreakMinutes}
                  breakCompliant={attendance.breakCompliant}
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
                />
              </>
            )}

            {attendance.shiftInfo && (
              <>
                <Separator />
                <ShiftInfoSection attendance={attendance} locale={locale} />
              </>
            )}

            <Separator />
            <AdjustmentHistorySection
              adjustments={adjustmentHistory}
              locale={locale}
              isLoading={loadingHistory}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
