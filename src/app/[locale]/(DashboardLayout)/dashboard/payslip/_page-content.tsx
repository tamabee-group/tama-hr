"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText } from "lucide-react";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PayrollItem } from "@/types/attendance-records";
import { PayrollItemStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { formatCurrency } from "@/lib/utils/format-currency";

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
  const router = useRouter();

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
          undefined,
        );
        setPayslips(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        toast.error(getErrorMessage((error as Error).message, tErrors));
      } finally {
        // setLoading(false);
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
      cell: ({ row }) => `${row.original.payrollPeriodId}`,
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
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedItem(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(
                `/dashboard/employees/${row.original.employeeId}?tab=salary`,
              )
            }
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 100,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("payslipHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
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
            serverPagination={{
              page,
              totalPages,
              totalElements,
              onPageChange: setPage,
            }}
            noResultsText={tCommon("noData")}
          />
        </CardContent>
      </Card>

      {/* Item Detail Dialog */}
      {selectedItem && (
        <PayrollItemDetailDialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          periodId={selectedItem.payrollPeriodId}
          item={selectedItem}
        />
      )}
    </div>
  );
}
