"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit } from "lucide-react";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { PayrollItem } from "@/types/attendance-records";
import {
  PayrollPeriodStatus,
  PayrollItemStatus,
} from "@/types/attendance-enums";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { PayrollItemDetailDialog } from "./_payroll-item-detail-dialog";
import { PayrollAdjustmentDialog } from "./_payroll-adjustment-dialog";

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
      accessorKey: "calculatedBaseSalary",
      header: t("table.baseSalary"),
      cell: ({ row }) => {
        formatCurrency(row.original.calculatedBaseSalary);
      },
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
      accessorKey: "grossSalary",
      header: t("table.grossSalary"),
      cell: ({ row }) => {
        formatCurrency(row.original.grossSalary);
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
        <Badge variant={getItemStatusBadgeVariant(row.original.status)}>
          {getEnumLabel("payrollItemStatus", row.original.status, tEnums)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItem(item)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {!isLocked && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAdjustItem(item)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
      size: 100,
    },
  ];

  return (
    <>
      <BaseTable
        columns={columns}
        data={items}
        showPagination={false}
        noResultsText={tCommon("noData")}
      />

      {/* Item Detail Dialog */}
      {selectedItem && (
        <PayrollItemDetailDialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          periodId={periodId}
          item={selectedItem}
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
