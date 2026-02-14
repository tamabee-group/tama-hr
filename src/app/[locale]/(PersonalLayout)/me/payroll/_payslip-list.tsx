"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { PayslipYearList } from "@/app/[locale]/_components/_shared/payroll/payslip-year-list";
import { myPayslipApi } from "@/lib/apis/my-payslip-api";
import { PayrollItem } from "@/types/attendance-records";
import { SupportedLocale } from "@/lib/utils/format-currency";

/**
 * Component danh sách payslip cho employee portal
 * Sử dụng shared PayslipYearList với myPayslipApi
 */
export function PayslipList() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // Fetch tất cả payslips của employee
  const fetchPayslips = useCallback(async () => {
    const response = await myPayslipApi.getMyPayslips(0, 100);
    return response.content;
  }, []);

  // Navigate đến trang chi tiết payslip
  const handleItemClick = useCallback(
    (payslip: PayrollItem) => {
      router.push(`/${locale}/me/payroll/${payslip.id}`);
    },
    [router, locale],
  );

  return (
    <PayslipYearList
      fetchPayslips={fetchPayslips}
      onItemClick={handleItemClick}
    />
  );
}
