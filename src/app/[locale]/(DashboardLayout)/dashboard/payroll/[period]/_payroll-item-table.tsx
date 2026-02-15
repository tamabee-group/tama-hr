"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Badge } from "@/components/ui/badge";

import { PayrollItem } from "@/types/attendance-records";
import {
  PayrollPeriodStatus,
  PayrollItemStatus,
} from "@/types/attendance-enums";
import { formatPayslip } from "@/lib/utils/format-currency";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { PayrollItemDetailDialog } from "./_payroll-item-detail-dialog";
import { PayrollAdjustmentDialog } from "./_payroll-adjustment-dialog";
import { useAuth } from "@/hooks/use-auth";

interface PayrollItemTableProps {
  periodId: number;
  items: PayrollItem[];
  periodStatus: PayrollPeriodStatus;
  onRefresh: () => void;
}

// Map item status to badge variant
const getItemStatusBadgeVariant = (
  status: PayrollItemStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "CONFIRMED":
      return "default";
    case "ADJUSTED":
      return "secondary";
    case "CALCULATED":
    default:
      return "outline";
  }
};

/**
 * Component bảng danh sách payroll items
 * Hiển thị breakdown columns và actions
 */
export function PayrollItemTable({
  periodId,
  items,
  periodStatus,
  onRefresh,
}: PayrollItemTableProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const { user } = useAuth();
  const companyLocale = user?.locale || "vi";

  // Dialog state
  const [selectedItem, setSelectedItem] = useState<PayrollItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<PayrollItem | null>(null);

  // Check if period is locked
  const isLocked = periodStatus === "APPROVED" || periodStatus === "PAID";

  // Define columns
  const columns: ColumnDef<PayrollItem>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 60,
    },
    {
      accessorKey: "employeeName",
      header: t("table.employee"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeName}</span>
      ),
    },
    {
      accessorKey: "salaryType",
      header: t("table.salaryType"),
      cell: ({ row }) =>
        getEnumLabel("salaryType", row.original.salaryType, tEnums),
    },
    {
      accessorKey: "calculatedBaseSalary",
      header: t("table.calculatedSalary"),
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
      accessorKey: "grossSalary",
      header: t("table.grossSalary"),
      cell: ({ row }) => formatPayslip(row.original.grossSalary, companyLocale),
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
        <Badge variant={getItemStatusBadgeVariant(row.original.status)}>
          {getEnumLabel("payrollItemStatus", row.original.status, tEnums)}
        </Badge>
      ),
    },
  ];

  // Handle row click
  const handleRowClick = (item: PayrollItem) => {
    setSelectedItem(item);
  };

  return (
    <>
      <BaseTable
        columns={columns}
        data={items}
        showPagination={false}
        noResultsText={tCommon("noData")}
        onRowClick={handleRowClick}
      />

      {/* Item Detail Dialog */}
      {selectedItem && (
        <PayrollItemDetailDialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
          onAdjust={
            !isLocked
              ? () => {
                  setAdjustItem(selectedItem);
                  setSelectedItem(null);
                }
              : undefined
          }
        />
      )}

      {/* Adjustment Dialog */}
      {adjustItem && (
        <PayrollAdjustmentDialog
          open={!!adjustItem}
          onClose={() => setAdjustItem(null)}
          periodId={periodId}
          item={adjustItem}
          onSuccess={() => {
            setAdjustItem(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
