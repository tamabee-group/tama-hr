"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { CreditCard, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { PaymentStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { Button } from "@/components/ui/button";

import { payrollApi } from "@/lib/apis/payroll-api";
import { PayrollRecord } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface PaymentStatusTableProps {
  records: PayrollRecord[];
  onRefresh?: () => void;
}

/**
 * Component bảng trạng thái thanh toán
 * Hiển thị payment status per employee với pay/retry buttons
 */
export function PaymentStatusTable({
  records,
  onRefresh,
}: PaymentStatusTableProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  // State
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Handle pay single
  const handlePay = async (id: number) => {
    setLoadingId(id);
    try {
      await payrollApi.markAsPaid(id);
      toast.success(t("messages.paymentSuccess"));
      onRefresh?.();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoadingId(null);
    }
  };

  // Handle retry payment
  const handleRetry = async (id: number) => {
    setLoadingId(id);
    try {
      await payrollApi.retryPayment(id);
      toast.success(t("messages.paymentSuccess"));
      onRefresh?.();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoadingId(null);
    }
  };

  // Define columns
  const columns: ColumnDef<PayrollRecord>[] = [
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
      accessorKey: "netSalary",
      header: t("table.netSalary"),
      cell: ({ row }) => (
        <span className="font-bold text-green-600">
          {formatCurrency(row.original.netSalary, locale)}
        </span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: t("table.paymentStatus"),
      cell: ({ row }) => (
        <PaymentStatusBadge status={row.original.paymentStatus} />
      ),
    },
    {
      accessorKey: "paidAt",
      header: t("table.paidAt"),
      cell: ({ row }) => {
        if (!row.original.paidAt) return "-";
        return formatDateTime(row.original.paidAt, locale);
      },
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => {
        const record = row.original;
        const isLoading = loadingId === record.id;

        if (record.paymentStatus === "PAID") {
          return <span className="text-muted-foreground">-</span>;
        }

        if (record.paymentStatus === "FAILED") {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRetry(record.id)}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {t("actions.retry")}
            </Button>
          );
        }

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePay(record.id)}
            disabled={isLoading}
          >
            <CreditCard className="h-4 w-4 mr-1" />
            {t("actions.pay")}
          </Button>
        );
      },
      size: 120,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("table.paymentStatus")}</h3>
      <BaseTable
        columns={columns}
        data={records}
        showPagination={false}
        noResultsText={tCommon("noData")}
      />
    </div>
  );
}
