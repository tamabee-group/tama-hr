import { useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import {
  PayrollStatusBadge,
  PayrollItemStatusBadge,
} from "@/app/[locale]/_components/_shared/_status-badge";
import { CurrencyDisplay } from "@/app/[locale]/_components/_shared/_currency-display";

import { PayrollItem } from "@/types/attendance-records";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { Spinner } from "@/components/ui/spinner";

interface PayslipTableProps {
  payslips: PayrollItem[];
  onViewDetail: (payslip: PayrollItem) => void;
  onDownload?: (payslip: PayrollItem) => void;
  downloadingId?: number | null;
  loading?: boolean;
}

/**
 * Shared component hiển thị danh sách payslip dạng table
 * Dùng chung cho /employee/payroll và /company/employees/[id]?tab=salary
 */
export function PayslipTable({
  payslips,
  onViewDetail,
  onDownload,
  downloadingId,
  loading,
}: PayslipTableProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  // Format period
  const formatPeriod = useCallback(
    (year: number, month: number) => {
      if (locale === "ja") {
        return `${year}年${month}月`;
      }
      return `${month}/${year}`;
    },
    [locale],
  );

  // Table columns
  const columns: ColumnDef<PayrollItem>[] = useMemo(
    () => [
      {
        accessorKey: "stt",
        header: "#",
        cell: ({ row }) => row.index + 1,
        size: 50,
      },
      {
        accessorKey: "period",
        header: t("table.period"),
        cell: ({ row }) => (
          <span className="font-medium text-primary underline underline-offset-3 decoration-(--blue) hover:text-(--blue-light)">
            {row.original.year && row.original.month
              ? formatPeriod(row.original.year, row.original.month)
              : "-"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: tCommon("status"),
        cell: ({ row }) => {
          return (
            <div className="flex gap-1">
              <PayrollItemStatusBadge status={row.original.status} />
            </div>
          );
        },
      },
      {
        accessorKey: "baseSalary",
        header: t("breakdown.baseSalary"),
        cell: ({ row }) => <CurrencyDisplay amount={row.original.baseSalary} />,
      },
      {
        accessorKey: "totalOvertimePay",
        header: t("breakdown.overtime"),
        cell: ({ row }) => (
          <CurrencyDisplay amount={row.original.totalOvertimePay} />
        ),
      },
      {
        accessorKey: "totalAllowances",
        header: t("breakdown.allowances"),
        cell: ({ row }) => (
          <CurrencyDisplay amount={row.original.totalAllowances} />
        ),
      },
      {
        accessorKey: "totalDeductions",
        header: t("breakdown.deductions"),
        cell: ({ row }) => (
          <CurrencyDisplay
            amount={-row.original.totalDeductions}
            className="text-red-600"
          />
        ),
      },
      {
        accessorKey: "netSalary",
        header: t("breakdown.netSalary"),
        cell: ({ row }) => (
          <CurrencyDisplay
            amount={row.original.netSalary}
            className="font-semibold text-green-600"
          />
        ),
      },
      ...(onDownload
        ? [
            {
              id: "actions",
              header: "",
              cell: ({ row }: { row: { original: PayrollItem } }) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(row.original);
                  }}
                  disabled={downloadingId === row.original.id}
                >
                  {downloadingId === row.original.id ? (
                    <Spinner />
                  ) : (
                    <Download />
                  )}
                </Button>
              ),
              size: 50,
            } as ColumnDef<PayrollItem>,
          ]
        : []),
    ],
    [t, tCommon, onDownload, downloadingId, formatPeriod],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  return (
    <BaseTable
      columns={columns}
      data={payslips}
      onRowClick={onViewDetail}
      pageSize={20}
      noResultsText={t("messages.noPayslip")}
      previousText={tCommon("previous")}
      nextText={tCommon("next")}
    />
  );
}
