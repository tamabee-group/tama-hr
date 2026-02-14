"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Button } from "@/components/ui/button";

import { PayrollItem } from "@/types/attendance-records";
import { PayrollItemStatusBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";
import { formatPayslip } from "@/lib/utils/format-currency";
import { useAuth } from "@/hooks/use-auth";

import { payrollPeriodApi } from "@/lib/apis/payroll-period-api";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { toast } from "sonner";
import { PayrollItemDetailDialog } from "@/app/[locale]/(DashboardLayout)/dashboard/payroll/[period]/_payroll-item-detail-dialog";

interface PayslipHistoryTableProps {
  employeeId: number;
}

/**
 * Component hiển thị lịch sử payslip của nhân viên
 */
export function PayslipHistoryTable({ employeeId }: PayslipHistoryTableProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const { user } = useAuth();
  const companyLocale = user?.locale || "ja_JP";

  const [payslips, setPayslips] = useState<PayrollItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItem, setSelectedItem] = useState<PayrollItem | null>(null);

  // Fetch payslips
  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await payrollPeriodApi.getEmployeePayslips(
          employeeId,
          page,
          20,
        );
        setPayslips(response.content);
        setTotalPages(response.totalPages);
      } catch (error) {
        toast.error(getErrorMessage((error as Error).message, tErrors));
      } finally {
        // setLoading(false);
      }
    };

    fetchPayslips();
  }, [employeeId, page, tErrors]);

  // Define columns
  const columns: ColumnDef<PayrollItem>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * 20 + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "payrollPeriodId",
      header: t("period"),
      cell: ({ row }) => {
        // Giả sử có thông tin period trong item
        return `${row.original.payrollPeriodId}`;
      },
    },
    {
      accessorKey: "baseSalary",
      header: t("table.baseSalary"),
      cell: ({ row }) =>
        formatPayslip(row.original.calculatedBaseSalary, companyLocale),
    },
    {
      accessorKey: "totalOvertimePay",
      header: t("table.overtime"),
      cell: ({ row }) => {
        const overtime = row.original.totalOvertimePay;
        if (!overtime || overtime === 0) return "-";
        return (
          <span className="text-blue-600">
            {formatPayslip(overtime, companyLocale)}
          </span>
        );
      },
    },
    {
      accessorKey: "totalAllowances",
      header: t("table.allowances"),
      cell: ({ row }) => {
        const allowances = row.original.totalAllowances;
        if (!allowances || allowances === 0) return "-";
        return (
          <span className="text-green-600">
            {formatPayslip(allowances, companyLocale)}
          </span>
        );
      },
    },
    {
      accessorKey: "totalDeductions",
      header: t("table.deductions"),
      cell: ({ row }) => {
        const deductions = row.original.totalDeductions;
        if (!deductions || deductions === 0) return "-";
        return (
          <span className="text-red-600">
            -{formatPayslip(deductions, companyLocale)}
          </span>
        );
      },
    },
    {
      accessorKey: "netSalary",
      header: t("table.netSalary"),
      cell: ({ row }) => (
        <span className="font-bold text-green-600">
          {formatPayslip(row.original.netSalary, companyLocale)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => (
        <PayrollItemStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedItem(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      size: 80,
    },
  ];

  return (
    <>
      <BaseTable
        columns={columns}
        data={payslips}
        serverPagination={{
          page,
          totalPages,
          totalElements: payslips.length,
          onPageChange: setPage,
        }}
        noResultsText={tCommon("noData")}
      />

      {/* Item Detail Dialog */}
      {selectedItem && (
        <PayrollItemDetailDialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      )}
    </>
  );
}
