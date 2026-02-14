"use client";

import { useCallback } from "react";

import { PayslipDetailView } from "@/app/[locale]/_components/_shared/payroll/payslip-detail-view";
import { myPayslipApi } from "@/lib/apis/my-payslip-api";

interface PayslipDetailProps {
  itemId: number;
}

/**
 * Component chi tiết payslip cho employee portal
 * Sử dụng shared PayslipDetailView với myPayslipApi
 */
export function PayslipDetail({ itemId }: PayslipDetailProps) {
  const fetchDetail = useCallback(
    (id: number) => myPayslipApi.getPayslipDetail(id),
    [],
  );

  const downloadPdf = useCallback(
    (id: number) => myPayslipApi.downloadPayslipPdf(id),
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
