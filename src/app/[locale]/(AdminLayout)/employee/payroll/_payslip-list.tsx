"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PayslipTable } from "@/app/[locale]/_components/_shared/payslip-table";

import { payrollApi } from "@/lib/apis/payroll-api";
import { PayrollRecord } from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { SupportedLocale } from "@/lib/utils/format-currency";

/**
 * Component danh sách phiếu lương của nhân viên
 * Sử dụng PayslipTable shared component
 */
export function PayslipList() {
  const t = useTranslations("payroll");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Fetch payslips
  const fetchPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await payrollApi.getMyPayslips(0, 100);
      setPayslips(response.content);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [tErrors]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  // Handle view detail
  const handleViewDetail = (payslip: PayrollRecord) => {
    const period = `${payslip.year}-${String(payslip.month).padStart(2, "0")}`;
    router.push(`/${locale}/employee/payroll/${period}`);
  };

  // Handle download PDF
  const handleDownload = async (payslip: PayrollRecord) => {
    setDownloadingId(payslip.id);
    try {
      const blob = await payrollApi.downloadPayslipPdf(payslip.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${payslip.year}-${payslip.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("messages.exportSuccess"));
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <PayslipTable
      payslips={payslips}
      onViewDetail={handleViewDetail}
      onDownload={handleDownload}
      downloadingId={downloadingId}
      loading={loading}
    />
  );
}
