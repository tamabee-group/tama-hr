"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceDayDetail } from "../../_attendance-day-detail";
import { AdjustmentDialog } from "../../_adjustment-dialog";
import { BreakTimeline } from "../../_break-timeline";
import { unifiedAttendanceApi } from "@/lib/apis/unified-attendance-api";
import { adjustmentApi } from "@/lib/apis/adjustment-api";
import type {
  UnifiedAttendanceRecord,
  AdjustmentRequest,
} from "@/types/attendance-records";
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
  const t = useTranslations("common");
  const tBreak = useTranslations("break");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [record, setRecord] = React.useState<UnifiedAttendanceRecord | null>(
    null,
  );
  const [adjustmentRequests, setAdjustmentRequests] = React.useState<
    AdjustmentRequest[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] =
    React.useState(false);

  const currentDate = parseDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = isSameDay(currentDate, today);
  const canGoPrevious = true; // Có thể thêm logic giới hạn nếu cần
  const canGoNext = !isSameDay(currentDate, today);

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

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <Button
        variant="ghost"
        onClick={() => router.push(`/${locale}/dashboard/attendance/me`)}
        className="touch-manipulation"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("back")}
      </Button>

      {/* 2 columns layout on wide screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Day detail (2/3 width on lg) */}
        <div className="lg:col-span-2">
          <AttendanceDayDetail
            date={date}
            record={record}
            isLoading={isLoading}
            onRequestAdjustment={() => setIsAdjustmentDialogOpen(true)}
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Coffee className="h-4 w-4" />
                  {tBreak("history.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Coffee className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{tBreak("history.noRecords")}</p>
                </div>
              </CardContent>
            </Card>
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
        onClose={() => setIsAdjustmentDialogOpen(false)}
        onSuccess={handleAdjustmentSuccess}
      />
    </div>
  );
}
