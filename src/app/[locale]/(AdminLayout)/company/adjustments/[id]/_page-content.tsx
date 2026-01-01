"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdjustmentDetail } from "@/app/[locale]/(AdminLayout)/company/adjustments/_adjustment-detail";
import { adjustmentApi } from "@/lib/apis/adjustment-api";
import { AdjustmentRequest } from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AdjustmentDetailContentProps {
  adjustmentId: number;
}

/**
 * Client component wrapper cho AdjustmentDetail
 * Fetch data và xử lý approve/reject
 */
export function AdjustmentDetailContent({
  adjustmentId,
}: AdjustmentDetailContentProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [request, setRequest] = useState<AdjustmentRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch adjustment request
  const fetchRequest = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adjustmentApi.getAdjustmentById(adjustmentId);
      setRequest(data);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [adjustmentId, tErrors]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  // Handle approve
  const handleApprove = async (comment?: string) => {
    try {
      await adjustmentApi.approveAdjustment(adjustmentId, { comment });
      toast.success(t("adjustment.approveSuccess"));
      router.push(`/${locale}/company/adjustments`);
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    }
  };

  // Handle reject
  const handleReject = async (reason: string) => {
    try {
      await adjustmentApi.rejectAdjustment(adjustmentId, { reason });
      toast.success(t("adjustment.rejectSuccess"));
      router.push(`/${locale}/company/adjustments`);
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    }
  };

  // Handle back
  const handleBack = () => {
    router.push(`/${locale}/company/adjustments`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">
          {t("adjustment.noRequests")}
        </span>
      </div>
    );
  }

  return (
    <AdjustmentDetail
      request={request}
      onApprove={handleApprove}
      onReject={handleReject}
      onBack={handleBack}
    />
  );
}
