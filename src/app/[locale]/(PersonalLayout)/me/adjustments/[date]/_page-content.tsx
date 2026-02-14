"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Coffee } from "lucide-react";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { AttendanceDayDetail } from "@/app/[locale]/_components/_shared";
import { AdjustmentDialog } from "../../../../_components/_shared/attendance/_adjustment-dialog";
import { BreakTimeline } from "../../attendance/[date]/_break-timeline";
import { unifiedAttendanceApi } from "@/lib/apis/unified-attendance-api";
import { adjustmentApi } from "@/lib/apis/adjustment-api";
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
import { AdjustmentRequestCard } from "./_adjustment-request-card";

// ============================================
// Types
// ============================================

interface AttendanceDayDetailContentProps {
  date: string;
}

// ============================================
// Utilities
// ============================================

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// ============================================
// AttendanceDayDetailContent Component
// ============================================

export function AttendanceDayDetailContent({
  date,
}: AttendanceDayDetailContentProps) {
  const tBreak = useTranslations("break");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const { user } = useAuth();

  const [record, setRecord] = React.useState<UnifiedAttendanceRecord | null>(
    null,
  );
  const [adjustmentRequests, setAdjustmentRequests] = React.useState<
    AdjustmentRequest[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] =
    React.useState(false);

  // Data cho AdjustmentDialog
  const [approvers, setApprovers] = React.useState<ApproverInfo[]>([]);
  const [defaultApprover, setDefaultApprover] =
    React.useState<DefaultApprover | null>(null);
  const [breakConfig, setBreakConfig] = React.useState<BreakConfig | null>(
    null,
  );

  const currentDate = parseDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = isSameDay(currentDate, today);
  const canGoPrevious = true; // Có thể thêm logic giới hạn nếu cần
  const canGoNext = true;

  // Xử lý chuyển ngày
  const handleDateChange = React.useCallback(
    (newDate: Date) => {
      const dateStr = formatDateToString(newDate);
      router.push(`/${locale}/dashboard/attendance/me/${dateStr}`);
    },
    [locale, router],
  );

  const handlePreviousDay = React.useCallback(() => {
    handleDateChange(addDays(currentDate, -1));
  }, [currentDate, handleDateChange]);

  const handleNextDay = React.useCallback(() => {
    if (canGoNext) {
      handleDateChange(addDays(currentDate, 1));
    }
  }, [currentDate, canGoNext, handleDateChange]);

  // Fetch attendance record và adjustment requests cho ngày cụ thể
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch unified attendance record (bao gồm breakRecords và appliedSettings)
      const attendanceData =
        await unifiedAttendanceApi.getAttendanceByDate(date);
      setRecord(attendanceData);

      // Fetch adjustment requests cho ngày này
      const adjustments = await adjustmentApi.getMyAdjustmentsByDate(date);
      setAdjustmentRequests(adjustments);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  // Fetch data cho dialog (chỉ khi mở dialog)
  const fetchDialogData = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const [approversData, defaultApproverData, breakConfigData] =
        await Promise.all([
          getApprovers(),
          departmentApi.getDefaultApprover(user.id),
          companySettingsApi.getBreakConfig(),
        ]);
      setApprovers(approversData);
      setDefaultApprover(defaultApproverData);
      setBreakConfig(breakConfigData);
    } catch (error) {
      console.error("Error fetching dialog data:", error);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch dialog data khi mở dialog
  React.useEffect(() => {
    if (isAdjustmentDialogOpen && approvers.length === 0) {
      fetchDialogData();
    }
  }, [isAdjustmentDialogOpen, approvers.length, fetchDialogData]);

  // Xử lý khi yêu cầu điều chỉnh thành công
  const handleAdjustmentSuccess = () => {
    setIsAdjustmentDialogOpen(false);
    // Refresh data
    fetchData();
  };

  // Kiểm tra có yêu cầu pending không
  const hasPendingRequest = adjustmentRequests.some(
    (req) => req.status === "PENDING",
  );

  // Lấy minimumBreakRequired từ appliedSettings
  const minimumBreakRequired =
    record?.appliedSettings?.breakConfig?.legalMinimumBreakMinutes ?? 0;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <BackButton />

      {/* 2 columns layout on wide screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Day detail (2/3 width on lg) */}
        <div className="lg:col-span-2">
          <AttendanceDayDetail
            date={date}
            record={record}
            isLoading={isLoading}
            mode="employee"
            onAction={() => setIsAdjustmentDialogOpen(true)}
            minimumBreakRequired={minimumBreakRequired}
            hasPendingRequest={hasPendingRequest}
            hideBreakTimeline
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            isToday={isToday}
          />
        </div>

        {/* Right column - Break history (1/3 width on lg) */}
        <div className="lg:col-span-1">
          {record && record.breakRecords && record.breakRecords.length > 0 ? (
            <BreakTimeline
              breakRecords={record.breakRecords}
              totalBreakMinutes={record.totalBreakMinutes}
              minimumRequired={minimumBreakRequired}
              maxBreaksPerDay={
                record.appliedSettings?.breakConfig?.maxBreaksPerDay ?? 3
              }
              isCompliant={record.breakCompliant}
            />
          ) : (
            <GlassSection
              title={tBreak("history.title")}
              icon={<Coffee className="h-4 w-4" />}
            >
              <div className="text-center py-8 text-muted-foreground">
                <Coffee className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{tBreak("history.noRecords")}</p>
              </div>
            </GlassSection>
          )}
        </div>
      </div>

      {/* Adjustment requests - full width below */}
      {adjustmentRequests.length > 0 && (
        <AdjustmentRequestCard
          requests={adjustmentRequests}
          onCancelSuccess={fetchData}
        />
      )}

      {/* Adjustment dialog - cho phép mở ngay cả khi không có record */}
      <AdjustmentDialog
        record={record}
        date={date}
        open={isAdjustmentDialogOpen}
        onOpenChange={setIsAdjustmentDialogOpen}
        onSuccess={handleAdjustmentSuccess}
        approvers={approvers}
        defaultApprover={defaultApprover}
        breakConfig={breakConfig}
      />
    </div>
  );
}
