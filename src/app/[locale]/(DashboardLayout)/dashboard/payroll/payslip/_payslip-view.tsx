"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PayslipCard } from "@/app/[locale]/_components/_shared/payslip-card";

import { payrollApi } from "@/lib/apis/payroll-api";
import { PayrollRecord } from "@/types/attendance-records";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useAuth } from "@/hooks/use-auth";

interface PayslipViewProps {
  year: number;
  month: number;
}

/**
 * Component hiển thị chi tiết phiếu lương của nhân viên
 * Sử dụng PayslipCard với layout giống PDF
 */
export function PayslipView({ year, month }: PayslipViewProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [payslip, setPayslip] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fetch payslip
  const fetchPayslip = useCallback(async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getMyPayslipByPeriod({ year, month });
      setPayslip(data);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [year, month, tErrors]);

  useEffect(() => {
    fetchPayslip();
  }, [fetchPayslip]);

  // Handle download PDF
  const handleDownload = async () => {
    if (!payslip) return;
    setDownloading(true);
    try {
      const blob = await payrollApi.downloadPayslipPdf(payslip.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${year}-${month}.pdf`;
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
    router.push(`/${locale}/dashboard/payroll/payslip`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  if (!payslip) {
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
        payslip={payslip}
        companyName={user?.companyName || ""}
        employeeCode={user?.employeeCode || ""}
        employeeName={user?.profile?.name || ""}
      />
    </div>
  );
}
