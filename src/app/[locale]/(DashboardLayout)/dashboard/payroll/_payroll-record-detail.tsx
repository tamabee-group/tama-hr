"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PayslipCard } from "@/app/[locale]/_components/_shared/payslip-card";

import { payrollApi } from "@/lib/apis/payroll-period-api";
import { PayrollItem } from "@/types/attendance-records";

import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useAuth } from "@/hooks/use-auth";

interface PayrollRecordDetailProps {
  recordId: number;
}

/**
 * Component chi tiết bản ghi lương
 * Sử dụng PayslipCard với layout giống PDF
 */
export function PayrollRecordDetail({ recordId }: PayrollRecordDetailProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [record, setRecord] = useState<PayrollItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fetch record
  const fetchRecord = useCallback(async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getPayrollById(recordId);
      setRecord(data);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [recordId, tErrors]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // Handle download payslip
  const handleDownload = async () => {
    if (!record) return;
    setDownloading(true);
    try {
      const blob = await payrollApi.downloadCompanyPayslipPdf(record.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${record.employeeId}-${record.year}-${record.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("messages.exportSuccess"));
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setDownloading(false);
    }
  };

  // Handle back
  const handleBack = () => {
    router.back();
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
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground">{t("messages.noPayslip")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <Button onClick={handleDownload} disabled={downloading}>
          <Download className="h-4 w-4 mr-2" />
          {t("actions.downloadPayslip")}
        </Button>
      </div>

      {/* Payslip Card */}
      <PayslipCard
        payslip={record}
        companyName={user?.companyName}
        employeeName={record.employeeName}
      />
    </div>
  );
}
