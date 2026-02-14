"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, FileEdit } from "lucide-react";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";
import {
  TimeSection,
  WorkingSummarySection,
  NightHoursSection,
  BreakRecordsSection,
  AppliedSettingsSection,
  ShiftInfoSection,
  AdjustmentHistorySection,
  AttendanceDialogSkeleton,
} from "@/app/[locale]/_components/_shared/attendance/_attendance-sections";
import { formatDateWithDayOfWeek } from "@/lib/utils/format-date-time";
import { getApprovers, ApproverInfo } from "@/lib/apis/company-employees";
import { departmentApi } from "@/lib/apis/department-api";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import { useAuth } from "@/hooks/use-auth";
import type {
  UnifiedAttendanceRecord,
  AdjustmentRequest,
} from "@/types/attendance-records";
import type { DefaultApprover } from "@/types/department";
import type { BreakConfig } from "@/types/attendance-config";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import { AdjustmentDialog } from "../../../../_components/_shared/attendance/_adjustment-dialog";

// ============================================
// Types
// ============================================

interface AttendanceDayDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  onOpenChange,
  attendance,
  adjustmentHistory = [],
  isLoading = false,
  onAdjustmentSubmitted,
}: AttendanceDayDetailDialogProps) {
  const t = useTranslations("attendance");
  const locale = useLocale() as SupportedLocale;
  const { user } = useAuth();

  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  // Data cho AdjustmentDialog
  const [approvers, setApprovers] = useState<ApproverInfo[]>([]);
  const [defaultApprover, setDefaultApprover] =
    useState<DefaultApprover | null>(null);
  const [breakConfig, setBreakConfig] = useState<BreakConfig | null>(null);

  // Fetch data cho dialog
  const fetchDialogData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const userId = user.id;
      const [approversData, defaultApproverData, breakConfigData] =
        await Promise.all([
          getApprovers(),
          departmentApi.getDefaultApprover(userId),
          companySettingsApi.getBreakConfig(),
        ]);
      setApprovers(approversData);
      setDefaultApprover(defaultApproverData);
      setBreakConfig(breakConfigData);
    } catch (error) {
      console.error("Error fetching dialog data:", error);
    }
  }, [user]);

  // Fetch dialog data khi mở adjustment dialog
  useEffect(() => {
    if (adjustmentDialogOpen && approvers.length === 0) {
      fetchDialogData(); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [adjustmentDialogOpen, approvers.length, fetchDialogData]);

  const handleOpenAdjustment = () => {
    onOpenChange(false);
    setAdjustmentDialogOpen(true);
  };

  const handleAdjustmentSuccess = () => {
    setAdjustmentDialogOpen(false);
    onAdjustmentSubmitted?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {attendance
                ? formatDateWithDayOfWeek(attendance.workDate, locale)
                : t("title")}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <AttendanceDialogSkeleton />
          ) : !attendance ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("messages.noRecords")}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mt-4">
                <AttendanceStatusBadge status={attendance.status} />
              </div>

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

              {attendance.breakRecords &&
                attendance.breakRecords.length > 0 && (
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

              {adjustmentHistory.length > 0 && (
                <>
                  <Separator />
                  <AdjustmentHistorySection
                    adjustments={adjustmentHistory}
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
          onOpenChange={setAdjustmentDialogOpen}
          onSuccess={handleAdjustmentSuccess}
          approvers={approvers}
          defaultApprover={defaultApprover}
          breakConfig={breakConfig}
        />
      )}
    </>
  );
}
