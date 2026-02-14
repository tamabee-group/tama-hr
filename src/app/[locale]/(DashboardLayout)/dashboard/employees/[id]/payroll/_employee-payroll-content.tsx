"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { PayslipYearList } from "@/app/[locale]/_components/_shared/payroll/payslip-year-list";
import { payrollApi } from "@/lib/apis/payroll-period-api";
import { PayrollItem } from "@/types/attendance-records";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface EmployeePayrollContentProps {
  employeeId: number;
}

/**
 * Component hiển thị danh sách payslip của employee (admin view)
 * Sử dụng shared PayslipYearList với payrollApi
 */
export function EmployeePayrollContent({
  employeeId,
}: EmployeePayrollContentProps) {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // Fetch payslips qua admin API (chỉ lấy PAID)
  const fetchPayslips = useCallback(async () => {
    const response = await payrollApi.getEmployeePayrollHistory(
      employeeId,
      0,
      100,
      "PAID",
    );
    return response.content;
  }, [employeeId]);

  // Navigate đến trang chi tiết payroll record (admin)
  const handleItemClick = useCallback(
    (payslip: PayrollItem) => {
      router.push(`/${locale}/dashboard/payroll/records/${payslip.id}`);
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
