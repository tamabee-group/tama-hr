"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Lock } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { PayrollItemStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  payrollApi,
  PayrollPreviewRecord,
} from "@/lib/apis/payroll-period-api";
import { YearMonth } from "@/types/attendance-records";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { PayrollDetailDialog } from "./_payroll-detail-dialog";

interface PayrollPreviewTableProps {
  period: YearMonth;
  onRefresh?: () => void;
}

/**
 * Component bảng xem trước lương
 * Hiển thị danh sách payroll records với breakdown và nút chốt lương
 */
export function PayrollPreviewTable({
  period,
  onRefresh,
}: PayrollPreviewTableProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  // State
  const [records, setRecords] = useState<PayrollPreviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<PayrollPreviewRecord | null>(null);

  // Fetch preview records
  const fetchPreview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await payrollApi.previewPayroll(period);
      setRecords(response?.records || []);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [period, tErrors]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Handle finalize payroll
  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await payrollApi.finalizePayroll(period);
      toast.success(t("messages.finalizeSuccess"));
      setShowFinalizeDialog(false);
      fetchPreview();
      onRefresh?.();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setFinalizing(false);
    }
  };

  // Check if any record is already finalized
  const hasFinalized = records.some(
    (r) => r.status === "FINALIZED" || r.status === "PAID",
  );

  // Define columns
  const columns: ColumnDef<PayrollPreviewRecord>[] = [
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
      accessorKey: "baseSalary",
      header: t("table.baseSalary"),
      cell: ({ row }) => {
        formatCurrency(row.original.baseSalary);
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
      header: t("table.status"),
      cell: ({ row }) => (
        <PayrollItemStatusBadge status={row.original.status} />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowFinalizeDialog(true)}
          disabled={records.length === 0 || hasFinalized}
        >
          <Lock className="h-4 w-4 mr-2" />
          {t("actions.finalize")}
        </Button>
      </div>

      {/* Table - click row để mở dialog */}
      <BaseTable
        columns={columns}
        data={records}
        showPagination={false}
        noResultsText={tCommon("noData")}
        onRowClick={(record) => setSelectedRecord(record)}
      />

      {/* Detail Dialog */}
      <PayrollDetailDialog
        record={selectedRecord}
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      />

      {/* Finalize Confirmation Dialog */}
      <AlertDialog
        open={showFinalizeDialog}
        onOpenChange={setShowFinalizeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("actions.finalize")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("messages.confirmFinalize")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalize} disabled={finalizing}>
              {finalizing ? tCommon("loading") : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
