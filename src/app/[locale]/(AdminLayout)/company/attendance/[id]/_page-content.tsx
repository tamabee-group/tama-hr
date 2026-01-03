"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Coffee } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceDayDetail } from "@/app/[locale]/_components/_shared/attendance-day-detail";
import { BreakTimeline } from "@/app/[locale]/(AdminLayout)/employee/attendance/_break-timeline";
import { EditAttendanceDialog } from "./_edit-attendance-dialog";

import { apiClient } from "@/lib/utils/fetch-client";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { UnifiedAttendanceRecord } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AttendanceDetailContentProps {
  attendanceId: number;
}

export function AttendanceDetailContent({
  attendanceId,
}: AttendanceDetailContentProps) {
  const tCommon = useTranslations("common");
  const tBreak = useTranslations("break");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [record, setRecord] = React.useState<UnifiedAttendanceRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Fetch attendance record by ID
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<UnifiedAttendanceRecord>(
        `/api/company/attendance/${attendanceId}`,
      );
      setRecord(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setIsLoading(false);
    }
  }, [attendanceId, tErrors]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle edit action
  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    fetchData();
  };

  // Lấy minimumBreakRequired từ appliedSettings
  const minimumBreakRequired =
    record?.appliedSettings?.breakConfig?.legalMinimumBreakMinutes ?? 0;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/${locale}/company/attendance`)}
        className="touch-manipulation"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {tCommon("back")}
      </Button>

      {/* 2 columns layout on wide screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Day detail (2/3 width on lg) */}
        <div className="lg:col-span-2">
          <AttendanceDayDetail
            date={record?.workDate || ""}
            record={record}
            isLoading={isLoading}
            mode="manager"
            onAction={handleEdit}
            employeeName={record?.employeeName}
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

      {/* Edit Dialog */}
      <EditAttendanceDialog
        record={record}
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
