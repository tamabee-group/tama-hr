"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Input } from "@/components/ui/input";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";

import { PayrollItem } from "@/types/attendance-records";
import { PayrollItemStatusBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date-time";

import { payrollPeriodApi } from "@/lib/apis/payroll-period-api";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { toast } from "sonner";
import { PayrollItemDetailDialog } from "../payroll/[period]/_payroll-item-detail-dialog";

/**
 * Trang hiển thị tất cả payslips của công ty
 */
export function PayslipPageContent() {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [payslips, setPayslips] = useState<PayrollItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedItem, setSelectedItem] = useState<PayrollItem | null>(null);
  const [searchEmployeeId, setSearchEmployeeId] = useState("");

  // Fetch payslips
  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const employeeIdFilter = searchEmployeeId
          ? parseInt(searchEmployeeId)
          : undefined;
        const response = await payrollPeriodApi.getAllCompanyPayslips(
          page,
          50,
          employeeIdFilter,
          "PAID", // Chỉ hiển thị payslips đã thanh toán
        );
        setPayslips(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        toast.error(getErrorMessage((error as Error).message, tErrors));
      }
    };

    fetchPayslips();
  }, [page, searchEmployeeId, tErrors]);

  // Define columns
  const columns: ColumnDef<PayrollItem>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * 50 + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "employeeId",
      header: t("table.employee"),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{item.employeeName}</span>
            <span className="text-xs text-muted-foreground">
              {item.employeeCode}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "payrollPeriodId",
      header: t("period"),
      cell: ({ row }) => {
        const item = row.original;
        if (item.year && item.month) {
          return `${String(item.month).padStart(2, "0")}/${item.year}`;
        }
        return "-";
      },
    },
    {
      accessorKey: "paidAt",
      header: t("table.paidAt"),
      cell: ({ row }) => {
        const paidAt = row.original.paidAt;
        if (!paidAt) return "-";
        return formatDate(paidAt);
      },
    },
    {
      accessorKey: "baseSalary",
      header: t("table.baseSalary"),
      cell: ({ row }) => formatCurrency(row.original.calculatedBaseSalary),
    },
    {
      accessorKey: "totalOvertimePay",
      header: t("table.overtime"),
      cell: ({ row }) => {
        const overtime = row.original.totalOvertimePay;
        if (!overtime || overtime === 0) return "-";
        return (
          <span className="text-blue-600">{formatCurrency(overtime)}</span>
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
          <span className="text-green-600">{formatCurrency(allowances)}</span>
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
          <span className="text-red-600">-{formatCurrency(deductions)}</span>
        );
      },
    },
    {
      accessorKey: "netSalary",
      header: t("table.netSalary"),
      cell: ({ row }) => (
        <span className="font-bold text-green-600">
          {formatCurrency(row.original.netSalary)}
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
  ];

  return (
    <div className="space-y-6">
      <GlassSection title={t("payslipHistory")}>
        {/* Filters */}
        <div className="mb-4 flex gap-4">
          <Input
            placeholder={t("table.employee")}
            value={searchEmployeeId}
            onChange={(e) => setSearchEmployeeId(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Table */}
        <BaseTable
          columns={columns}
          data={payslips}
          onRowClick={(item) => setSelectedItem(item)}
          serverPagination={{
            page,
            totalPages,
            totalElements,
            onPageChange: setPage,
          }}
          noResultsText={tCommon("noData")}
        />
      </GlassSection>

      {/* Item Detail Dialog */}
      {selectedItem && (
        <PayrollItemDetailDialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      )}
    </div>
  );
}
