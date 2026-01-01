"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AttendanceDetail } from "@/app/[locale]/(AdminLayout)/company/attendance/_attendance-detail";

import { attendanceApi } from "@/lib/apis/attendance-api";
import { adjustmentApi } from "@/lib/apis/adjustment-api";
import {
  AttendanceRecord,
  AdjustmentRequest,
} from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AttendanceDetailContentProps {
  attendanceId: number;
}

/**
 * Client component cho trang chi tiết attendance
 * Fetch data và render AttendanceDetail
 */
export function AttendanceDetailContent({
  attendanceId,
}: AttendanceDetailContentProps) {
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [adjustmentHistory, setAdjustmentHistory] = useState<
    AdjustmentRequest[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch attendance record và adjustment history
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [attendanceData, adjustmentsData] = await Promise.all([
        attendanceApi.getAttendanceById(attendanceId),
        adjustmentApi.getAllAdjustments(0, 100, {}),
      ]);

      setRecord(attendanceData);

      // Filter adjustments cho attendance record này
      const relatedAdjustments = adjustmentsData.content.filter(
        (adj) => adj.attendanceRecordId === attendanceId,
      );
      setAdjustmentHistory(relatedAdjustments);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [attendanceId, tErrors]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle back
  const handleBack = () => {
    router.push(`/${locale}/company/attendance`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <span className="text-muted-foreground">{tCommon("noData")}</span>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {tCommon("back")}
      </Button>

      <AttendanceDetail record={record} adjustmentHistory={adjustmentHistory} />
    </div>
  );
}
