"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { GlassAttendanceDetail } from "@/app/[locale]/_components/_shared/attendance";
import { AdjustmentDialog } from "@/app/[locale]/_components/_shared/attendance/_adjustment-dialog";

import { attendanceApi } from "@/lib/apis/attendance-api";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { UnifiedAttendanceRecord } from "@/types/attendance-records";

interface AttendanceDetailContentProps {
  date: string;
  employeeId?: number;
}

export function AttendanceDetailContent({
  date,
  employeeId,
}: AttendanceDetailContentProps) {
  const tErrors = useTranslations("errors");

  const [record, setRecord] = React.useState<UnifiedAttendanceRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Fetch attendance record theo employeeId + date
  const fetchData = React.useCallback(async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const data = await attendanceApi.getEmployeeAttendanceByDate(
        employeeId,
        date,
      );
      setRecord(data as UnifiedAttendanceRecord | null);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, date, tErrors]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <BackButton />

      <GlassAttendanceDetail
        mode="manager"
        date={date}
        record={record}
        isLoading={isLoading}
        onEdit={() => setIsEditDialogOpen(true)}
      />

      <AdjustmentDialog
        mode="manager"
        record={record}
        date={date}
        employeeId={employeeId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}
