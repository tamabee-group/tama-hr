"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Lock,
  CreditCard,
  Bell,
  Download,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import {
  PayrollStatusBadge,
  PaymentStatusBadge,
} from "@/app/[locale]/_components/_shared/_status-badge";
import { Card, CardContent } from "@/components/ui/card";
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

import { payrollApi } from "@/lib/apis/payroll-api";
import {
  PayrollRecord,
  PayrollSummary,
  YearMonth,
} from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { PaymentStatusTable } from "./_payment-status-table";

interface PayrollPeriodDetailProps {
  period: YearMonth;
}

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 50;

/**
 * Component chi tiết bảng lương theo kỳ
 * Hiển thị summary, records list và các actions
 */
export function PayrollPeriodDetail({ period }: PayrollPeriodDetailProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [showPayAllDialog, setShowPayAllDialog] = useState(false);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, recordsData] = await Promise.all([
        payrollApi.getPayrollSummary(period),
        payrollApi.getPayrollRecords(DEFAULT_PAGE, DEFAULT_LIMIT, {
          year: period.year,
          month: period.month,
        }),
      ]);
      setSummary(summaryData);
      setRecords(recordsData.content);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [period, tErrors]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check status
  const isFinalized = records.some(
    (r) => r.status === "FINALIZED" || r.status === "PAID",
  );
  const allPaid = records.every((r) => r.paymentStatus === "PAID");

  // Handle finalize
  const handleFinalize = async () => {
    setActionLoading("finalize");
    try {
      await payrollApi.finalizePayroll(period);
      toast.success(t("messages.finalizeSuccess"));
      setShowFinalizeDialog(false);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle pay all
  const handlePayAll = async () => {
    setActionLoading("payAll");
    try {
      await payrollApi.payAll(period);
      toast.success(t("messages.paymentSuccess"));
      setShowPayAllDialog(false);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle send notifications
  const handleSendNotifications = async () => {
    setActionLoading("notify");
    try {
      await payrollApi.sendNotifications(period);
      toast.success(t("messages.notificationSent"));
      setShowNotifyDialog(false);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle export CSV
  const handleExportCsv = async () => {
    setActionLoading("csv");
    try {
      const blob = await payrollApi.exportCsv(period);
      downloadBlob(blob, `payroll-${period.year}-${period.month}.csv`);
      toast.success(t("messages.exportSuccess"));
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle export PDF
  const handleExportPdf = async () => {
    setActionLoading("pdf");
    try {
      const blob = await payrollApi.exportPdf(period);
      downloadBlob(blob, `payroll-${period.year}-${period.month}.pdf`);
      toast.success(t("messages.exportSuccess"));
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle view record detail
  const handleViewDetail = (id: number) => {
    router.push(`/${locale}/company/payroll/records/${id}`);
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
      accessorKey: "baseSalary",
      header: t("table.baseSalary"),
      cell: ({ row }) => formatCurrency(row.original.baseSalary, locale),
    },
    {
      accessorKey: "totalOvertimePay",
      header: t("table.overtime"),
      cell: ({ row }) => {
        const overtime = row.original.totalOvertimePay;
        if (!overtime || overtime === 0) return "-";
        return (
          <span className="text-blue-600">
            {formatCurrency(overtime, locale)}
          </span>
        );
      },
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
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => <PayrollStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "paymentStatus",
      header: t("table.paymentStatus"),
      cell: ({ row }) => (
        <PaymentStatusBadge status={row.original.paymentStatus} />
      ),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(row.original.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      size: 80,
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
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.totalEmployees")}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.totalEmployees}
              </p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.totalPayroll")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalNetSalary, locale)}
              </p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.totalOvertime")}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.totalOvertimePay, locale)}
              </p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("summary.totalAllowances")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalAllowances, locale)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {!isFinalized && (
          <Button
            onClick={() => setShowFinalizeDialog(true)}
            disabled={records.length === 0}
          >
            <Lock className="h-4 w-4 mr-2" />
            {t("actions.finalize")}
          </Button>
        )}

        {isFinalized && !allPaid && (
          <Button onClick={() => setShowPayAllDialog(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            {t("actions.payAll")}
          </Button>
        )}

        {isFinalized && (
          <Button variant="outline" onClick={() => setShowNotifyDialog(true)}>
            <Bell className="h-4 w-4 mr-2" />
            {t("actions.sendNotification")}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleExportCsv}
          disabled={actionLoading === "csv"}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("actions.exportCsv")}
        </Button>

        <Button
          variant="outline"
          onClick={handleExportPdf}
          disabled={actionLoading === "pdf"}
        >
          <FileText className="h-4 w-4 mr-2" />
          {t("actions.exportPdf")}
        </Button>
      </div>

      {/* Payment Status Table (if finalized) */}
      {isFinalized && (
        <PaymentStatusTable records={records} onRefresh={fetchData} />
      )}

      {/* Records Table (if not finalized) */}
      {!isFinalized && (
        <BaseTable
          columns={columns}
          data={records}
          showPagination={false}
          noResultsText={tCommon("noData")}
        />
      )}

      {/* Finalize Dialog */}
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
            <AlertDialogAction
              onClick={handleFinalize}
              disabled={actionLoading === "finalize"}
            >
              {actionLoading === "finalize"
                ? tCommon("loading")
                : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pay All Dialog */}
      <AlertDialog open={showPayAllDialog} onOpenChange={setShowPayAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("actions.payAll")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("messages.confirmPayAll")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePayAll}
              disabled={actionLoading === "payAll"}
            >
              {actionLoading === "payAll"
                ? tCommon("loading")
                : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notify Dialog */}
      <AlertDialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("actions.sendNotification")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("messages.confirmNotify")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendNotifications}
              disabled={actionLoading === "notify"}
            >
              {actionLoading === "notify"
                ? tCommon("loading")
                : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Helper function để download blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
