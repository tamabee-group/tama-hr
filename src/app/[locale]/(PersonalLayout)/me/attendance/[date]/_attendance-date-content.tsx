"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { GlassAttendanceDetail } from "@/app/[locale]/_components/_shared/attendance";
import { AdjustmentDialog } from "../../../../_components/_shared/attendance/_adjustment-dialog";
import { ViewAdjustmentDialog } from "./_view-adjustment-dialog";
import { unifiedAttendanceApi } from "@/lib/apis/unified-attendance-api";
import { getApprovers, ApproverInfo } from "@/lib/apis/company-employees";
import { departmentApi } from "@/lib/apis/department-api";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { formatDateForApi } from "@/lib/utils/format-date-time";
import type {
  UnifiedAttendanceRecord,
  AdjustmentRequest,
} from "@/types/attendance-records";
import type { DefaultApprover } from "@/types/department";
import type { BreakConfig } from "@/types/attendance-config";

// ============================================
// Types
// ============================================

interface AttendanceDateContentProps {
  date: string;
}

// ============================================
// Component
// ============================================

export function AttendanceDateContent({ date }: AttendanceDateContentProps) {
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [record, setRecord] = React.useState<UnifiedAttendanceRecord | null>(
    null,
  );
  const [adjustmentRequests, setAdjustmentRequests] = React.useState<
    AdjustmentRequest[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = React.useState(false);
  const [showViewDialog, setShowViewDialog] = React.useState(false);
  const [selectedRequest, setSelectedRequest] =
    React.useState<AdjustmentRequest | null>(null);

  // Data cho AdjustmentDialog
  const [approvers, setApprovers] = React.useState<ApproverInfo[]>([]);
  const [defaultApprover, setDefaultApprover] =
    React.useState<DefaultApprover | null>(null);
  const [breakConfig, setBreakConfig] = React.useState<BreakConfig | null>(
    null,
  );

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [attendanceData, adjustmentData] = await Promise.all([
        unifiedAttendanceApi.getAttendanceByDate(date),
        unifiedAttendanceApi.getAdjustmentRequestsByDate(date),
      ]);
      setRecord(attendanceData);
      setAdjustmentRequests(adjustmentData);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [date, tErrors]);

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
    if (showAdjustmentDialog && approvers.length === 0) {
      fetchDialogData();
    }
  }, [showAdjustmentDialog, approvers.length, fetchDialogData]);

  // Navigation
  const handlePreviousDay = () => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() - 1);
    const prevDate = formatDateForApi(currentDate);
    router.push(`/${locale}/me/attendance/${prevDate}`);
  };

  const handleNextDay = () => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDate = formatDateForApi(currentDate);
    router.push(`/${locale}/me/attendance/${nextDate}`);
  };

  // Xem chi tiết yêu cầu điều chỉnh
  const handleViewRequest = (request: AdjustmentRequest) => {
    setSelectedRequest(request);
    setShowViewDialog(true);
  };

  // Kiểm tra ngày hôm nay
  const today = formatDateForApi(new Date()) || "";
  const isToday = date === today;
  const canGoNext = date <= today;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <BackButton />

      {/* Glass Detail */}
      <GlassAttendanceDetail
        mode="employee"
        date={date}
        record={record}
        isLoading={loading}
        adjustmentRequests={adjustmentRequests}
        onCreateRequest={() => setShowAdjustmentDialog(true)}
        onViewRequest={handleViewRequest}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        canGoPrevious={true}
        canGoNext={canGoNext}
        isToday={isToday}
      />

      {/* Adjustment Dialog - tạo mới */}
      <AdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        date={date}
        record={record}
        onSuccess={fetchData}
        approvers={approvers}
        defaultApprover={defaultApprover}
        breakConfig={breakConfig}
      />

      {/* View Adjustment Dialog - xem chi tiết */}
      <ViewAdjustmentDialog
        request={selectedRequest}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        onCancelSuccess={fetchData}
      />
    </div>
  );
}
