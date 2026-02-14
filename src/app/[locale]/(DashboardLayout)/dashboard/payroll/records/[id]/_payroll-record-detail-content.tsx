"use client";

import { useCallback } from "react";

import { PayslipDetailView } from "@/app/[locale]/_components/_shared/payroll/payslip-detail-view";
import { payrollApi } from "@/lib/apis/payroll-period-api";

interface PayrollRecordDetailContentProps {
  itemId: number;
}

/**
 * Component chi tiết payroll record cho admin dashboard
 * Sử dụng shared PayslipDetailView với payrollApi (admin)
 */
export function PayrollRecordDetailContent({
  itemId,
}: PayrollRecordDetailContentProps) {
  const fetchDetail = useCallback(
    (id: number) => payrollApi.getPayrollItemDetail(id),
    [],
  );

  const downloadPdf = useCallback(
    (id: number) => payrollApi.downloadCompanyPayslipPdf(id),
    [],
  );

  return (
    <PayslipDetailView
      itemId={itemId}
      fetchDetail={fetchDetail}
      downloadPdf={downloadPdf}
    />
  );
}
