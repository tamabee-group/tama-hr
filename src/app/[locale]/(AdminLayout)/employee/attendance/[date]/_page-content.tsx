"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendanceDayDetail } from "../_attendance-day-detail";
import { AdjustmentDialog } from "../_adjustment-dialog";
import { SwipeDayNavigator } from "../_swipe-day-navigator";
import { attendanceApi } from "@/lib/apis/attendance-api";
import { adjustmentApi } from "@/lib/apis/adjustment-api";
import type {
  AttendanceRecord,
  BreakRecord,
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

// ============================================
// AttendanceDayDetailContent Component
// ============================================

export function AttendanceDayDetailContent({
  date,
}: AttendanceDayDetailContentProps) {
  const t = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [record, setRecord] = React.useState<AttendanceRecord | null>(null);
  const [breakRecords] = React.useState<BreakRecord[]>([]);
  const [minimumBreakRequired] = React.useState(0);
  const [adjustmentRequests, setAdjustmentRequests] = React.useState<
    AdjustmentRequest[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] =
    React.useState(false);

  const currentDate = parseDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Xử lý chuyển ngày
  const handleDateChange = React.useCallback(
    (newDate: Date) => {
      const dateStr = formatDateToString(newDate);
      router.push(`/${locale}/employee/attendance/${dateStr}`);
    },
    [locale, router],
  );

  // Fetch attendance record và adjustment requests cho ngày cụ thể
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch attendance record
      const attendanceData = await attendanceApi.getMyAttendanceByDate(date);
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

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/${locale}/employee/attendance`)}
        className="touch-manipulation"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("back")}
      </Button>

      {/* Swipe navigation wrapper */}
      <SwipeDayNavigator
        currentDate={currentDate}
        onDateChange={handleDateChange}
        locale={locale}
        maxDate={today}
      >
        {/* Day detail */}
        <AttendanceDayDetail
          date={date}
          record={record}
          isLoading={isLoading}
          onRequestAdjustment={() => setIsAdjustmentDialogOpen(true)}
          breakRecords={breakRecords}
          minimumBreakRequired={minimumBreakRequired}
          hasPendingRequest={hasPendingRequest}
        />
      </SwipeDayNavigator>

      {/* Adjustment requests for this day */}
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
